'use strict';

const { logPromptInjection } = require('../lib/auditLogger');

// Detects prompt injection attempts (OWASP LLM01).
// Patterns target common jailbreaks and system prompt override attempts.
// PROMPT_INJECTION_ACTION=block → 400; =flag → allow through, audit event still fires.

const INJECTION_PATTERNS = [
  { re: /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i, label: 'ignore_previous_instructions' },
  { re: /disregard\s+(all\s+)?(previous|prior|above|your)\s+(instructions?|guidelines?|rules?)/i, label: 'disregard_instructions' },
  { re: /forget\s+(all\s+)?(previous|your)\s+(instructions?|context|guidelines?)/i, label: 'forget_instructions' },
  { re: /you\s+are\s+now\s+(a\s+|an\s+)?(?!grc|assistant)/i, label: 'persona_override' },
  { re: /act\s+as\s+(if\s+you\s+(are|were)\s+)?(?!a\s+security|an?\s+assistant)/i, label: 'act_as_override' },
  { re: /pretend\s+(you\s+are|to\s+be)\s+/i, label: 'pretend_override' },
  { re: /\[system\]\s*:/i, label: 'fake_system_tag' },
  { re: /<\s*system\s*>/i, label: 'fake_system_xml' },
  { re: /your\s+(true\s+)?instructions?\s+(are|is)\s+to/i, label: 'instruction_replacement' },
  { re: /do\s+anything\s+now/i, label: 'dan_jailbreak' },
  { re: /jailbreak/i, label: 'jailbreak_keyword' },
  { re: /override\s+(safety|ethical|moral)\s+(guidelines?|restrictions?|filters?)/i, label: 'safety_override' },
];

function extractText(messages) {
  return messages.flatMap(msg => {
    if (typeof msg.content === 'string') return [msg.content];
    if (Array.isArray(msg.content)) {
      return msg.content.filter(b => b.type === 'text').map(b => b.text);
    }
    return [];
  }).join('\n');
}

function promptGuard(req, res, next) {
  const text = extractText(req.body.messages || []);
  const action = process.env.PROMPT_INJECTION_ACTION || 'block';

  for (const { re, label } of INJECTION_PATTERNS) {
    if (re.test(text)) {
      logPromptInjection({ requestId: req.requestId, callerId: req.caller?.id, matchedPattern: label });

      if (action === 'block') {
        return res.status(400).json({ error: 'Request blocked: prompt injection pattern detected' });
      }
      // flag mode: attach marker so downstream audit has context
      req.injectionFlag = label;
      break;
    }
  }

  next();
}

module.exports = promptGuard;
