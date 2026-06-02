variable "aws_region" {
  description = "AWS region for all CloudWatch resources"
  type        = string
  default     = "eu-west-1"
}

variable "environment" {
  description = "Deployment environment (production, staging, development)"
  type        = string
  default     = "production"
}

variable "alert_email" {
  description = "Email address to receive CloudWatch alarm notifications"
  type        = string
}

variable "log_retention_days" {
  description = "Retention period for INFO/WARN logs (days)"
  type        = number
  default     = 90
}

variable "audit_log_retention_days" {
  description = "Retention period for AUDIT/security logs (days) — 3 years per EU AI Act Art.12"
  type        = number
  default     = 1095
}

variable "error_alarm_threshold" {
  description = "ERROR log rate (per minute) that triggers the service degraded alarm"
  type        = number
  default     = 5
}

variable "auth_failure_threshold" {
  description = "Auth failure count per 5 minutes that triggers the credential stuffing alarm"
  type        = number
  default     = 10
}

variable "tags" {
  description = "Common tags applied to all resources"
  type        = map(string)
  default = {
    Project    = "grc-platform"
    ManagedBy  = "terraform"
  }
}
