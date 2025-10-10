const { verifyToken } = require('../lib/auth');
const userRepository = require('../db/users');

async function authenticate(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    const token = extractBearerToken(header);

    if (!token) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Token de autenticação ausente.' });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Token inválido ou expirado.' });
    }

    if (!payload?.sub) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Token inválido.' });
    }

    const user = await userRepository.findById(payload.sub);
    if (!user) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Usuário não encontrado.' });
    }

    req.auth = {
      token,
      payload,
      user,
    };

    return next();
  } catch (err) {
    return next(err);
  }
}

function extractBearerToken(headerValue) {
  if (!headerValue) return '';
  const [scheme, token] = headerValue.trim().split(/\s+/);
  if (!scheme || !token) return '';
  if (/^Bearer$/i.test(scheme)) {
    return token.trim();
  }
  return '';
}

authenticate._extractBearerToken = extractBearerToken;

module.exports = authenticate;
