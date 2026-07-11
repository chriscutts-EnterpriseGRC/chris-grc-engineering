'use strict';

const crypto = require('crypto');

// Emits NDJSON to stdout — CloudWatch agent ships these to /grc/audit.
// Field names match the metric filter patterns in infrastructure/cloudwatch/metric-filters.tf.

function sha256(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function emit(fields) {
  process.stdout.write(JSON.stringify({ timestamp: new Date().toISOString(), ...fields }) + '\n');
}

function logRequest({ requestId, callerId, callerRole, messages, tools, writeOperation, approvedBy }) {
  emit({
    level: 'AUDIT',
    event_type: tools?.length ? 'mcp_tool_call' : 'llm_request',
    request_id: requestId,
    caller_id: callerId,
    caller_role: callerRole,
    input_hash: sha256(messages),
    model_version: process.env.LLM_MODEL,
    write_operation: writeOperation ?? false,
    ...(approvedBy ? { approved_by: approvedBy } : {}),
    tool_count: tools?.length ?? 0,
  });
}

function logResponse({ requestId, callerId, content, usage, durationMs }) {
  emit({
    level: 'AUDIT',
    event_type: 'llm_response',
    request_id: requestId,
    caller_id: callerId,
    output_hash: sha256(content),
    model_version: process.env.LLM_MODEL,
    input_tokens: usage?.input_tokens,
    output_tokens: usage?.output_tokens,
    duration_ms: durationMs,
  });
}

function logPromptInjection({ requestId, callerId, matchedPattern }) {
  emit({
    level: 'AUDIT',
    event_type: 'security_alert',
    alert_type: 'prompt_injection_attempt',
    request_id: requestId,
    caller_id: callerId,
    matched_pattern: matchedPattern,
  });
}

function logAuthFailure({ requestId, reason }) {
  emit({
    level: 'AUDIT',
    event_type: 'auth_failure',
    request_id: requestId,
    reason,
  });
}

function logRateLimit({ requestId, callerId }) {
  emit({
    level: 'AUDIT',
    event_type: 'authz_denied',
    request_id: requestId,
    caller_id: callerId,
    reason: 'rate_limit_exceeded',
  });
}

module.exports = { logRequest, logResponse, logPromptInjection, logAuthFailure, logRateLimit };
