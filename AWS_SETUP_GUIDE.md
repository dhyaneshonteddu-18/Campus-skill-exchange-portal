# AWS Setup Guide for Campus Skill Exchange Portal

## Prerequisites
- AWS Account with appropriate permissions
- AWS CLI installed (optional but recommended)
- Node.js installed

## Step 1: Configure AWS Credentials

### Option A: Using AWS CLI (Recommended)
```bash
aws configure
```
This will prompt you for:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `ap-south-1`
- Default output format: `json`

### Option B: Using Environment Variables
```bash
export AWS_ACCESS_KEY_ID=your-access-key-id
export AWS_SECRET_ACCESS_KEY=your-secret-access-key
export AWS_REGION=ap-south-1
```

### Option C: Using AWS Credentials File
Create `~/.aws/credentials` file:
```
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
```

Create `~/.aws/config` file:
```
[default]
region = ap-south-1
output = json
```

## Step 2: Verify DynamoDB Tables

The following tables should already exist in your AWS account:
- ✅ `CampusSkillExchange-Users`
- ✅ `CampusSkillExchange-Skills`
- ✅ `CampusSkillExchange-Requests`
- ✅ `CampusSkillExchange-Materials`

### Verify via AWS CLI:
```bash
aws dynamodb list-tables --region ap-south-1
```

## Step 3: Create S3 Bucket

Create an S3 bucket for storing learning materials:

### Via AWS Console:
1. Go to S3 Dashboard
2. Click "Create Bucket"
3. Bucket name: `campus-skill-exchange-materials`
4. Region: `ap-south-1`
5. Click "Create"

### Via AWS CLI:
```bash
aws s3 mb s3://campus-skill-exchange-materials --region ap-south-1
```

## Step 4: Configure IAM Permissions

Your AWS user/role needs these permissions:

### DynamoDB Permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:ap-south-1:*:table/CampusSkillExchange-*"
      ]
    }
  ]
}
```

### S3 Permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::campus-skill-exchange-materials",
        "arn:aws:s3:::campus-skill-exchange-materials/*"
      ]
    }
  ]
}
```

## Step 5: Start the Server

```bash
cd /Users/tripurasundari/Desktop/aws_project/campus-skill-exchange
npm start
```

The server will:
- Connect to DynamoDB automatically
- Use S3 for file uploads
- Run on `http://localhost:3000`

## Step 6: Test the Application

1. Open browser: `http://localhost:3000`
2. Register a new account
3. Add skills
4. Upload learning materials
5. View dashboard statistics

## Troubleshooting

### "Could not load credentials from any providers"
- Ensure AWS credentials are configured properly
- Check `aws configure` has been run
- Verify environment variables are set

### "UnknownEndpoint: Could not construct an endpoint"
- Verify AWS_REGION is set to `ap-south-1`
- Check internet connection

### "The table does not exist"
- Verify DynamoDB tables are created in AWS console
- Check table names match `.env` file

### "AccessDenied on S3"
- Verify IAM permissions are configured
- Check bucket name in `.env` matches AWS bucket

## Environment Variables (.env)

```
PORT=3000
NODE_ENV=development
AWS_REGION=ap-south-1
DYNAMODB_USERS_TABLE=CampusSkillExchange-Users
DYNAMODB_SKILLS_TABLE=CampusSkillExchange-Skills
DYNAMODB_REQUESTS_TABLE=CampusSkillExchange-Requests
DYNAMODB_MATERIALS_TABLE=CampusSkillExchange-Materials
S3_BUCKET_NAME=campus-skill-exchange-materials
USE_MOCK_DATA=false
SESSION_SECRET=your-secret-key-here
```

## Production Deployment

For production deployment (AWS Lambda, EC2, etc.):

1. Use IAM roles instead of credentials files
2. Set `USE_MOCK_DATA=false`
3. Configure proper security groups
4. Use CloudFront for S3 content distribution
5. Enable DynamoDB auto-scaling
6. Set up CloudWatch monitoring

## Backend Architecture

```
config/aws.js                  # AWS configuration
services/
  ├── dynamodbService.js       # DynamoDB CRUD operations
  └── s3Service.js             # S3 file operations
models/
  ├── userRepository.js        # User operations
  ├── skillRepository.js       # Skill operations
  ├── materialRepository.js    # Material operations
  └── requestRepository.js     # Request operations
server.js                      # Main Express server
```

All data is now stored in AWS DynamoDB, and files are uploaded to S3!
