import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
});

export function requestLogger({ route, method, requestId, userId }) {
  return logger.child({
    route,
    method,
    requestId,
    ...(userId ? { userId } : {}),
  });
}

export default logger;
