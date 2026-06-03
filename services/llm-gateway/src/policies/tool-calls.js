'use strict';

// JavaScript mirror of tool-calls.rego — same logic, no OPA binary required.
// Keep in sync with tool-calls.rego whenever policy changes.

const WRITE_ROLES = new Set(['admin', 'security_engineer', 'mcp_server']);

function evaluate({ callerId, callerRole, writeOperation, approvedBy }) {
  if (!callerId) return { allow: false, reason: 'unauthenticated_caller' };

  if (!writeOperation) return { allow: true };

  if (!approvedBy) return { allow: false, reason: 'write_requires_approval' };

  if (!WRITE_ROLES.has(callerRole)) {
    return { allow: false, reason: 'insufficient_role_for_write' };
  }

  return { allow: true };
}

module.exports = { evaluate };
