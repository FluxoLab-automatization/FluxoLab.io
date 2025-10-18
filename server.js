require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');

const logger = require('./lib/logger');
const { ensureLeadingSlash } = require('./lib/security');
const repository = require('./db/repository');
const conversationsRepository = require('./db/conversations');
const activitiesRepository = require('./db/activities');
const userRepository = require('./db/users');
const { generateToken, comparePassword, hashPassword } = require('./lib/auth');
const authenticate = require('./middleware/authenticate');
const overviewService = require('./services/overview');
const { shutdown } = require('./db');

const app = express();

const PORT = Number(process.env.PORT || 3000);
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const RECEIVING_BASE_PATH = ensureLeadingSlash(
  process.env.RECEIVING_BASE_PATH || '/webhooks'
);
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'SET_VERIFY_TOKEN';
const APP_SECRET = process.env.APP_SECRET || '';
const SIGNUP_ACCESS_TOKEN = process.env.SIGNUP_ACCESS_TOKEN || '';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
];

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : DEFAULT_ALLOWED_ORIGINS
)
  .map((origin) => origin.trim())
  .filter(Boolean);

const RATE_LIMIT_WINDOW_MS = Number(
  process.env.RATE_LIMIT_WINDOW_MS || 60_000
);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 120);

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    logger.warn({ origin }, 'Origin blocked by CORS policy');
    return cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(
  rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(
  express.json({
    type: ['application/json', 'application/*+json'],
    verify: (req, _res, buf) => {
      req.rawBody = Buffer.from(buf);
    },
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
      },
      'http_request'
    );
  });
  next();
});

const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

const registerSchema = z
  .object({
    email: z.string().email('Informe um e-mail válido'),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    displayName: z.string().min(2, 'Informe o nome de exibição'),
    avatarColor: z
      .string()
      .trim()
      .regex(/^#[0-9A-Fa-f]{6}$/i, 'Cor deve estar no formato hexadecimal (#RRGGBB)')
      .optional(),
    accessToken: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (SIGNUP_ACCESS_TOKEN && data.accessToken !== SIGNUP_ACCESS_TOKEN) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Token de acesso inválido para registro.',
        path: ['accessToken'],
      });
    }
  });

function presentUser(userRow) {
  return {
    id: userRow.id,
    email: userRow.email,
    displayName: userRow.display_name,
    avatarColor: userRow.avatar_color,
    lastLoginAt: userRow.last_login_at,
  };
}

function presentConversation(row) {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function presentActivity(row) {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    action: row.action,
    payload: row.payload || {},
    createdAt: row.created_at,
  };
}

app.post('/auth/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body || {});
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join('; ');
      return res.status(422).json({ status: 'error', message });
    }

    const { email, password } = parsed.data;

    const user = await userRepository.findByEmail(email);
    if (!user) {
      logger.warn({ email }, 'Login attempt with unknown email');
      return res
        .status(401)
        .json({ status: 'error', message: 'Credenciais inválidas.' });
    }

    const passwordOk = await comparePassword(password, user.password_hash);
    if (!passwordOk) {
      logger.warn({ userId: user.id }, 'Login attempt with wrong password');
      return res
        .status(401)
        .json({ status: 'error', message: 'Credenciais inválidas.' });
    }

    await userRepository.touchLastLogin(user.id);

    const token = generateToken({
      sub: user.id,
      email: user.email,
    });

    return res.json({
      status: 'ok',
      token,
      user: presentUser(user),
    });
  } catch (err) {
    logger.error({ err }, 'Failed to login user');
    return next(err);
  }
});

app.post('/auth/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body || {});
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join('; ');
      return res.status(422).json({ status: 'error', message });
    }

    if (SIGNUP_ACCESS_TOKEN && parsed.data.accessToken !== SIGNUP_ACCESS_TOKEN) {
      return res
        .status(403)
        .json({ status: 'error', message: 'Token de acesso inválido para registro.' });
    }

    const existing = await userRepository.findByEmail(parsed.data.email);
    if (existing) {
      return res
        .status(409)
        .json({ status: 'error', message: 'E-mail já cadastrado.' });
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const newUser = await userRepository.createUser({
      email: parsed.data.email,
      passwordHash,
      displayName: parsed.data.displayName,
      avatarColor: parsed.data.avatarColor || '#6366F1',
    });

    logger.info({ userId: newUser.id }, 'User registered');

    return res.status(201).json({
      status: 'created',
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.display_name,
        avatarColor: newUser.avatar_color,
      },
    });
  } catch (err) {
    logger.error({ err }, 'Failed to register user');
    return next(err);
  }
});

