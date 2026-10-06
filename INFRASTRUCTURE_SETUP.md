# AWS Infrastructure Setup - Campus Skill Exchange Portal

## Overview
Complete step-by-step guide to set up AWS infrastructure for the Campus Skill Exchange Portal in **Mumbai (ap-south-1)** region.

**Important:** Use the same region for ALL services - Do NOT mix regions!

---

## ✅ STEP 1 — Set AWS Region

### Action:
1. Go to **AWS Console**
2. Top-right corner → Select region
3. Choose: **Asia Pacific (Mumbai) — ap-south-1**

### Why Mumbai?
- Lowest latency for Indian users
- Cost-effective
- Complete AWS services available

**Status:** ☐ Completed

---

## ✅ STEP 2 — Create VPC (Virtual Private Cloud)

### Action:
1. AWS Console → **VPC**
2. Click **Create VPC**
3. Select **VPC only**
4. Configure:
   - **Name:** `CampusSkillExchange-VPC`
   - **IPv4 CIDR:** `10.0.0.0/16`
   - Do NOT create NAT Gateway
   - Click **Create VPC**

### Architecture:
```
Internet
   ↓
VPC: 10.0.0.0/16
   ├── Public Subnet 1: 10.0.1.0/24
   ├── Public Subnet 2: 10.0.2.0/24
   └── Internet Gateway
```

### Screenshot:
📸 Save as: `01-vpc.png`
- Show: VPC name, CIDR block (10.0.0.0/16)

**Status:** ☐ Completed

---

## ✅ STEP 3 — Create Public Subnet 1

### Action:
1. AWS Console → **VPC → Subnets**
2. Click **Create subnet**
3. Configure:
   - **VPC:** CampusSkillExchange-VPC
   - **Subnet name:** `CampusSkillExchange-Public-Subnet-1`
   - **Availability Zone:** ap-south-1a (choose one)
   - **IPv4 CIDR:** `10.0.1.0/24`
4. Click **Create subnet**

### Purpose:
- This is where EC2 instance will run
- Public (has internet access)
- Availability Zone 1

**Status:** ☐ Completed

---

## ✅ STEP 4 — Create Public Subnet 2

### Action:
1. AWS Console → **VPC → Subnets**
2. Click **Create subnet**
3. Configure:
   - **VPC:** CampusSkillExchange-VPC
   - **Subnet name:** `CampusSkillExchange-Public-Subnet-2`
   - **Availability Zone:** ap-south-1b (different from Subnet 1)
   - **IPv4 CIDR:** `10.0.2.0/24`
4. Click **Create subnet**

### Purpose:
- Reserved for future scalability
- Multi-AZ architecture
- Can host RDS, second EC2, etc. later

### Architecture Now:
```
CampusSkillExchange-VPC (10.0.0.0/16)
├── Public Subnet 1 (10.0.1.0/24) → EC2 will go here
└── Public Subnet 2 (10.0.2.0/24) → Future use
```

**Status:** ☐ Completed

---

## ✅ STEP 5 — Create Internet Gateway

### Action:
1. AWS Console → **VPC → Internet Gateways**
2. Click **Create internet gateway**
3. Configure:
   - **Name:** `CampusSkillExchange-IGW`
4. Click **Create internet gateway**
5. Then:
   - Click on the created IGW
   - Click **Actions → Attach to VPC**
   - Select: `CampusSkillExchange-VPC`
   - Click **Attach internet gateway**

### Purpose:
- Connects VPC to the Internet
- Without this, EC2 cannot reach the internet

### Architecture:
```
Internet
   ↓ (via IGW)
VPC
   ↓
EC2 (can access internet)
```

**Status:** ☐ Completed

---

## ✅ STEP 6 — Create Route Table

### Action:
1. AWS Console → **VPC → Route Tables**
2. Click **Create route table**
3. Configure:
   - **Name:** `CampusSkillExchange-Public-RT`
   - **VPC:** CampusSkillExchange-VPC
   - Click **Create route table**

### Add Route:
1. Click on the created route table
2. Go to **Routes** tab
3. Click **Edit routes**
4. Click **Add route**
5. Configure:
   - **Destination:** `0.0.0.0/0` (all traffic)
   - **Target:** Internet Gateway → `CampusSkillExchange-IGW`
   - Click **Save routes**

