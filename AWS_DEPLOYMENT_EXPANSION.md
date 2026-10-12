# LinguaAble — AWS Expanded Architecture Reference

This document provides a comprehensive operational reference for the 10 AWS services powering the LinguaAble platform.

---

## 1. Architecture Overview

- **Frontend CDN:** Amazon CloudFront (`https://d2mrtes5nl38lf.cloudfront.net/`) backed by Amazon S3 (`linguaable-frontend-prod-girish`).
- **Backend API Routing:** CloudFront `/api/*` routes to the Application Load Balancer (`LinguaAble-ALB-289870073.eu-north-1.elb.amazonaws.com`).
- **Load Balancing:** ALB (`LinguaAble-ALB`) load-balances HTTP requests across healthy EC2 instances in Target Group `LinguaAble-Backend-TG`.
- **Compute & Elasticity:** EC2 Auto Scaling Group (`LinguaAble-Backend-ASG`) using Launch Template (`LinguaAble-Backend-LT`) and Base AMI (`ami-032b31786d5ab8a01`).
- **Secrets Management:** Sensitive credentials (`MONGO_URI`, `JWT_SECRET`, etc.) reside in AWS Secrets Manager (`LinguaAble/Backend/Production`).
- **Serverless API Layer:** Amazon API Gateway HTTP API (`w3xi6n3ik3`) provides an alternative managed gateway endpoint.
- **Monitoring & Alerts:** Amazon CloudWatch alarms linked to Amazon SNS topic (`LinguaAble-Alerts`).
- **Cost Governance:** AWS Budgets ($20.00/month) with automated email notifications.

---

## 2. Resource Directory

| Service | Identifier / Name | Key Detail / ARN / Domain |
|---|---|---|
| **S3** | `linguaable-frontend-prod-girish` | Static web assets storage |
| **CloudFront** | `E2KIOU72JD8980` | `https://d2mrtes5nl38lf.cloudfront.net/` |
| **EC2** | Primary: `i-0fdb163eaec90d0ef`<br>ASG: `i-046e33681b7bc2f54` | Region: `eu-north-1` (Stockholm) |
| **CloudWatch** | `LinguaAble-EC2-High-CPU`<br>`LinguaAble-EC2-Status-Check-Failed` | Evaluates CPU and System Status |
| **ALB** | `LinguaAble-ALB` | `LinguaAble-ALB-289870073.eu-north-1.elb.amazonaws.com` |
| **Auto Scaling** | `LinguaAble-Backend-ASG` | Launch Template: `lt-0cc026b81672cdf98` |
| **Secrets Manager** | `LinguaAble/Backend/Production` | Encrypted production configuration |
| **API Gateway** | `w3xi6n3ik3` | `https://w3xi6n3ik3.execute-api.eu-north-1.amazonaws.com` |
| **Budgets** | `LinguaAble-Monthly-Budget` | $20.00/mo cap with 80% and 100% alerts |
| **SNS** | `LinguaAble-Alerts` | `arn:aws:sns:eu-north-1:035611741650:LinguaAble-Alerts` |

---

## 3. Operational CLI Commands

### Check Target Health
```bash
aws elbv2 describe-target-health \
  --target-group-arn arn:aws:elasticloadbalancing:eu-north-1:035611741650:targetgroup/LinguaAble-Backend-TG/4a23dfe1f4be3ed5 \
  --region eu-north-1
```

### Check Auto Scaling Group Status
```bash
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names LinguaAble-Backend-ASG \
  --region eu-north-1
```

### Retrieve Secrets (from IAM-authorized EC2)
```bash
aws secretsmanager get-secret-value \
  --secret-id LinguaAble/Backend/Production \
  --region eu-north-1 \
  --query SecretString --output text
```
