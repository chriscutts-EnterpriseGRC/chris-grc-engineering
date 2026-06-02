# Logging Strategy

**Program:** Resilience Ops GRC Platform  
**Owner:** Security Engineering  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal  
**Frameworks:** SOC 2 CC7.2, ISO 27001 A.8.15–A.8.16, NIST CSF DE.AE, EU AI Act Art. 12 & 13, ISO 42001 9.1

---

## Purpose

This document defines the logging strategy for the Resilience Ops GRC Platform — covering log format, log levels, retention, PII handling, AI-specific audit requirements, and per-layer implementation guidance.

Logging serves four functions in this platform:

1. **Operational visibility** — detect errors and understand system behaviour in integration adapters, connectors, and the Lambda handler
2. **Security monitoring** — detect anomalies, unauthorized access, and active attacks across all layers
3. **Compliance evidence** — satisfy SOC 2 CC7.2, ISO 27001 A.8.15, and EU AI Act Art. 12 audit requirements
4. **AI decision auditability** — trace every AI-assisted GRC decision for human review and regulatory reporting under EU AI Act Art. 13 and ISO 42001 9.1

---

## Log Levels

| Level | When to use | Examples |
|-------|------------|---------|
| `ERROR` | Unrecoverable failure requiring immediate attention | Integration auth failure, DB connection lost, AI endpoint unreachable |
| `WARN` | Recoverable issue or unexpected condition | Supabase fetch fallback to mock data, adapter skipped due to missing vars |
| `INFO` | Normal lifecycle events worth recording | Sync started/completed, scan ingested, finding auto-triaged, AI decision logged |
| `DEBUG` | Detailed diagnostic data — dev/staging only | Request/response payloads, query timing, cache hits |
| `AUDIT` | Security-relevant and compliance-critical actions | Auth events, data access on SecTier 0/1 assets, AI model decisions, config changes |

> **Rule:** `DEBUG` is disabled in production by default. `AUDIT` is always enabled and must be persisted regardless of all other log level configuration.

---

## Structured Log Format

All services must emit **newline-delimited JSON (NDJSON)** to stdout. This format is natively ingested by CloudWatch Logs, Datadog, and OpenSearch without additional parsing.

### Mandatory Fields

```json
{
  "timestamp": "2026-06-02T14:23:01.456Z",
  "level": "INFO",
  "service": "grc-integrations",
  "message": "Sync completed",
  "correlation_id": "req-abc123",
  "environment": "production"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `timestamp` | ISO 8601 UTC | Millisecond precision |
| `level` | enum | `ERROR` \| `WARN` \| `INFO` \| `DEBUG` \| `AUDIT` |
| `service` | string | Component name — see [Service Names](#service-names) |
| `message` | string | Human-readable summary; never include PII |
| `correlation_id` | string | Request or job ID for end-to-end tracing |
| `environment` | string | `production` \| `staging` \| `development` |

### Extended Fields (include when applicable)

```json
{
  "user_id": "usr-789",
  "asset_id": "asset-001",
  "sec_tier": 0,
  "integration": "qualys",
  "row_count": 42,
  "duration_ms": 1203,
  "error": {
    "code": "SUPABASE_UPSERT_FAILED",
    "message": "duplicate key value"
  }
}
```

> **Never include** stack traces containing file paths or memory addresses in production logs. Log the error code and a safe message only.

### AI Decision Fields

Every AI-assisted action must produce an `AUDIT`-level log with the following fields — this is a hard requirement for EU AI Act Art. 12 compliance:

```json
{
  "level": "AUDIT",
  "event_type": "ai_decision",
  "agent": "vsrm-auto-triage",
  "model_version": "claude-sonnet-4-6",
  "input_hash": "sha256:3a7b...",
  "output_hash": "sha256:f9c2...",
  "decision": "P1",
  "confidence": "high",
  "reasoning_summary": "CVSS 8.1 + mature exploit + public production SecTier 0",
  "approved_by": null,
  "approval_required": true,
  "finding_id": "V-012",
  "correlation_id": "req-abc123"
}
```

| Field | Requirement |
|-------|------------|
| `input_hash` | SHA-256 of the full input — never log raw prompt content |
| `output_hash` | SHA-256 of the full output — never log raw model output |
| `reasoning_summary` | Human-readable summary of why the decision was made |
| `approved_by` | `null` until human review; populated on approval |
| `model_version` | Exact model identifier — required for audit trail |

---

## PII Scrubbing

Logging must never emit PII or sensitive values. This is a hard requirement in `PDLC-SECURITY-GUARDRAILS.md` and a prohibited pattern.

### Scrubbing Rules

| Data type | Required handling |
|-----------|------------------|
| Email addresses | Replace with `[email]` or hash to `sha256:<hash>` |
| Names and usernames | Replace with opaque user/asset ID |
| IP addresses (user) | Truncate last octet: `203.0.113.x` |
| API keys, tokens, secrets | Replace with `[REDACTED]` |
| Passwords | Never log under any circumstance |
| CVE full payload | Log CVE ID only (`CVE-2024-1234`) — not the full advisory text |
| AI model inputs/outputs | Log input/output hash only — never raw prompt or response content |

### Node.js Scrubber Implementation

Apply scrubbing at the logger level so no code path can bypass it:

```js
const REDACTED_KEYS = [
  'password', 'token', 'api_key', 'secret', 'authorization',
  'cookie', 'credential', 'private_key', 'access_token'
];

