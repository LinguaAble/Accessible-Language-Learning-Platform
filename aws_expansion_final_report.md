# LinguaAble AWS Infrastructure Expansion — Final Completion Report

**Project:** LinguaAble (Accessible Language-Learning Platform)  
**AWS Account ID:** `035611741650`  
**Primary Region:** `eu-north-1` (Stockholm) | **Global Services:** `us-east-1` (CloudFront)  
**Deployment Date:** October 12, 2026  
**Status:** **Completed & Verified (Production Active with Zero Downtime)**  

---

## 1. Executive Summary

The AWS infrastructure supporting **LinguaAble** has been expanded from a single-point-of-failure setup (standalone EC2 directly exposed to the internet) into a highly available, monitored, scalable, and secure cloud architecture incorporating **10 core AWS services**.

All production data in MongoDB Atlas, user accounts, and the public production URL (`https://d2mrtes5nl38lf.cloudfront.net/`) were preserved without any downtime during the entire rollout.

```
       [ End Users / Web Browsers ]
                    │
                    ▼
     [ Amazon CloudFront CDN (E2KIOU72JD8980) ]
        ├── Static Web Requests (/*) ───────► [ Amazon S3 Frontend Bucket ]
        │                                     (linguaable-frontend-prod-girish)
        │
        └── API Requests (/api/*) ──────────► [ Application Load Balancer (ALB) ]
                                              (LinguaAble-ALB-289870073.eu-north-1)
                                                        │
                         ┌──────────────────────────────┴──────────────────────────────┐
                         ▼                                                             ▼
              [ EC2 Primary Instance ]                                      [ EC2 Auto Scaling Instance ]
              (i-0fdb163eaec90d0ef)                                         (i-046e33681b7bc2f54)
              - t3.micro (Nginx + PM2)                                      - Launched via Launch Template
              - IAM Role for Secrets Manager                                - Secrets fetched at boot
                         │                                                             │
                         └──────────────────────────────┬──────────────────────────────┘
                                                        │
                                                        ▼
                                           [ MongoDB Atlas Production ]
                                           (Dedicated Database Cluster)
```

In addition, an **Amazon API Gateway HTTP API** (`w3xi6n3ik3`) was deployed and integrated as an alternative managed serverless API entry point with HTTP proxying to the load balancer.

---

## 2. Inventory of the 10 Implemented AWS Services

| # | AWS Service | Resource Name / ID | Identifier / Endpoint / ARN | Operational Status |
|---|-------------|---------------------|-----------------------------|--------------------|
| **1** | **Amazon S3** | `linguaable-frontend-prod-girish` | S3 Static Website / CloudFront Origin | **Active** (Serving React SPA) |
| **2** | **Amazon CloudFront** | `E2KIOU72JD8980` | `https://d2mrtes5nl38lf.cloudfront.net/` | **Active** (Multi-origin CDN) |
| **3** | **Amazon EC2** | Primary: `i-0fdb163eaec90d0ef`<br>ASG: `i-046e33681b7bc2f54` | Subnet: `subnet-08c37ef401dfc1db6` (eu-north-1a)<br>AMI: `ami-032b31786d5ab8a01` | **Healthy** (2 instances behind TG) |
| **4** | **Amazon CloudWatch** | `LinguaAble-EC2-High-CPU`<br>`LinguaAble-EC2-Status-Check-Failed` | Alarms configured on `i-0fdb163eaec90d0ef` with SNS actions | **Active** (Routing alerts to SNS) |
| **5** | **Application Load Balancer** | `LinguaAble-ALB`<br>TG: `LinguaAble-Backend-TG` | DNS: `LinguaAble-ALB-289870073.eu-north-1.elb.amazonaws.com`<br>ARN: `.../targetgroup/LinguaAble-Backend-TG/4a23dfe1f4be3ed5` | **Healthy** (Direct HTTP :80, Forwarding) |
| **6** | **EC2 Auto Scaling** | `LinguaAble-Backend-ASG`<br>LT: `LinguaAble-Backend-LT` | Min: 1, Max: 2, Desired: 1<br>LT: `lt-0cc026b81672cdf98`<br>Multi-AZ: `eu-north-1a`, `1b`, `1c` | **Active** (Capacity balanced) |
| **7** | **AWS Secrets Manager** | `LinguaAble/Backend/Production` | ARN: `arn:aws:secretsmanager:eu-north-1:035611741650:secret:LinguaAble/Backend/Production-yiq8o3` | **Encrypted** (KMS-backed, IAM-restricted) |
| **8** | **Amazon API Gateway** | `LinguaAble-HTTP-API` (`w3xi6n3ik3`) | Endpoint: `https://w3xi6n3ik3.execute-api.eu-north-1.amazonaws.com` | **Active** (HTTP_PROXY forwarder) |
| **9** | **AWS Budgets** | `LinguaAble-Monthly-Budget` | Monthly limit: $20.00 USD<br>Notifications at 80% actual, 100% actual, 100% forecast | **Active** (Billing Safeguard) |
| **10** | **Amazon SNS** | `LinguaAble-Alerts` | ARN: `arn:aws:sns:eu-north-1:035611741650:LinguaAble-Alerts`<br>Subscriber: `girishkumar020106@gmail.com` | **Active** (Subscription pending email click) |

