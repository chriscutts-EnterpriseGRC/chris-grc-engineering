# ─── CloudWatch Metric Filters ───────────────────────────────────────────────
# Extracts security-relevant events from structured NDJSON logs.
# Each filter creates a metric that drives a CloudWatch Alarm.
# Pattern syntax: https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/FilterAndPatternSyntax.html

locals {
  # All filters run against the shared /grc/audit log group
  audit_log_group = aws_cloudwatch_log_group.services["audit"].name
  int_log_group   = aws_cloudwatch_log_group.services["integrations"].name
}

# ── P0: Root account used ─────────────────────────────────────────────────────
resource "aws_cloudwatch_log_metric_filter" "root_account_used" {
  name           = "grc-root-account-used"
  log_group_name = local.audit_log_group
  pattern        = "{ $.event_type = \"auth_success\" && $.user_id = \"root\" }"

  metric_transformation {
    name          = "RootAccountUsed"
    namespace     = "GRC/Security"
    value         = "1"
    default_value = "0"
    unit          = "Count"
  }
}

# ── P0: Prompt injection detected ────────────────────────────────────────────
resource "aws_cloudwatch_log_metric_filter" "prompt_injection" {
  name           = "grc-prompt-injection"
  log_group_name = local.audit_log_group
  pattern        = "{ $.alert_type = \"prompt_injection_attempt\" }"

  metric_transformation {
    name          = "PromptInjectionAttempts"
    namespace     = "GRC/Security"
    value         = "1"
    default_value = "0"
    unit          = "Count"
  }
}

# ── P0: P0 finding created ────────────────────────────────────────────────────
resource "aws_cloudwatch_log_metric_filter" "p0_finding_created" {
  name           = "grc-p0-finding-created"
  log_group_name = local.audit_log_group
  pattern        = "{ $.event_type = \"p0_created\" }"

  metric_transformation {
    name          = "P0FindingsCreated"
    namespace     = "GRC/Security"
    value         = "1"
    default_value = "0"
    unit          = "Count"
  }
}

# ── P0: AI agent unauthorized write (write without approved_by) ───────────────
resource "aws_cloudwatch_log_metric_filter" "ai_unauthorized_write" {
  name           = "grc-ai-unauthorized-write"
  log_group_name = local.audit_log_group
  pattern        = "{ $.event_type = \"mcp_tool_call\" && $.write_operation = true && NOT EXISTS($.approved_by) }"

  metric_transformation {
    name          = "AIUnauthorizedWriteAttempts"
    namespace     = "GRC/Security"
    value         = "1"
    default_value = "0"
    unit          = "Count"
  }
}

# ── P1: Authentication failures ───────────────────────────────────────────────
resource "aws_cloudwatch_log_metric_filter" "auth_failures" {
  name           = "grc-auth-failures"
  log_group_name = local.audit_log_group
  pattern        = "{ $.event_type = \"auth_failure\" }"

  metric_transformation {
    name          = "AuthFailures"
    namespace     = "GRC/Security"
    value         = "1"
    default_value = "0"
    unit          = "Count"
  }
}

# ── P1: Security alerts (generic) ─────────────────────────────────────────────
resource "aws_cloudwatch_log_metric_filter" "security_alerts" {
  name           = "grc-security-alerts"
  log_group_name = local.audit_log_group
  pattern        = "{ $.event_type = \"security_alert\" }"

  metric_transformation {
    name          = "SecurityAlerts"
    namespace     = "GRC/Security"
    value         = "1"
    default_value = "0"
    unit          = "Count"
  }
}

# ── P1: Authorization denials ─────────────────────────────────────────────────
resource "aws_cloudwatch_log_metric_filter" "authz_denials" {
  name           = "grc-authz-denials"
  log_group_name = local.audit_log_group
  pattern        = "{ $.event_type = \"authz_denied\" }"

  metric_transformation {
    name          = "AuthorizationDenials"
    namespace     = "GRC/Security"
    value         = "1"
    default_value = "0"
    unit          = "Count"
  }
}

# ── P2: Application errors ────────────────────────────────────────────────────
resource "aws_cloudwatch_log_metric_filter" "application_errors" {
  name           = "grc-application-errors"
  log_group_name = local.int_log_group
  pattern        = "{ $.level = \"ERROR\" }"

  metric_transformation {
    name          = "ApplicationErrors"
    namespace     = "GRC/Operations"
    value         = "1"
    default_value = "0"
    unit          = "Count"
  }
}

# ── Operational: Scan ingested ────────────────────────────────────────────────
resource "aws_cloudwatch_log_metric_filter" "scan_ingested" {
  name           = "grc-scan-ingested"
  log_group_name = local.int_log_group
  pattern        = "{ $.event_type = \"scan_ingested\" }"

  metric_transformation {
    name          = "ScansIngested"
    namespace     = "GRC/Operations"
    value         = "1"
    default_value = "0"
    unit          = "Count"
  }
}