### Associate with Subnets:
1. Go to **Subnet associations** tab
2. Click **Edit subnet associations**
3. Select:
   - ☑ CampusSkillExchange-Public-Subnet-1
   - ☑ CampusSkillExchange-Public-Subnet-2
4. Click **Save associations**

### Purpose:
- Routes traffic from subnets to Internet Gateway
- Makes subnets truly "public"

**Status:** ☐ Completed

---

## ✅ STEP 7 — Create Security Group

### Action:
1. AWS Console → **EC2 → Security Groups**
2. Click **Create security group**
3. Configure:
   - **Security group name:** `CampusSkillExchange-SG`
   - **Description:** Security group for Campus Skill Exchange EC2
   - **VPC:** CampusSkillExchange-VPC

### Add Inbound Rules:

#### Rule 1 — SSH (for remote access)
- **Type:** SSH
- **Port:** 22
- **Source:** Your IP (find at: https://checkip.amazonaws.com)
- ⚠️ Do NOT use 0.0.0.0/0 for SSH (security risk)

#### Rule 2 — HTTP (web traffic)
- **Type:** HTTP
- **Port:** 80
- **Source:** 0.0.0.0/0 (allow all)

#### Rule 3 — Custom TCP (Node.js development)
- **Type:** Custom TCP
- **Port:** 3000
- **Source:** 0.0.0.0/0
- 📝 Note: Later remove this when using Nginx on port 80

#### Rule 4 — HTTPS (optional for later)
- **Type:** HTTPS
- **Port:** 443
- **Source:** 0.0.0.0/0

### Summary:
```
Inbound Rules:
├── SSH (22) → Your IP only
├── HTTP (80) → 0.0.0.0/0
├── TCP (3000) → 0.0.0.0/0 (temp for development)
└── HTTPS (443) → 0.0.0.0/0 (optional)
```

**Status:** ☐ Completed

---

## ✅ STEP 8 — Create DynamoDB Tables

### Important:
- Verify region is still **ap-south-1 (Mumbai)**
- Create 4 tables (one for each data type)

### Table 1 — Users
1. AWS Console → **DynamoDB → Tables**
2. Click **Create table**
3. Configure:
   - **Table name:** `CampusSkillExchange-Users`
   - **Partition key:** `userId` (Type: String)
   - Click **Create table**

### Table 2 — Skills
1. Click **Create table**
2. Configure:
   - **Table name:** `CampusSkillExchange-Skills`
   - **Partition key:** `skillId` (Type: String)
   - Click **Create table**

### Table 3 — Requests
1. Click **Create table**
2. Configure:
   - **Table name:** `CampusSkillExchange-Requests`
   - **Partition key:** `requestId` (Type: String)
   - Click **Create table**

### Table 4 — Materials
1. Click **Create table**
2. Configure:
   - **Table name:** `CampusSkillExchange-Materials`
   - **Partition key:** `materialId` (Type: String)
   - Click **Create table**

### Architecture:
```
DynamoDB (Mumbai region)
├── CampusSkillExchange-Users (Partition: userId)
├── CampusSkillExchange-Skills (Partition: skillId)
├── CampusSkillExchange-Requests (Partition: requestId)
└── CampusSkillExchange-Materials (Partition: materialId)
```

### Screenshot:
📸 Save as: `02-dynamodb-tables.png`
- Show: All 4 tables created and active

**Status:** ☐ Completed

---

## ✅ STEP 9 — Create S3 Bucket

### Action:
1. AWS Console → **S3 → Create bucket**
2. Configure:
   - **Bucket name:** `campus-skill-exchange-dhyanesh-2026`
     - 📝 Note: Must be globally unique
     - If taken, add random numbers
   - **Region:** Asia Pacific (Mumbai) - ap-south-1
   - Click **Create bucket**

### Security Configuration:
1. Click on the bucket
2. Go to **Permissions** tab
3. Verify: **Block all public access** is **ON**
   - ☑ Block public access to buckets and objects granted through new ACLs
   - ☑ Block public access to buckets and objects granted through any ACLs
   - ☑ Block public access to buckets and objects granted through new public bucket or access point policies
   - ☑ Block public and cross-account access to buckets and objects through any public bucket or access point policies

### Purpose:
```
S3 Bucket
├── Store learning materials (PDFs, images, etc.)
├── Keep private (not public)
└── Access via presigned URLs from application
```

### Screenshot:
📸 Save as: `03-s3-bucket.png`
- Show: Bucket name, region, block public access enabled

**Status:** ☐ Completed

---

## ✅ STEP 10 — Create IAM Role

### Action:
1. AWS Console → **IAM → Roles**
2. Click **Create role**
3. Configure:
   - **Trusted entity type:** AWS service
   - **Use case:** EC2
   - Click **Next**

### Attach Policies:
1. Search and attach these policies:
   - ☑ `AmazonDynamoDBFullAccess` (for DynamoDB access)
   - ☑ `AmazonS3FullAccess` (for S3 access)
   - ☑ `CloudWatchAgentServerPolicy` (for monitoring)

### Configure Role:
1. **Role name:** `CampusSkillExchange-EC2-Role`
2. Click **Create role**

### Purpose:
```
EC2 Instance
   ↓ (uses)
IAM Role: CampusSkillExchange-EC2-Role
   ↓ (has permissions for)
   ├── DynamoDB (read/write data)
   ├── S3 (upload/download files)
   └── CloudWatch (monitoring)
```

### Architecture:
```
                    IAM
                     │
                     │ Role
                     ▼
                    EC2
                  /  |  \
                 /   |   \
                ▼    ▼    ▼
              S3  DynamoDB CloudWatch
```

**Status:** ☐ Completed

---

## ✅ STEP 11 — Create EC2 Instance

### Prerequisites:
Before this step, verify:
- ☑ VPC created
- ☑ Public Subnet 1 created
- ☑ Public Subnet 2 created
- ☑ Internet Gateway attached
- ☑ Route Table configured
- ☑ Security Group created
- ☑ DynamoDB tables created
- ☑ S3 bucket created
- ☑ IAM Role created

### Action:
1. AWS Console → **EC2 → Instances**
2. Click **Launch instances**

### Configuration:

#### Name and Tags:
- **Name:** `CampusSkillExchange-Server`

#### AMI (Amazon Machine Image):
- Choose: **Ubuntu 24.04 LTS** or **Amazon Linux 2023**
- Free Tier eligible ✓

#### Instance Type:
- Choose: **t2.micro** or **t2.small** (Free Tier eligible)

#### Key Pair:
- Click **Create new key pair**
- **Name:** `CampusSkillExchange-KeyPair`
- **Type:** RSA
- **Format:** .pem
- Click **Create key pair**
- 📥 Download and save safely (you'll need it to SSH)

#### Network Settings:
This is CRITICAL:
- **VPC:** CampusSkillExchange-VPC ⭐
- **Subnet:** CampusSkillExchange-Public-Subnet-1 ⭐
- **Auto-assign public IP:** Enable ⭐
- **Security Group:** CampusSkillExchange-SG ⭐

#### IAM Instance Profile:
- **IAM instance profile:** CampusSkillExchange-EC2-Role ⭐

#### Storage:
- Keep default (8GB gp2)

### Launch:
1. Review all settings
2. Click **Launch instance**
3. Wait for instance to reach "Running" state

### Screenshot:
📸 Save as: `04-ec2-instance.png`
- Show: Instance running, public IP assigned

### Architecture:
```
EC2 Instance (Running)
├── VPC: CampusSkillExchange-VPC
├── Subnet: CampusSkillExchange-Public-Subnet-1
├── Security Group: CampusSkillExchange-SG
├── IAM Role: CampusSkillExchange-EC2-Role
├── Public IP: [will be assigned]
└── Key Pair: CampusSkillExchange-KeyPair.pem
```

**Status:** ☐ Completed

---

## ✅ STEP 12 — Verification Checklist

Before deploying application code, verify ALL of these:

```
NETWORKING:
☐ VPC: CampusSkillExchange-VPC (10.0.0.0/16)
☐ Public Subnet 1: 10.0.1.0/24 (ap-south-1a)
☐ Public Subnet 2: 10.0.2.0/24 (ap-south-1b)
☐ Internet Gateway: CampusSkillExchange-IGW (attached)
☐ Route Table: CampusSkillExchange-Public-RT (0.0.0.0/0 → IGW)

SECURITY:
☐ Security Group: CampusSkillExchange-SG (SSH, HTTP, 3000)
☐ All rules configured correctly

DATABASE:
☐ DynamoDB Table: CampusSkillExchange-Users
☐ DynamoDB Table: CampusSkillExchange-Skills
☐ DynamoDB Table: CampusSkillExchange-Requests
☐ DynamoDB Table: CampusSkillExchange-Materials

STORAGE:
☐ S3 Bucket: campus-skill-exchange-dhyanesh-2026
☐ Block all public access: ON

IAM:
☐ Role: CampusSkillExchange-EC2-Role
☐ Policies attached (DynamoDB, S3, CloudWatch)

COMPUTE:
☐ EC2 Instance: CampusSkillExchange-Server (Running)
☐ Public IP: [assigned]
☐ VPC: CampusSkillExchange-VPC ✓
☐ Subnet: Public Subnet 1 ✓
☐ Security Group: CampusSkillExchange-SG ✓
☐ IAM Role: CampusSkillExchange-EC2-Role ✓
☐ Key Pair: CampusSkillExchange-KeyPair.pem (saved)

REGION:
☐ All services in ap-south-1 (Mumbai) ✓
```

---

## 📋 Screenshots to Save

Save these in your project documentation:
```
01-vpc.png                    # VPC with CIDR 10.0.0.0/16
02-dynamodb-tables.png        # All 4 DynamoDB tables
03-s3-bucket.png              # S3 bucket created
04-ec2-instance.png           # EC2 running with public IP
```

---

## 🎯 Next Steps (After This Step)

Once you've completed and verified all the above:
1. SSH into EC2 instance
2. Install Node.js
3. Clone the application
4. Configure .env with AWS credentials
5. Start the application
6. Test database connectivity
7. Test S3 uploads

---

## 🚨 Common Mistakes to Avoid

❌ **Mistake 1:** Creating resources in different regions
✅ **Fix:** Always use ap-south-1 (Mumbai)

❌ **Mistake 2:** Forgetting to attach Internet Gateway to VPC
✅ **Fix:** IGW must be attached to VPC

❌ **Mistake 3:** Not associating Route Table with subnets
✅ **Fix:** Both subnets must have the public route table

❌ **Mistake 4:** Using 0.0.0.0/0 for SSH
✅ **Fix:** Restrict SSH to your IP only

❌ **Mistake 5:** Not attaching IAM role to EC2
✅ **Fix:** EC2 needs the role to access DynamoDB and S3

❌ **Mistake 6:** Creating S3 bucket without blocking public access
✅ **Fix:** Always block public access

---

## 📞 Troubleshooting

### EC2 can't connect to DynamoDB:
- ☐ Verify IAM role has DynamoDB permissions
- ☐ Verify region is ap-south-1
- ☐ Check security group allows outbound traffic

### S3 upload fails:
- ☐ Verify IAM role has S3 permissions
- ☐ Verify bucket name is correct in .env
- ☐ Check bucket exists in ap-south-1

### Can't SSH to EC2:
- ☐ Verify security group allows SSH (port 22)
- ☐ Verify SSH source is your current IP
- ☐ Check key pair permissions: `chmod 400 key.pem`

---

## ✅ Status Summary

| Component | Status | Screenshot |
|-----------|--------|-----------|
| VPC | ☐ | 01-vpc.png |
| Subnets | ☐ | - |
| Internet Gateway | ☐ | - |
| Route Table | ☐ | - |
| Security Group | ☐ | - |
| DynamoDB | ☐ | 02-dynamodb-tables.png |
| S3 | ☐ | 03-s3-bucket.png |
| IAM Role | ☐ | - |
| EC2 | ☐ | 04-ec2-instance.png |

---

**Last Updated:** October 6, 2026
**Region:** ap-south-1 (Mumbai)
**Status:** Ready for deployment after verification ✓