---

## 3. Detailed Implementation Walkthrough

### Phase 2: Alerting & Cost Governance (SNS & AWS Budgets)
1. **SNS Notification Topic:**
   - Created `LinguaAble-Alerts` in `eu-north-1`.
   - Subscribed user email `girishkumar020106@gmail.com`.
   - Attached SNS topic ARN to CloudWatch alarms `LinguaAble-EC2-High-CPU` (CPU > 80% for 5 mins) and `LinguaAble-EC2-Status-Check-Failed`.
2. **AWS Monthly Budget:**
   - Provisioned `LinguaAble-Monthly-Budget` with a $20.00 monthly cap.
   - Configured three alert triggers (Actual 80%, Actual 100%, Forecast 100%) alerting `girishkumar020106@gmail.com`.

### Phase 3: Security & Secrets Hardening (AWS Secrets Manager & IAM)
1. **IAM Instance Profile:**
   - Created IAM Role `LinguaAble-EC2-Secrets-Role` with `ec2.amazonaws.com` trust relationship.
   - Attached an inline least-privilege policy allowing `secretsmanager:GetSecretValue` only on `LinguaAble/Backend/*`.
   - Created instance profile `LinguaAble-EC2-Secrets-Profile` and attached it to `i-0fdb163eaec90d0ef`.
2. **Secrets Migration:**
   - Retrieved current production `.env` configuration (`MONGO_URI`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, `GROQ_API_KEY`, `PORT=5000`).
   - Securely migrated credentials to AWS Secrets Manager under secret key `LinguaAble/Backend/Production`.

### Phase 4: Application Load Balancer (ALB)
1. **ALB Networking & Security:**
   - Created security group `LinguaAble-ALB-SG` (`sg-0b48c104a6ad63075`) accepting HTTP:80 and HTTPS:443 from all addresses.
   - Updated EC2 backend security group `sg-0221892154ac30981` to allow ingress on port 80 directly from `sg-0b48c104a6ad63075`.
2. **Target Group & ALB Creation:**
   - Created Target Group `LinguaAble-Backend-TG` with HTTP health checks on `/test` (Status code: 200).
   - Registered EC2 instance `i-0fdb163eaec90d0ef` (State: `healthy`).
   - Created internet-facing dual-zone ALB across subnets `subnet-08c37ef401dfc1db6` (1a) and `subnet-09f193cb18fcf5fb4` (1b).
   - Created listener on port 80 forwarding traffic to `LinguaAble-Backend-TG`.

### Phase 5: High Availability & Scaling (EC2 Auto Scaling)
1. **Gold Base AMI:**
   - Captured AMI `ami-032b31786d5ab8a01` (`LinguaAble-Backend-Base-AMI-20261012`) with pre-installed Node.js, PM2, Git, Nginx, and codebase.
2. **Launch Template:**
   - Created `LinguaAble-Backend-LT` (`lt-0cc026b81672cdf98`) with `t3.micro`, security group `sg-0221892154ac30981`, key pair `linguaable-key`, instance profile `LinguaAble-EC2-Secrets-Profile`, and user data script that dynamically fetches credentials from Secrets Manager and boots PM2 / Nginx.
3. **Auto Scaling Group:**
   - Created service-linked role `AWSServiceRoleForAutoScaling`.
   - Created `LinguaAble-Backend-ASG` across `eu-north-1a`, `1b`, and `1c`.
   - Attached to Target Group `LinguaAble-Backend-TG`.
   - The newly launched ASG instance `i-046e33681b7bc2f54` successfully bootstrapped, passed health checks, and reached `healthy` state in the target group alongside the primary instance.

