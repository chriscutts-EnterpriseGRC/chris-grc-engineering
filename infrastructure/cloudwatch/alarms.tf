# ─── CloudWatch Alarms ────────────────────────────────────────────────────────
# Driven by metric filters in metric-filters.tf.
# Alarm severity matches the Logging Strategy and Security Monitoring Policy.

# ── CRITICAL: Root account used ───────────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "root_account_used" {
  alarm_name          = "grc-CRITICAL-root-account-used"
  alarm_description   = "AWS root account was used — immediate investigation required"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "RootAccountUsed"
  namespace           = "GRC/Security"
  period              = 60
  statistic           = "Sum"
  threshold           = 1
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.critical_alerts.arn]
  ok_actions    = []
}

# ── CRITICAL: Prompt injection detected ──────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "prompt_injection" {
  alarm_name          = "grc-CRITICAL-prompt-injection-detected"
  alarm_description   = "Prompt injection attempt detected on AI agent input"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "PromptInjectionAttempts"
  namespace           = "GRC/Security"
  period              = 60
  statistic           = "Sum"
  threshold           = 1
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.critical_alerts.arn]
}

# ── CRITICAL: P0 finding created ─────────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "p0_finding_created" {
  alarm_name          = "grc-CRITICAL-p0-finding-created"
  alarm_description   = "P0 vulnerability finding created — incident response SLA started"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "P0FindingsCreated"
  namespace           = "GRC/Security"
  period              = 60
  statistic           = "Sum"
  threshold           = 1
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.critical_alerts.arn]
}

# ── CRITICAL: AI unauthorized write ──────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "ai_unauthorized_write" {
  alarm_name          = "grc-CRITICAL-ai-unauthorized-write"
  alarm_description   = "AI agent attempted write operation without human approval"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "AIUnauthorizedWriteAttempts"
  namespace           = "GRC/Security"
  period              = 60
  statistic           = "Sum"
  threshold           = 1
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.critical_alerts.arn]
}

# ── HIGH: Auth failure spike — possible credential stuffing ──────────────────
resource "aws_cloudwatch_metric_alarm" "auth_failure_spike" {
  alarm_name          = "grc-HIGH-auth-failure-spike"
  alarm_description   = "Auth failure rate exceeds threshold — possible credential stuffing attack"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "AuthFailures"
  namespace           = "GRC/Security"
  period              = 300 # 5 minutes
  statistic           = "Sum"
  threshold           = var.auth_failure_threshold
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.security_alerts.arn]
}

# ── HIGH: Security alert event ────────────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "security_alert" {
  alarm_name          = "grc-HIGH-security-alert"
  alarm_description   = "Security alert event logged — investigation required"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "SecurityAlerts"
  namespace           = "GRC/Security"
  period              = 60
  statistic           = "Sum"
  threshold           = 1
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.security_alerts.arn]
}

# ── MEDIUM: Authorization denial spike ───────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "authz_denial_spike" {
  alarm_name          = "grc-MEDIUM-authz-denial-spike"
  alarm_description   = "Authorization denial rate is elevated — review access patterns"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "AuthorizationDenials"
  namespace           = "GRC/Security"
  period              = 3600 # 1 hour
  statistic           = "Sum"
  threshold           = 20
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.security_alerts.arn]
}

# ── MEDIUM: Application error rate ───────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "application_error_rate" {
  alarm_name          = "grc-MEDIUM-application-error-rate"
  alarm_description   = "Application error rate exceeds threshold — service may be degraded"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 3 # sustained for 3 minutes
  metric_name         = "ApplicationErrors"
  namespace           = "GRC/Operations"
  period              = 60
  statistic           = "Sum"
  threshold           = var.error_alarm_threshold
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.security_alerts.arn]
}
