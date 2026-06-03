'use strict';

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Model is pinned here — all callers use the same version.
// To upgrade: change LLM_MODEL env var and redeploy; no code change needed.
const MODEL = process.env.LLM_MODEL || 'claude-sonnet-4-6';
const MAX_TOKENS = parseInt(process.env.LLM_MAX_TOKENS || '4096', 10);

async function chat({ system, messages, tools }) {
  const params = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages,
  };

  if (system) params.system = system;
  if (tools?.length) params.tools = tools;

  const response = await client.messages.create(params);

  return {
    content: response.content,
    usage: response.usage,
    stop_reason: response.stop_reason,
    model: response.model,
  };
}

module.exports = { chat };
