# Deployment Guide - Campus Skill Exchange Portal on AWS

## Prerequisites
Before deployment, ensure you have completed:
- ✅ All steps in `INFRASTRUCTURE_SETUP.md`
- ✅ EC2 instance running
- ✅ Key pair downloaded (.pem file)
- ✅ DynamoDB tables created
- ✅ S3 bucket created
- ✅ IAM role attached to EC2

---

## STEP 1 — SSH into EC2

### Step 1a: Find Your EC2 Public IP
1. AWS Console → **EC2 → Instances**
2. Click on **CampusSkillExchange-Server**
3. Copy the **Public IPv4 address** (e.g., 13.127.xxx.xxx)

### Step 1b: SSH Command
Open terminal on your local machine:

```bash
# Navigate to where you saved the key pair
cd ~/Downloads  # or wherever you saved CampusSkillExchange-KeyPair.pem

# Fix permissions (required)
chmod 400 CampusSkillExchange-KeyPair.pem

# Connect via SSH
ssh -i CampusSkillExchange-KeyPair.pem ubuntu@13.127.xxx.xxx
# Replace 13.127.xxx.xxx with your EC2 public IP
```

### If using Amazon Linux:
```bash
ssh -i CampusSkillExchange-KeyPair.pem ec2-user@13.127.xxx.xxx
```

### Verify Connection:
You should see:
```
ubuntu@ip-10-0-1-xxx:~$
```

---

## STEP 2 — Install Node.js and npm

### On Ubuntu:
```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js (v20 LTS recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### On Amazon Linux:
```bash
# Install Node.js
sudo yum update -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
node --version
npm --version
```

---

## STEP 3 — Clone Application

```bash
# Clone from GitHub
git clone https://github.com/dhyaneshonteddu-18/Campus-skill-exchange-portal.git

# Navigate to project
cd Campus-skill-exchange-portal

# Install dependencies
npm install
```

### Verify Installation:
```bash
ls -la
# You should see:
# config/  models/  services/  public/  server.js  package.json  ...
```

---

## STEP 4 — Configure AWS Credentials on EC2

### Option A: Using IAM Role (Recommended - Already Configured!)
Since you attached the IAM role during EC2 creation, AWS credentials are **automatically available**.

**Verify:**
```bash
# Check if AWS credentials are available
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/
# Should return the role name
```

### Option B: If You Need Manual Credentials (Not Recommended)
```bash
# Create AWS credentials file
mkdir -p ~/.aws

# Create credentials file
nano ~/.aws/credentials
```

Add:
```
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
```

Create config file:
```bash
nano ~/.aws/config
```

Add:
```
[default]
region = ap-south-1
output = json
```

---

## STEP 5 — Create .env File

```bash
# Navigate to project directory
cd ~/Campus-skill-exchange-portal

# Create .env file
nano .env
```

Add these contents:
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# AWS Configuration
AWS_REGION=ap-south-1
DYNAMODB_USERS_TABLE=CampusSkillExchange-Users
DYNAMODB_SKILLS_TABLE=CampusSkillExchange-Skills
DYNAMODB_REQUESTS_TABLE=CampusSkillExchange-Requests
DYNAMODB_MATERIALS_TABLE=CampusSkillExchange-Materials
S3_BUCKET_NAME=campus-skill-exchange-dhyanesh-2026

# Use AWS (not mock data)
USE_MOCK_DATA=false

# Session Secret (generate random)
SESSION_SECRET=your-random-secret-key-12345
```

**Important:** Replace `campus-skill-exchange-dhyanesh-2026` with your actual S3 bucket name.

---

## STEP 6 — Start the Application

### Option A: Direct Node.js (Testing)
```bash
node server.js
```

Expected output:
```
Campus Skill Exchange Portal running on http://localhost:3000
Using AWS DynamoDB and S3
```

Test connectivity:
```bash
# From another terminal
curl http://localhost:3000/api/skills
# Should return: {"success":true,"skills":[],"count":0}
```

### Option B: Using PM2 (Production - Keep Running)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application with PM2
pm2 start server.js --name "campus-skill-exchange"

# Make it start on reboot
pm2 startup
pm2 save

# Check status
pm2 status

# View logs
pm2 logs campus-skill-exchange
```

### Option C: Using Nginx as Reverse Proxy (Production Recommended)

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/campus-skill-exchange
```

Add:
```nginx
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/campus-skill-exchange /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## STEP 7 — Test Application

### Test 1: Check Server Health
```bash
curl http://localhost/api/skills
# Should return: {"success":true,"skills":[],"count":0}
```

### Test 2: Register a User
```bash
curl -X POST http://localhost/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "department": "Computer Science",
    "year": "3rd",
    "bio": "Test bio"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Registration successful",
  "userId": "uuid-here",
  "user": { ... }
}
```

### Test 3: Login
```bash
curl -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test 4: Check DynamoDB
AWS Console → **DynamoDB → Tables → CampusSkillExchange-Users**
- Should see your test user record

