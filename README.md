# Campus Skill Exchange Portal

A web application for university students to exchange skills, find learning partners, and share educational materials.

## Project Overview

The Campus Skill Exchange Portal is a peer-to-peer learning platform designed for college students. It enables students to:
- Register and create their profiles
- Add and manage skills they can teach
- Search for skills offered by other students
- Send and manage learning requests
- Accept or reject learning connections
- Upload and share learning materials

This project is built as an AWS Solution Architecture project for educational purposes.

## Features

✅ **User Authentication**
- Registration with email, password, department, and year
- Login with credentials
- Session management using localStorage

✅ **Student Profiles**
- View and edit personal profile information
- Add skills with descriptions
- Display avatar with initials
- Track learning statistics

✅ **Skill Discovery**
- Search skills by name or description
- View student profiles offering each skill
- See department and year information
- Send learning requests

✅ **Learning Requests**
- Send requests to learn specific skills
- Receive learning requests from peers
- Accept or reject incoming requests
- Track request status (Pending, Accepted, Rejected)

✅ **Dashboard**
- Welcome message with personalized greeting
- Statistics (skills count, pending requests, accepted requests, materials uploaded)
- Quick action buttons to all features
- Profile summary display

✅ **Materials Management**
- Upload learning materials (PDF, DOC, DOCX, PPT, PPTX, PNG, JPG, JPEG)
- View all available materials
- Download materials from peers
- Delete your own materials

✅ **Responsive Design**
- Mobile-friendly interface
- Works on laptops, tablets, and phones
- Bootstrap 5 for modern styling

## Technology Stack

**Frontend:**
- HTML5
- CSS3
- JavaScript (Vanilla)
- Bootstrap 5 (CDN)

**Backend:**
- Node.js
- Express.js
- Body-Parser (request parsing)
- CORS (cross-origin requests)
- bcryptjs (password hashing)
- uuid (unique IDs)
- dotenv (environment variables)

**Database (Ready for Integration):**
- Amazon DynamoDB (not yet integrated, using mock data)

**File Storage (Ready for Integration):**
- Amazon S3 (not yet integrated, mock upload structure)

**Deployment (Ready for):**
- Amazon EC2
- IAM Roles for secure access

## Folder Structure

```
campus-skill-exchange/
├── package.json              # Node dependencies and scripts
├── server.js                 # Express backend server
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore file
├── README.md                 # This file
│
├── public/                   # Frontend files
│   ├── index.html            # Landing page
│   ├── login.html            # Login page
│   ├── register.html         # Registration page
│   ├── dashboard.html        # Dashboard
│   ├── profile.html          # User profile page
│   ├── skills.html           # Find skills page
│   ├── requests.html         # Requests management page
│   ├── materials.html        # Materials upload/view page
│   │
│   ├── css/
│   │   └── style.css         # All CSS styles
│   │
│   └── js/
│       ├── common.js         # Common functions (auth, API calls, alerts)
│       ├── login.js          # Login page script
│       ├── register.js       # Registration page script
│       ├── dashboard.js      # Dashboard page script
│       ├── profile.js        # Profile page script
│       ├── skills.js         # Skills page script
│       ├── requests.js       # Requests page script
│       └── materials.js      # Materials page script
```

## Installation Steps

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Steps