function scrub(obj, depth = 0) {
  if (depth > 10 || typeof obj !== 'object' || obj === null) return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      REDACTED_KEYS.some(r => k.toLowerCase().includes(r)) ? '[REDACTED]' : scrub(v, depth + 1)
    ])
  );
}

function log(level, message, fields = {}) {
  process.stdout.write(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    service: process.env.SERVICE_NAME || 'grc-platform',
    environment: process.env.NODE_ENV || 'development',
    message,
    ...scrub(fields)
  }) + '\n');
}

module.exports = {
  error: (msg, fields) => log('ERROR', msg, fields),
  warn:  (msg, fields) => log('WARN',  msg, fields),
  info:  (msg, fields) => log('INFO',  msg, fields),
  debug: (msg, fields) => process.env.NODE_ENV !== 'production' && log('DEBUG', msg, fields),
  audit: (msg, fields) => log('AUDIT', msg, fields),
};
```

---

## AI Security Logging

The GRC Platform deploys AI agents for auto-triage, risk treatment drafting, SLA monitoring, and compliance gap analysis (see [AI-GRC-ROADMAP.md](./AI-GRC-ROADMAP.md)). AI systems introduce unique logging requirements distinct from conventional application logging.

### AI Security Threat Coverage

| Threat (OWASP LLM Top 10) | Logging mitigation |
|---------------------------|-------------------|
| LLM01 — Prompt injection | Log injection attempts as `AUDIT` security alerts; block and log pattern matched |
| LLM02 — Insecure output handling | Log output validation failures; log output hash before rendering |
| LLM06 — Sensitive information disclosure | Log access to sensitive context; audit all AI reads of SecTier 0/1 data |
| LLM09 — Misinformation | Log confidence score with every decision; flag low-confidence outputs |
| LLM10 — Unbounded consumption | Log token counts and duration per call; alert on anomalous usage |

### Required Log Events for AI Actions

| Event | Level | Required fields |
|-------|-------|----------------|
| Agent invoked | INFO | `agent`, `model_version`, `trigger`, `input_hash` |
| Decision produced | AUDIT | `decision`, `confidence`, `reasoning_summary`, `output_hash` |
| Human approval received | AUDIT | `approved_by`, `approval_timestamp`, `approved_action` |
| Human override | AUDIT | `overridden_by`, `override_reason`, `original_decision` |
| Agent error / fallback | ERROR | `error_code`, `fallback_taken` |
| Prompt injection detected | AUDIT | `event_type: security_alert`, `alert_type: prompt_injection`, `blocked: true` |
| Sensitive data accessed by agent | AUDIT | `event_type: ai_data_access`, `asset_id`, `sec_tier`, `data_type` |
| Model version changed | AUDIT | `old_version`, `new_version`, `changed_by` |

### Prompt Injection Detection Log

```json
{
  "level": "AUDIT",
  "event_type": "security_alert",
  "alert_type": "prompt_injection_attempt",
  "service": "grc-mcp-server",
  "input_pattern_matched": "ignore_previous_instructions",
  "blocked": true,
  "agent": "vsrm-auto-triage",
  "correlation_id": "req-xyz789"
}
```

### MCP Tool Call Log (Phase 4)

Every call through the GRC MCP server must produce an `AUDIT` log — this is the primary EU AI Act Art. 12 evidence record:

```json
{
  "level": "AUDIT",
  "event_type": "mcp_tool_call",
  "tool": "score_vulnerability_vsrm",
  "caller_agent": "vsrm-auto-triage",
  "model_version": "claude-sonnet-4-6",
  "parameters_hash": "sha256:9d4f...",
  "result_summary": "P1",
  "duration_ms": 234,
  "correlation_id": "req-abc123",
  "write_operation": false
}
```

---

## Security Event Logging

The following events must produce an `AUDIT`-level log regardless of log level configuration:

| Event | Required fields |
|-------|----------------|
| Authentication success | `event_type: auth_success`, `user_id`, `method`, `ip_truncated` |
| Authentication failure | `event_type: auth_failure`, `user_id`, `method`, `ip_truncated`, `reason` |
| Authorization denial | `event_type: authz_denied`, `user_id`, `resource`, `action` |
| SecTier 0/1 data access | `event_type: data_access`, `asset_id`, `sec_tier`, `user_id`, `operation` |
| Integration credential rotation | `event_type: credential_rotated`, `integration`, `rotated_by` |
| Config or schema change | `event_type: config_change`, `changed_by`, `change_summary` |
| Scan result ingested | `event_type: scan_ingested`, `scanner`, `finding_count`, `high_severity_count` |
| P0 finding created | `event_type: p0_created`, `finding_id`, `asset_id`, `cvss_score` |
| Risk register entry created | `event_type: risk_created`, `risk_id`, `score`, `created_by` |

---

## Per-Layer Implementation Guide

### Service Names

| Layer | `service` value |
|-------|----------------|
| React frontend (future API endpoint) | `grc-dashboard` |
| Integration adapters | `grc-integrations` |
| Connector scripts | `grc-connector-<source>` (e.g. `grc-connector-aws`) |
| Python Lambda | `trust-center-lambda` |
| GRC MCP server (Phase 4) | `grc-mcp-server` |

### Layer 1: React Frontend (`dashboard/src/`)

Browser logs are not persisted. Current state: single `console.warn` in `api.js`.

- Use `console.error()` for API failures with generic messages — no stack traces or user data
- Do not log filter inputs, search queries, or any user-typed content
- Future: ship browser errors to a `/api/errors` endpoint that applies scrubbing before persisting to CloudWatch

Minimum to implement now in `api.js`:
```js
// Replace console.warn with structured error — no PII
console.error(JSON.stringify({ level: 'ERROR', service: 'grc-dashboard', message: 'Supabase fetch failed', table }));
```

### Layer 2: Node.js Integration Adapters (`dashboard/integrations/`)

Replace ad-hoc `console.log` / `console.error` with the structured logger. Minimum events:

| Event | Level |
|-------|-------|
| Adapter started | INFO |
| Credentials missing — adapter skipped | WARN |
| Upsert succeeded | INFO — include `row_count` |
| Upsert failed | ERROR — include `error.code`, never include credential values |
| Sync orchestration complete | INFO — include total row counts per adapter |

### Layer 3: Connector Scripts (`plugins/connectors/*/scripts/collect.js`)

The existing `--quiet` / stderr pattern is appropriate for CLI use. Extend it:

- Keep the `[SOURCE] message\n` stderr pattern for human-readable progress output
- Add a `--log-json` flag that emits structured NDJSON to stderr for use in automated pipelines
- JSON output (`--output=json`) to stdout is unchanged
- Auth failures and rate-limit events must log at `AUDIT` level even when `--quiet` is set

### Layer 4: Python Lambda (`plugins/trust-center/skills/trust-center/references/api-handler.py`)

Add a JSON formatter — Lambda ships stdout directly to CloudWatch:

```python
import json, logging, os

class JsonFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({
            'timestamp': self.formatTime(record, '%Y-%m-%dT%H:%M:%S')[:-3] + 'Z',
            'level': record.levelname,
            'service': 'trust-center-lambda',
            'environment': os.environ.get('ENVIRONMENT', 'production'),
            'function': os.environ.get('AWS_LAMBDA_FUNCTION_NAME'),
            'message': record.getMessage(),
        })

handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logger = logging.getLogger()
logger.handlers = [handler]
logger.setLevel(logging.INFO)
```

### Layer 5: GRC MCP Server (`grc-mcp-server/`, Phase 4)

Every tool call must emit an `AUDIT` log as the primary EU AI Act compliance record. See [MCP Tool Call Log](#mcp-tool-call-log-phase-4) above.

Additionally, log rate-limit enforcement:

```json
{
  "level": "WARN",
  "event_type": "rate_limit_enforced",
  "service": "grc-mcp-server",
  "tool": "create_risk",
  "caller_agent": "risk-treatment-drafter",
  "limit": "10/min",
  "correlation_id": "req-def456"
}
```

---

## Log Pipeline

```
Application layer (stdout NDJSON)
        │
        ▼
CloudWatch Logs (Lambda auto-ships; ECS requires log driver: awslogs)
        │
        ├──► CloudWatch Log Insights — ad-hoc security queries
        ├──► CloudWatch Metric Filters → Alarms (P0 created, auth failures)
        └──► S3 Glacier (archive for AUDIT logs — 3-year retention)

Connector scripts (stderr NDJSON via --log-json)
        │
        └──► CI pipeline log artifacts (2-year retention)
```

### CloudWatch Log Groups

| Service | Log group |
|---------|-----------|
| Integration adapters | `/grc/integrations` |
| Trust Center Lambda | `/grc/trust-center` |
| GRC MCP server | `/grc/mcp-server` |
| Connector scripts (CI) | `/grc/connectors` |

---

## Log Retention

| Log class | Minimum retention | Storage |
|-----------|------------------|---------|
| Application INFO/WARN | 90 days | CloudWatch |
| ERROR logs | 1 year | CloudWatch |
| AUDIT logs — security events | 3 years | CloudWatch + S3 Glacier |
| AI decision logs | 3 years | CloudWatch + S3 Glacier |
| CI pipeline logs | 2 years | CI platform artifacts |

> **EU AI Act Art. 12 requirement:** Logs for high-risk AI systems must be retained for a minimum of 3 years from the date the system ceases to be used. All AI decision logs from the GRC Platform's Phase 4 AI agents fall under this requirement.

---

## Alerting

The following log events must trigger CloudWatch Alarms:

| Pattern | Alarm severity | Response |
|---------|---------------|---------|
| `level: ERROR` rate > 5/min sustained | High | Page on-call engineer |
| `event_type: security_alert` | Critical | Notify Security Engineering immediately |
| `event_type: p0_created` | Critical | Page incident response |
| `alert_type: prompt_injection_attempt` | High | Notify Security Engineering |
| `event_type: auth_failure` spike (> 10/min) | High | Notify Security Operations — possible credential stuffing |
| `event_type: authz_denied` spike | Medium | Review access patterns |
| `write_operation: true` from AI agent without `approved_by` | Critical | Block and alert — AI agent attempting unauthorized write |

---

## Compliance Mapping

| Requirement | How this strategy satisfies it |
|-------------|-------------------------------|
| SOC 2 CC7.2 — Monitor system components | AUDIT logs, CloudWatch Alarms per service |
| ISO 27001 A.8.15 — Logging | Structured NDJSON, mandatory fields, per-layer implementation |
| ISO 27001 A.8.16 — Monitoring | CloudWatch alarms, log group per service, alert thresholds |
| EU AI Act Art. 12 — Automatic logging for high-risk AI | AI decision fields, AUDIT level, 3-year S3 Glacier retention |
| EU AI Act Art. 13 — Transparency and traceability | `reasoning_summary`, `model_version`, `approved_by` in every AI decision log |
| ISO 42001 9.1 — Monitoring, measurement, analysis | MCP tool call logs, AI audit trail, performance metrics |
| GDPR Art. 32 — Security of processing | PII scrubbing rules, no plaintext sensitive data in logs |
| NIST CSF DE.AE-3 — Event data aggregated | CloudWatch log pipeline, single log format across services |
| NIST AI RMF GOVERN 1.4 — AI risks documented | AI security threat coverage table, prompt injection logging |

---

## Current Gaps vs. This Strategy

| Gap | Priority | Owner |
|-----|----------|-------|
| Integration adapters use ad-hoc `console.log` — not structured | P2 | Engineering |
| Python Lambda has no JSON formatter | P2 | Engineering |
| No PII scrubber in any layer | P1 | Security Engineering |
| Connector scripts have no `--log-json` flag | P3 | Engineering |
| No CloudWatch log groups or alarms configured | P1 | Platform |
| AI decision logging not yet implemented (Phase 4) | P2 — pre-requisite for MCP server launch | AI Engineering |

---

## Related Documents

- [PDLC Security Guardrails](./PDLC-SECURITY-GUARDRAILS.md) — mandates no PII in logs; AI governance checkpoints
- [SDLC Security Guardrails](./SDLC-SECURITY-GUARDRAILS.md) — explainability logging requirement for AI/ML controls
- [AI-GRC Roadmap](./AI-GRC-ROADMAP.md) — MCP server design; AI audit trail requirements
- [Threat Model: Docker Supply Chain](./THREAT-MODEL-DOCKER-SUPPLY-CHAIN.md) — structured logging as STRIDE mitigation
- [Architecture Overview](./ARCHITECTURE.md) — system layers and data flow
- [Security Policy](./SECURITY.md)