app.get('/auth/me', authenticate, (req, res) => {
  const user = presentUser(req.auth.user);
  return res.json({
    status: 'ok',
    user,
  });
});

app.get('/workspace/overview', authenticate, async (req, res, next) => {
  try {
    const overview = await overviewService.buildOverview(req.auth.user);
    return res.json({
      status: 'ok',
      overview,
    });
  } catch (err) {
    logger.error({ err }, 'Failed to build workspace overview');
    return next(err);
  }
});

app.get('/workspace/projects', authenticate, async (req, res, next) => {
  try {
    const projects = await conversationsRepository.listRecentByOwner(
      req.auth.user.id,
      { limit: Number(req.query.limit || 12) }
    );
    return res.json({
      status: 'ok',
      projects: projects.map(presentConversation),
    });
  } catch (err) {
    logger.error({ err }, 'Failed to list projects');
    return next(err);
  }
});

app.get('/workspace/activities', authenticate, async (req, res, next) => {
  try {
    const activities = await activitiesRepository.listRecentByUser(
      req.auth.user.id,
      { limit: Number(req.query.limit || 12) }
    );
    return res.json({
      status: 'ok',
      activities: activities.map(presentActivity),
    });
  } catch (err) {
    logger.error({ err }, 'Failed to list activities');
    return next(err);
  }
});

function legacyRouteDeprecated(targetResolver) {
  return (req, res) => {
    const target = targetResolver(req);
    logger.warn(
      {
        legacyPath: req.originalUrl,
        suggestedPath: target,
      },
      'Legacy webhook route invoked after NestJS migration'
    );
    return res.status(410).json({
      status: 'deprecated',
      message: 'This webhook endpoint moved to the NestJS API.',
      target,
    });
  };
}

function appendQuery(req) {
  const original = req.originalUrl || '';
  const queryStart = original.indexOf('?');
  return queryStart >= 0 ? original.slice(queryStart) : '';
}

app.get(
  '/workspace/webhooks/recent',
  authenticate,
  legacyRouteDeprecated(() => '/api/workspace/webhooks/recent')
);

app.post(
  '/generate-webhook',
  legacyRouteDeprecated(() => '/api/generate-webhook')
);

app.get(
  `${RECEIVING_BASE_PATH}/:token`,
  legacyRouteDeprecated((req) => `/api/webhooks/${req.params.token}${appendQuery(req)}`)
);

app.post(
  `${RECEIVING_BASE_PATH}/:token`,
  legacyRouteDeprecated((req) => `/api/webhooks/${req.params.token}${appendQuery(req)}`)
);

app.use((err, _req, res, _next) => {
  if (err && /not allowed by CORS/i.test(err.message)) {
    return res.status(403).json({ status: 'error', message: err.message });
  }

  const status = err.status || 500;
  const message =
    status >= 500 ? 'Internal server error.' : err.message || 'Request error.';

  logger.error({ err, status }, 'Unhandled error');

  return res.status(status).json({ status: 'error', message });
});

async function start() {
  try {
    await repository.healthCheck();
  } catch (err) {
    logger.error({ err }, 'Database connection failed');
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    logger.info('===============================================================');
    logger.info('Legacy Express server online (webhook routes now proxied to NestJS).');
    logger.info(`Use Nest endpoints: POST ${BASE_URL}/api/generate-webhook`);
    logger.info(
      `and GET/POST ${BASE_URL}/api/webhooks/:token`
    );
    logger.info('Configure BASE_URL, VERIFY_TOKEN, APP_SECRET, and DATABASE_URL.');
    logger.info('===============================================================');
  });

  const gracefulShutdown = async (signal) => {
    logger.info({ signal }, 'Received shutdown signal');
    server.close(async () => {
      await shutdown();
      process.exit(0);
    });
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}

start().catch((err) => {
  logger.error({ err }, 'Fatal bootstrap error');
  process.exit(1);
});