---

## STEP 8 — Setup Domain (Optional)

If you have a domain:

### Option A: Route 53 (AWS-managed)
```bash
# Add A record pointing to EC2 public IP
# AWS Console → Route 53 → Hosted Zones
# Create A record → Point to your EC2 public IP
```

### Option B: Update Security Group
If using a domain, update security group to allow traffic:
- Port 80 (HTTP)
- Port 443 (HTTPS)

### Option C: SSL Certificate (Free - Let's Encrypt)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renew
sudo systemctl start certbot.timer
sudo systemctl enable certbot.timer
```

---

## STEP 9 — Monitor Application

### Check Logs:
```bash
# PM2 logs
pm2 logs campus-skill-exchange

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### CloudWatch Monitoring (Optional):
```bash
# View CloudWatch metrics
AWS Console → CloudWatch → Dashboards
# Create custom dashboard for:
# - EC2 CPU usage
# - EC2 Network I/O
# - DynamoDB read/write capacity
```

### Check Database:
```bash
# List DynamoDB tables
aws dynamodb list-tables --region ap-south-1

# Scan users table
aws dynamodb scan --table-name CampusSkillExchange-Users --region ap-south-1
```

---

## STEP 10 — Scale to Production

### Step 1: SSL/TLS Certificate
```bash
sudo certbot --nginx -d yourdomain.com
```

### Step 2: Auto-restart on Reboot
```bash
pm2 startup
pm2 save
```

### Step 3: Enable CloudWatch Monitoring
```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
```

### Step 4: Setup Log Aggregation
```bash
# All logs go to CloudWatch
# Configure in CloudWatch agent config
```

### Step 5: Database Optimization
- DynamoDB: Enable auto-scaling
- S3: Enable versioning
- CloudFront: CDN for static assets

---

## 🚀 Quick Start Checklist

After SSH into EC2:

```bash
# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 2. Clone repository
git clone https://github.com/dhyaneshonteddu-18/Campus-skill-exchange-portal.git
cd Campus-skill-exchange-portal

# 3. Install dependencies
npm install

# 4. Create .env file
nano .env
# Add configuration

# 5. Start with PM2
sudo npm install -g pm2
pm2 start server.js --name "campus-skill-exchange"
pm2 startup
pm2 save

# 6. Install and configure Nginx
sudo apt install -y nginx
# Create config as shown above

# 7. Test
curl http://localhost/api/skills
```

---

## 🐛 Troubleshooting

### Application won't start
```bash
# Check error logs
pm2 logs campus-skill-exchange

# Verify Node.js
node --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Can't connect to DynamoDB
```bash
# Verify IAM role is attached
aws sts get-caller-identity

# Check AWS credentials
cat ~/.aws/credentials

# Verify region
echo $AWS_REGION
```

### S3 upload fails
```bash
# Check bucket exists
aws s3 ls | grep campus-skill-exchange

# Check bucket policy
aws s3api get-bucket-policy --bucket campus-skill-exchange-dhyanesh-2026
```

### High CPU/Memory usage
```bash
# Check running processes
pm2 status
ps aux | grep node

# Restart application
pm2 restart campus-skill-exchange
```

---

## 📊 Monitoring Commands

```bash
# CPU and Memory usage
top -b -n 1 | head -20

# Disk space
df -h

# Network connections
netstat -tulpn | grep 3000

# PM2 status
pm2 status

# Recent logs
pm2 logs --lines 50
```

---

## 🔐 Security Best Practices

✅ **Do:**
- Use IAM roles instead of hardcoded credentials
- Enable Security Group restrictions
- Use HTTPS (SSL/TLS)
- Keep dependencies updated
- Monitor CloudWatch logs
- Use environment variables for secrets
- Enable DynamoDB encryption

❌ **Don't:**
- Expose .env file
- Use 0.0.0.0/0 for SSH
- Store credentials in code
- Disable CloudWatch monitoring
- Use old Node.js versions
- Allow public S3 bucket access

---

## 📈 Performance Optimization

### DynamoDB:
```bash
# Enable auto-scaling in AWS Console
# DynamoDB → Table → Capacity
# Set: Provisioned / On-demand (recommended for variable load)
```

### S3:
```bash
# Enable CloudFront CDN for static files
# S3 → Create CloudFront distribution
```

### EC2:
```bash
# Monitor CPU usage
# If > 80%: Upgrade instance type or add more instances
```

---

## ✅ Post-Deployment Checklist

```
☐ Application running and accessible
☐ Can register users (data in DynamoDB)
☐ Can upload materials (files in S3)
☐ CloudWatch monitoring active
☐ SSL certificate installed
☐ Nginx reverse proxy configured
☐ PM2 auto-restart enabled
☐ Logs being collected
☐ Security groups properly configured
☐ Backups scheduled (optional)
```

---

**Last Updated:** October 6, 2026
**Status:** Ready for production deployment
