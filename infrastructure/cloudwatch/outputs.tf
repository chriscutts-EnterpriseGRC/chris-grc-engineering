output "log_group_arns" {
  description = "ARNs of all CloudWatch log groups"
  value = {
    for k, v in aws_cloudwatch_log_group.services : k => v.arn
  }
}

output "log_group_names" {
  description = "Names of all CloudWatch log groups"
  value = {
    for k, v in aws_cloudwatch_log_group.services : k => v.name
  }
}

output "critical_alerts_topic_arn" {
  description = "SNS topic ARN for critical security alerts"
  value       = aws_sns_topic.critical_alerts.arn
}

output "security_alerts_topic_arn" {
  description = "SNS topic ARN for high/medium security alerts"
  value       = aws_sns_topic.security_alerts.arn
}

output "audit_kms_key_id" {
  description = "KMS key ID for encrypted audit log group"
  value       = aws_kms_key.audit_logs.key_id
}