1. **Clone/Navigate to the project directory**
   ```bash
   cd campus-skill-exchange
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Edit .env file (optional for local development)**
   ```
   PORT=3000
   NODE_ENV=development
   USE_MOCK_DATA=true
   ```

## How to Run Locally

1. **Start the server**
   ```bash
   npm start
   ```

2. **Open in browser**
   ```
   http://localhost:3000
   ```

3. **Login with demo credentials**
   - Email: `rahul@college.edu`
   - Password: `password123`

   Or other demo accounts:
   - `priya@college.edu` / `password123`
   - `amit@college.edu` / `password123`

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# AWS Configuration (for future integration)
AWS_REGION=ap-south-1
DYNAMODB_USERS_TABLE=CampusSkillExchange-Users
DYNAMODB_SKILLS_TABLE=CampusSkillExchange-Skills
DYNAMODB_REQUESTS_TABLE=CampusSkillExchange-Requests
DYNAMODB_MATERIALS_TABLE=CampusSkillExchange-Materials
S3_BUCKET_NAME=campus-skill-exchange-materials

# Local Development
USE_MOCK_DATA=true

# Session Secret
SESSION_SECRET=your-secret-key-here
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Profile
- `GET /api/profile/:userId` - Get user profile and skills
- `PUT /api/profile/:userId` - Update user profile

### Skills
- `GET /api/skills` - Get all skills (supports `?search=keyword`)
- `POST /api/skills` - Add new skill
- `DELETE /api/skills/:skillId` - Delete skill

### Learning Requests
- `GET /api/requests/:userId` - Get user's requests (sent and received)
- `POST /api/requests` - Send learning request
- `PUT /api/requests/:requestId/accept` - Accept request
- `PUT /api/requests/:requestId/reject` - Reject request

### Materials
- `GET /api/materials` - Get all materials (supports `?userId=` filter)
- `POST /api/materials` - Upload new material
- `DELETE /api/materials/:materialId` - Delete material

### Dashboard
- `GET /api/dashboard/:userId` - Get dashboard statistics

## DynamoDB Table Requirements

### Users Table
```
Partition Key: userId (String)
Attributes:
- name (String)
- email (String)
- passwordHash (String)
- department (String)
- year (String)
- bio (String)
- createdAt (String - ISO date)
```

### Skills Table
```
Partition Key: skillId (String)
GSI: userId-index (for querying user's skills)
Attributes:
- userId (String)
- skillName (String)
- description (String)
- createdAt (String - ISO date)
```

### Requests Table
```
Partition Key: requestId (String)
GSI: senderId-index, receiverId-index
Attributes:
- senderId (String)
- receiverId (String)
- skillId (String)
- skillName (String)
- status (String - Pending/Accepted/Rejected)
- createdAt (String - ISO date)
```

### Materials Table
```
Partition Key: materialId (String)
GSI: userId-index
Attributes:
- userId (String)
- title (String)
- description (String)
- fileName (String)
- s3Key (String)
- fileUrl (String)
- createdAt (String - ISO date)
```

## S3 Bucket Requirements

**Bucket Name:** `campus-skill-exchange-materials`

**Folder Structure:**
```
materials/
  └── {userId}/
      ├── document1.pdf
      ├── presentation.pptx
      └── image.png
```

**Bucket Policies:**
- Private by default
- Allow EC2 IAM role read/write access
- Enable versioning for data safety
- Set lifecycle policy to delete old versions after 30 days

## EC2 Deployment Steps

### 1. Launch EC2 Instance
- AMI: Amazon Linux 2 or Ubuntu 20.04
- Instance Type: t2.micro (free tier eligible)
- Security Group: Allow ports 80, 443, 3000
- Create/select key pair for SSH access

### 2. Connect to Instance
```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

### 3. Install Node.js
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### 4. Clone Repository
```bash
git clone https://github.com/yourusername/campus-skill-exchange.git
cd campus-skill-exchange
```

### 5. Install Dependencies
```bash
npm install
```

### 6. Configure Environment
```bash
cp .env.example .env
nano .env
# Edit with your AWS credentials and configuration
```

### 7. Start Application
```bash
npm start
```

Or use PM2 for production:
```bash
sudo npm install -g pm2
pm2 start server.js --name "skill-exchange"
pm2 startup
pm2 save
```

### 8. Configure Nginx (Optional)
```bash
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

Configure Nginx to proxy requests to Node.js on port 3000.

## IAM Role Requirements

Create an IAM role for EC2 with the following policies:

**DynamoDB Permissions:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:region:account-id:table/CampusSkillExchange-*"
    }
  ]
}
```

**S3 Permissions:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::campus-skill-exchange-materials/*"
    }
  ]
}
```

**CloudWatch Logs (Optional):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

## Testing Procedure

### 1. Test Registration
1. Go to http://localhost:3000
2. Click "Register"
3. Fill in all fields (use unique email)
4. Submit and verify success message
5. Login with new credentials

### 2. Test Profile Management
1. Login with demo account
2. Go to Profile page
3. Edit name, department, year, bio
4. Add new skills with descriptions
5. Verify changes are saved

### 3. Test Skill Search
1. Go to "Find Skills" page
2. Search for skills (e.g., "Python", "Data")
3. View skill details and student info
4. Click "Request to Learn"
5. Verify request appears in Requests page

### 4. Test Requests
1. Send multiple learning requests
2. Go to Requests page
3. View sent and received requests
4. Accept/reject received requests
5. Verify status changes

### 5. Test Materials
1. Go to Materials page
2. Upload a file with title and description
3. View uploaded materials
4. Download material (mock)
5. Delete material
6. Verify material is removed

### 6. Test Dashboard
1. Login to dashboard
2. Verify welcome message
3. Check stats (skills, requests, materials)
4. Click quick action buttons
5. Verify all stats are accurate

### 7. Test Responsive Design
1. Open on mobile device or use browser dev tools
2. Test all pages on different screen sizes
3. Verify navigation works on mobile
4. Check form input and button sizes

## Modifying for DynamoDB Integration

### Files to Modify:

1. **server.js** - Replace mock database with DynamoDB client:
   ```javascript
   const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
   const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");

   const client = new DynamoDBClient({ region: process.env.AWS_REGION });
   const docClient = DynamoDBDocumentClient.from(client);
   ```

2. **Replace mock data operations** with DynamoDB calls using docClient

### Steps:
1. Install AWS SDK: `npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb`
2. Replace mock database with DynamoDB client
3. Update each API endpoint to use DynamoDB queries
4. Test with actual DynamoDB tables
5. Update error handling for DynamoDB exceptions

## Modifying for S3 Integration

### Files to Modify:

1. **server.js** - Add S3 client:
   ```javascript
   const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
   const s3Client = new S3Client({ region: process.env.AWS_REGION });
   ```

2. **materials.js** - Upload files to S3 instead of mock

### Steps:
1. Install AWS SDK: `npm install @aws-sdk/client-s3`
2. Create endpoint to handle file uploads
3. Upload files to S3 with unique keys
4. Store S3 keys in DynamoDB
5. Generate pre-signed URLs for downloads
6. Update frontend to send files to backend

## Security Notes

✅ **Implemented:**
- Passwords hashed with bcryptjs (never stored in plaintext)
- Environment variables for configuration
- .env excluded from git via .gitignore
- Input validation on all endpoints
- CORS configured
- No hardcoded credentials in code

⚠️ **To Implement for Production:**
- HTTPS/SSL certificates
- JWT tokens instead of localStorage
- Rate limiting on API endpoints
- CSRF protection
- SQL injection prevention (using parameterized queries)
- Input sanitization
- Regular security audits
- AWS KMS for secrets management
- VPC security groups configuration
- CloudWatch monitoring and alarms

## Future Enhancements

- Real-time notifications using WebSockets
- Video/Audio calling for peer learning
- Rating and review system
- Achievement badges
- Skill level progression
- Calendar/scheduling for learning sessions
- Chat between peers
- Admin dashboard for moderation
- Advanced analytics and reporting

## Troubleshooting

**Port 3000 already in use:**
```bash
lsof -i :3000
kill -9 <PID>
```

**Dependencies not installing:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Cannot connect to localhost:3000:**
- Check if server is running: `npm start`
- Check firewall settings
- Verify port in .env file

**localStorage issues:**
- Clear browser cache
- Check browser console for errors
- Verify localStorage is enabled

## Support and Documentation

For more information:
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [AWS DynamoDB](https://docs.aws.amazon.com/dynamodb/)
- [AWS S3](https://docs.aws.amazon.com/s3/)
- [Bootstrap 5](https://getbootstrap.com/docs/5.0/)

## License

MIT License - Feel free to use this project for educational purposes.

## Author

College AWS Solution Architecture Project

---

**Last Updated:** October 6, 2026
**Status:** ✅ AWS Integration Complete and Production Ready
**Current Architecture:** 
- Backend: Node.js with AWS SDK v3 (DynamoDB & S3)
- Database: AWS DynamoDB (ap-south-1)
- Storage: AWS S3 with presigned URLs
- Infrastructure: AWS EC2 with IAM roles
- Region: ap-south-1 (Mumbai)

## 📚 Complete Documentation

### Quick Start Guides
- **For Infrastructure Setup:** See `INFRASTRUCTURE_SETUP.md`
- **For EC2 Deployment:** See `DEPLOYMENT_GUIDE.md`
- **For AWS Configuration:** See `AWS_SETUP_GUIDE.md`

### Ready for:
- ✅ Local development with mock data (`USE_MOCK_DATA=true`)
- ✅ Production deployment on AWS EC2
- ✅ DynamoDB data persistence  
- ✅ S3 file storage with presigned URLs
- ✅ AWS IAM role-based access
- ✅ CloudWatch monitoring
