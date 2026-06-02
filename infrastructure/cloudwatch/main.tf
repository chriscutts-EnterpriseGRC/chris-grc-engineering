terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment to use S3 remote state
  # backend "s3" {
  #   bucket  = "your-terraform-state-bucket"
  #   key     = "grc-platform/cloudwatch/terraform.tfstate"
  #   region  = "eu-west-1"
  #   encrypt = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = merge(var.tags, {
      Environment = var.environment
    })
  }
}

# ─── SNS Topic — Security Alerts ─────────────────────────────────────────────

resource "aws_sns_topic" "security_alerts" {
  name = "grc-security-alerts-${var.environment}"
}

resource "aws_sns_topic_subscription" "security_alerts_email" {
  topic_arn = aws_sns_topic.security_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

resource "aws_sns_topic" "critical_alerts" {
  name = "grc-critical-alerts-${var.environment}"
}

resource "aws_sns_topic_subscription" "critical_alerts_email" {
  topic_arn = aws_sns_topic.critical_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}