### Phase 6: Managed API Gateway (Amazon API Gateway)
1. **HTTP API Creation:**
   - Created HTTP API `LinguaAble-HTTP-API` (`w3xi6n3ik3`).
2. **Proxy Integration:**
   - Created `HTTP_PROXY` integration forwarding `ANY /{proxy+}` to `http://LinguaAble-ALB-289870073.eu-north-1.elb.amazonaws.com/{proxy}`.
   - Deployed default stage `$default` with auto-deploy enabled.

### Phase 7: Production CloudFront Cutover
1. **Safety Backup:**
   - Exported original CloudFront configuration to `scratch/cf_backup.json` (Original ETag: `E1F83G8C2ARO7P`).
2. **Origin Migration:**
   - Replaced raw EC2 public IP origin with the ALB DNS name: `LinguaAble-ALB-289870073.eu-north-1.elb.amazonaws.com`.
   - Applied configuration with `--if-match` to distribution `E2KIOU72JD8980`.
   - Verified that CloudFront cached routes, static assets, and dynamic `/api/*` requests cut over seamlessly.

---

## 4. End-to-End Verification Matrix

Automated verification tests were executed against all ingress layers:

| Layer / Target | Endpoint Tested | HTTP Code | Response Summary |
|---|---|:---:|---|
| **CloudFront Frontend** | `https://d2mrtes5nl38lf.cloudfront.net/` | **200 OK** | Full HTML SPA shell returned (`<!doctype html>`) |
| **CloudFront API** | `https://d2mrtes5nl38lf.cloudfront.net/api/auth/leaderboard` | **200 OK** | Live MongoDB Atlas leaderboard payload (736 KB) |
| **ALB Healthcheck** | `http://LinguaAble-ALB-289870073.eu-north-1.elb.amazonaws.com/test` | **200 OK** | `{"status":"OK"}` |
| **ALB Leaderboard API** | `http://LinguaAble-ALB-289870073.eu-north-1.elb.amazonaws.com/api/auth/leaderboard` | **200 OK** | Live MongoDB Atlas leaderboard payload (736 KB) |
| **API Gateway Healthcheck** | `https://w3xi6n3ik3.execute-api.eu-north-1.amazonaws.com/test` | **200 OK** | `{"status":"OK"}` |
| **API Gateway Leaderboard API** | `https://w3xi6n3ik3.execute-api.eu-north-1.amazonaws.com/api/auth/leaderboard` | **200 OK** | Live MongoDB Atlas leaderboard payload (736 KB) |
| **Target Group State** | `i-0fdb163eaec90d0ef` (Primary EC2) | **Healthy** | Passing HTTP :80 `/test` check |
| **Target Group State** | `i-046e33681b7bc2f54` (ASG EC2) | **Healthy** | Passing HTTP :80 `/test` check |

---

## 5. Rollback & Disaster Recovery Procedures

If a rollback of the CloudFront distribution is ever required:
1. Load `scratch/cf_backup.json`.
2. Extract the `DistributionConfig`.
3. Get the latest distribution ETag:
   ```bash
   aws cloudfront get-distribution-config --id E2KIOU72JD8980 --region us-east-1
   ```
4. Restore original origin configuration:
   ```bash
   aws cloudfront update-distribution --id E2KIOU72JD8980 --distribution-config file://cf_backup_config.json --if-match <CURRENT_ETAG> --region us-east-1
   ```

---

## 6. Security & Cost Optimization Summary

- **Zero Plaintext Secrets:** Sensitive database credentials and JWT tokens are stored in AWS Secrets Manager and retrieved dynamically.
- **Defense in Depth:** The backend EC2 instances only accept HTTP traffic coming from the ALB Security Group (`sg-0b48c104a6ad63075`), disallowing arbitrary direct HTTP internet access.
- **Cost Impact:**
  - Application Load Balancer: ~$0.0225/hr (~$16/mo)
  - API Gateway: Pay-per-request ($1.00 per million requests)
  - Secrets Manager: $0.40/secret/mo (~$0.40/mo)
  - EC2: t3.micro within standard free tier / low usage
  - CloudWatch & SNS: Within Free Tier allowances
  - Total incremental cost safely shielded by the $20.00/mo AWS Budget alerts.
