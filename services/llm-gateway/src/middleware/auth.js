'use strict';

const jwt = require('jsonwebtoken');
const { logAuthFailure } = require('../lib/auditLogger');

// Accepts two credential types:
//   1. Supabase JWT (HS256, signed with SUPABASE_JWT_SECRET) — dashboard and user-facing callers
//   2. Service token (opaque Bearer token matching GATEWAY_SERVICE_TOKEN) — adapters and MCP server
//
// Sets req.caller = { id, role } for downstream middleware.

function auth(req, res, next) {
  const requestId = req.requestId;
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    logAuthFailure({ requestId, reason: 'missing_authorization_header' });
    return res.status(401).json({ error: 'Authorization header required' });
  }

  const token = authHeader.slice(7);

  // Service token check (constant-time comparison)
  const serviceToken = process.env.GATEWAY_SERVICE_TOKEN;
  if (serviceToken && timingSafeEqual(token, serviceToken)) {
    req.caller = { id: 'service', role: 'mcp_server' };
    return next();
  }

  // Supabase JWT
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    logAuthFailure({ requestId, reason: 'jwt_secret_not_configured' });
    return res.status(500).json({ error: 'Gateway misconfiguration' });
  }

  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    req.caller = {
      id: payload.sub,
      role: payload.role || 'authenticated',
    };
    return next();
  } catch (err) {
    logAuthFailure({ requestId, reason: err.message });
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Node's crypto.timingSafeEqual requires same-length Buffers.
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  const crypto = require('crypto');
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

module.exports = auth;
