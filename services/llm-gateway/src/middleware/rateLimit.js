'use strict';

const { logRateLimit } = require('../lib/auditLogger');

// In-memory sliding window rate limiter, keyed by caller ID.
// For multi-instance deployments, replace the Map with a Redis counter.

const MAX = parseInt(process.env.RATE_LIMIT_MAX || '60', 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);

// callerId → array of request timestamps
const windows = new Map();

function rateLimit(req, res, next) {
  const callerId = req.caller?.id || req.ip;
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  let timestamps = windows.get(callerId) || [];
  // Drop entries outside the window
  timestamps = timestamps.filter(t => t > cutoff);

  if (timestamps.length >= MAX) {
    logRateLimit({ requestId: req.requestId, callerId });
    res.set('Retry-After', Math.ceil(WINDOW_MS / 1000));
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  timestamps.push(now);
  windows.set(callerId, timestamps);
  next();
}

module.exports = rateLimit;
