import { randomUUID } from 'crypto';
import { ZodError } from 'zod';
import { requestLogger } from './logger.js';

export default function withApiHandler(fn) {
  return async function handler(req, res) {
    const requestId = req.headers['x-request-id'] || randomUUID();
    res.setHeader('x-request-id', requestId);
    const log = requestLogger({
      route: req.url,
      method: req.method,
      requestId,
      userId: req.user?.id,
    });
    req.log = log;
    log.info('request_start');
    try {
      await fn(req, res);
    } catch (err) {
      log.error({ err: err.message, stack: err.stack });
      if (res.headersSent) return;
      if (err.name === 'ValidationError') {
        return res
          .status(400)
          .json({ error: 'validation_error', details: err.details });
      }
      if (err instanceof ZodError) {
        return res
          .status(400)
          .json({ error: 'validation_error', details: err.flatten() });
      }
      if (err.name === 'NotFoundError') {
        return res.status(404).json({ error: 'not_found' });
      }
      if (err.name === 'ForbiddenError') {
        return res.status(403).json({ error: 'forbidden' });
      }
      const body = { error: 'internal_error' };
      if (process.env.NODE_ENV === 'development') {
        body.message = err.message;
        body.stack = err.stack;
      }
      res.status(500).json(body);
    }
  };
}
