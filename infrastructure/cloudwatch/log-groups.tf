# ─── CloudWatch Log Groups ────────────────────────────────────────────────────
# One log group per service, per the Logging Strategy (docs/LOGGING-STRATEGY.md)
# AUDIT logs use the extended retention period (3 years — EU AI Act Art.12)

locals {
  services = {
    "integrations" = {
      log_group   = "/grc/integrations"
      description = "Node.js integration adapters (Jira, Qualys, Splunk, AWS Security Hub, etc.)"
      retention   = var.log_retention_days
    }
    "trust-center" = {
      log_group   = "/grc/trust-center"
      description = "Python Lambda trust-center handler"
      retention   = var.log_retention_days
    }
    "mcp-server" = {
      log_group   = "/grc/mcp-server"
      description = "GRC MCP server — AI agent tool calls (Phase 4)"
      retention   = var.audit_log_retention_days
    }
    "connectors" = {
      log_group   = "/grc/connectors"
      description = "Connector scripts (AWS, GCP, Okta, Wiz, etc.) CI pipeline logs"
      retention   = var.log_retention_days
    }
    "dashboard" = {
      log_group   = "/grc/dashboard"
      description = "React dashboard ECS Fargate task logs"
      retention   = var.log_retention_days
    }
    "audit" = {
      log_group   = "/grc/audit"
      description = "AUDIT-level security events aggregated from all services — 3-year retention"
      retention   = var.audit_log_retention_days
    }
  }
}

resource "aws_cloudwatch_log_group" "services" {
  for_each = local.services

  name              = local.services[each.key].log_group
  retention_in_days = local.services[each.key].retention

  tags = {
    Service     = each.key
    Description = local.services[each.key].description
  }
}

# KMS encryption for AUDIT log group (3-year retention requires extra protection)
resource "aws_kms_key" "audit_logs" {
  description             = "KMS key for GRC audit log group encryption"
  deletion_window_in_days = 14
  enable_key_rotation     = true
}

resource "aws_cloudwatch_log_group" "audit_encrypted" {
  name              = "/grc/audit/encrypted"
  retention_in_days = var.audit_log_retention_days
  kms_key_id        = aws_kms_key.audit_logs.arn

  depends_on = [aws_kms_key.audit_logs]
}
