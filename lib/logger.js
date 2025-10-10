const pino = require('pino');

const usePrettyTransport =
  process.env.NODE_ENV !== 'production' &&
  process.env.PINO_PRETTY !== 'false';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(usePrettyTransport
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
});

module.exports = logger;
