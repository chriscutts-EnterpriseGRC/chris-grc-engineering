'use strict';

require('dotenv').config();

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const auth = require('./middleware/auth');
const rateLimit = require('./middleware/rateLimit');
const piiScrubber = require('./middleware/piiScrubber');
const promptGuard = require('./middleware/promptGuard');
const { logRequest, logResponse } = require('./lib/auditLogger');
const { chat } = require('./lib/llmClient');
const policy = require('./policies/tool-calls');

const app = express();
app.use(express.json({ limit: '1mb' }));

// Attach a request ID to every request for end-to-end trace correlation
app.use((req, _res, next) => {
  req.requestId = uuidv4();
  next();
});

app.get('/healthz', (_req, res) => res.json({ status: 'ok', model: process.env.LLM_MODEL }));

app.post(
  '/v1/chat',
  auth,
  rateLimit,
  piiScrubber,
  promptGuard,
  async (req, res) => {
    const { messages, system, tools } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const approvedBy = req.headers['x-approved-by'] || null;
    const writeOperation = Boolean(req.body.write_operation);
    const { id: callerId, role: callerRole } = req.caller;

    // OPA policy check for tool calls
    if (tools?.length || writeOperation) {
      const decision = policy.evaluate({ callerId, callerRole, writeOperation, approvedBy });
      if (!decision.allow) {
        return res.status(403).json({ error: 'Forbidden', reason: decision.reason });
      }
    }

    logRequest({
      requestId: req.requestId,
      callerId,
      callerRole,
      messages,
      tools,
      writeOperation,
      approvedBy,
    });

    const start = Date.now();
    let result;
    try {
      result = await chat({ system, messages, tools });
    } catch (err) {
      process.stderr.write(JSON.stringify({
        level: 'ERROR',
        event_type: 'llm_error',
        request_id: req.requestId,
        caller_id: callerId,
        error: err.message,
        timestamp: new Date().toISOString(),
      }) + '\n');
      return res.status(502).json({ error: 'Upstream LLM error', detail: err.message });
    }

    logResponse({
      requestId: req.requestId,
      callerId,
      content: result.content,
      usage: result.usage,
      durationMs: Date.now() - start,
    });

    res.json({
      request_id: req.requestId,
      content: result.content,
      usage: result.usage,
      stop_reason: result.stop_reason,
      model: result.model,
    });
  }
);

// Unhandled errors
app.use((err, _req, res, _next) => {
  process.stderr.write(JSON.stringify({
    level: 'ERROR',
    event_type: 'unhandled_error',
    error: err.message,
    timestamp: new Date().toISOString(),
  }) + '\n');
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = parseInt(process.env.PORT || '3100', 10);
app.listen(PORT, () => {
  process.stdout.write(JSON.stringify({
    level: 'INFO',
    event_type: 'gateway_started',
    port: PORT,
    model: process.env.LLM_MODEL,
    timestamp: new Date().toISOString(),
  }) + '\n');
});

module.exports = app;
