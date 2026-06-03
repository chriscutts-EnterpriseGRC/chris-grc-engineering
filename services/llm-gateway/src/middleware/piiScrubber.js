'use strict';

// Redacts PII from request messages before they leave the perimeter.
// Matches the scrubbing spec in docs/LOGGING-STRATEGY.md §PII.
// Closes the RSK-004 gap (no DPA with OpenAI) by stripping PII before any
// prompt reaches an upstream model.

const SENSITIVE_KEYS = /^(password|passwd|secret|token|api_key|apikey|access_key|private_key|credential|auth|authorization|ssn|dob|date_of_birth|card_number|cvv|pan)$/i;

const EMAIL_RE = /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g;
const PHONE_RE = /\b(\+?[\d\s\-().]{7,15})\b/g;
const CREDIT_CARD_RE = /\b(?:\d[ \-]?){13,16}\b/g;

function scrubValue(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(EMAIL_RE, '[REDACTED_EMAIL]')
    .replace(CREDIT_CARD_RE, '[REDACTED_CARD]')
    .replace(PHONE_RE, (match) => {
      // Only redact if it looks like a real phone number (7+ digits)
      const digits = match.replace(/\D/g, '');
      return digits.length >= 7 ? '[REDACTED_PHONE]' : match;
    });
}

function scrubObject(obj) {
  if (Array.isArray(obj)) return obj.map(scrubObject);
  if (obj === null || typeof obj !== 'object') return scrubValue(obj);

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.test(key)) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = scrubObject(value);
    }
  }
  return result;
}

function scrubMessages(messages) {
  return messages.map(msg => {
    if (typeof msg.content === 'string') {
      return { ...msg, content: scrubValue(msg.content) };
    }
    if (Array.isArray(msg.content)) {
      return {
        ...msg,
        content: msg.content.map(block => {
          if (block.type === 'text') return { ...block, text: scrubValue(block.text) };
          return block;
        }),
      };
    }
    return msg;
  });
}

function piiScrubber(req, res, next) {
  if (req.body.messages) req.body.messages = scrubMessages(req.body.messages);
  if (req.body.system) req.body.system = scrubValue(req.body.system);
  next();
}

module.exports = piiScrubber;
