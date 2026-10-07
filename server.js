const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

// Import repositories
const userRepository = require('./models/userRepository');
const skillRepository = require('./models/skillRepository');
const materialRepository = require('./models/materialRepository');
const requestRepository = require('./models/requestRepository');
const s3Service = require('./services/s3Service');

const app = express();
const PORT = process.env.PORT || 3000;
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';
const S3_BUCKET = process.env.S3_BUCKET_NAME || 'campus-skill-exchange-materials';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/png', 'image/jpeg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

// ===== GET PAGES =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== AUTHENTICATION =====
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, department, year, bio } = req.body;

    if (!name || !email || !password || !department || !year) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    const existingUser = await userRepository.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await userRepository.createUser(email, password, name, department, year, bio);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      userId: user.userId,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await userRepository.authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      userId: user.userId,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

// ===== SKILLS =====
app.get('/api/skills', async (req, res) => {
  try {
    const { search } = req.query;
    const skills = await skillRepository.getAllSkills(search);

    // Enrich with user information
    const enrichedSkills = await Promise.all(
      skills.map(async (skill) => {
        const user = await userRepository.getUserById(skill.userId);
        return {
          ...skill,
          userName: user?.name || 'Unknown',
          userDepartment: user?.department || 'Unknown',
          userYear: user?.year || 'Unknown'
        };
      })
    );

    res.json({ success: true, skills: enrichedSkills, count: enrichedSkills.length });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch skills', error: error.message });
  }
});

app.post('/api/skills', async (req, res) => {
  try {
    const { userId, skillName, description } = req.body;

    if (!userId || !skillName) {
      return res.status(400).json({ success: false, message: 'User ID and skill name required' });
    }

    const user = await userRepository.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const skill = await skillRepository.createSkill(userId, skillName, description || '');

    res.status(201).json({ success: true, message: 'Skill added', skill });
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({ success: false, message: 'Failed to add skill', error: error.message });
  }
});

app.delete('/api/skills/:skillId', async (req, res) => {
  try {
    const { skillId } = req.params;

    const skill = await skillRepository.getSkillById(skillId);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    await skillRepository.deleteSkill(skillId);
    res.json({ success: true, message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete skill', error: error.message });
  }
});

// ===== LEARNING REQUESTS =====
app.post('/api/requests', async (req, res) => {
  try {
    const { senderId, receiverId, skillId, skillName } = req.body;

    if (!senderId || !receiverId || !skillId || !skillName) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ success: false, message: 'Cannot send request to yourself' });
    }

    const request = await requestRepository.createRequest(senderId, receiverId, skillId, skillName);

    res.status(201).json({ success: true, message: 'Request sent', request });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ success: false, message: 'Failed to send request', error: error.message });
  }
});

app.get('/api/requests/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userRepository.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const requests = await requestRepository.getUserRequests(userId);

    // Enrich with user information
    const enrichedReceived = await Promise.all(
      requests.received.map(async (r) => {
        const sender = await userRepository.getUserById(r.senderId);
        return {
          ...r,
          senderName: sender?.name || 'Unknown',
          senderDepartment: sender?.department || 'Unknown'
        };
      })
    );

    const enrichedSent = await Promise.all(
      requests.sent.map(async (r) => {
        const receiver = await userRepository.getUserById(r.receiverId);
        return {
          ...r,
          receiverName: receiver?.name || 'Unknown',
          receiverDepartment: receiver?.department || 'Unknown'
        };
      })
    );

    res.json({
      success: true,
      receivedRequests: enrichedReceived,
      sentRequests: enrichedSent
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch requests', error: error.message });
  }
});

app.put('/api/requests/:requestId/accept', async (req, res) => {
  try {
    const request = await requestRepository.acceptRequest(req.params.requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    res.json({ success: true, message: 'Request accepted', request });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ success: false, message: 'Failed to accept request', error: error.message });
  }
});

app.put('/api/requests/:requestId/reject', async (req, res) => {
  try {
    const request = await requestRepository.rejectRequest(req.params.requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    res.json({ success: true, message: 'Request rejected', request });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject request', error: error.message });
  }
});

// ===== MATERIALS =====
app.post('/api/materials', upload.single('file'), async (req, res) => {
  try {
    const { userId, title, description } = req.body;
    const file = req.file;

    if (!userId || !title || !file) {
      return res.status(400).json({ success: false, message: 'User ID, title, and file required' });
    }

    const user = await userRepository.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Upload file to S3
    const s3Key = `materials/${userId}/${Date.now()}-${file.originalname}`;
    const uploadResult = await s3Service.uploadFile(S3_BUCKET, s3Key, file.buffer, file.mimetype, {
      userId,
      fileName: file.originalname
    });

    // Create material record in DynamoDB
    const material = await materialRepository.createMaterial(
      userId,
      title,
      description || '',
      file.originalname,
      s3Key,
      uploadResult.url
    );

    res.status(201).json({ success: true, message: 'Material uploaded', material });
  } catch (error) {
    console.error('Upload material error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload material', error: error.message });
  }
});

app.get('/api/materials', async (req, res) => {
  try {
    const { userId, requesterId } = req.query;
    let materials;

    if (userId) {
      // Get materials for specific user (owner only sees their own)
      materials = await materialRepository.getMaterialsByUserId(userId);
    } else {
      // Get all materials available to requester
      materials = await materialRepository.getAllMaterials();
    }

    // Enrich with user information and access permission
    const enriched = await Promise.all(
      materials.map(async (m) => {
        const user = await userRepository.getUserById(m.userId);
        let canDownload = false;

        // Check if requester has accepted request from uploader
        if (requesterId && requesterId !== m.userId) {
          const requests = await requestRepository.getUserRequests(requesterId);
          // Check if there's an accepted request from requester to uploader
          canDownload = requests.sent.some(r => 
            r.receiverId === m.userId && r.status === 'Accepted'
          );
        }

        return {
          ...m,
          userName: user?.name || 'Unknown',
          canDownload: canDownload || (requesterId === m.userId) // Owner can always download
        };
      })
    );

    res.json({ success: true, materials: enriched, count: enriched.length });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch materials', error: error.message });
  }
});

app.delete('/api/materials/:materialId', async (req, res) => {
  try {
    const { materialId } = req.params;

    const material = await materialRepository.getMaterialById(materialId);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    // Delete from S3
    await s3Service.deleteFile(S3_BUCKET, material.s3Key);

    // Delete from DynamoDB
    await materialRepository.deleteMaterial(materialId);

    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete material', error: error.message });
  }
});

app.get('/download/:materialId', async (req, res) => {
  try {
    const { materialId } = req.params;
    const { userId } = req.query; // Requester user ID

    const material = await materialRepository.getMaterialById(materialId);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    // Check access permissions
    let hasAccess = false;

    if (!userId) {
      // No user ID provided
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    if (userId === material.userId) {
      // Owner can always download their own materials
      hasAccess = true;
    } else {
      // Check if user has accepted request from material owner
      const requests = await requestRepository.getUserRequests(userId);
      hasAccess = requests.sent.some(r => 
        r.receiverId === material.userId && r.status === 'Accepted'
      );
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied. Only accepted connections can download materials.' });
    }

    // Generate presigned URL for download
    const presignedUrl = await s3Service.getPresignedDownloadUrl(S3_BUCKET, material.s3Key, 3600);

    // Redirect to presigned URL
    res.redirect(presignedUrl);
  } catch (error) {
    console.error('Download material error:', error);
    res.status(500).json({ success: false, message: 'Failed to download material', error: error.message });
  }
});

// ===== PROFILE =====
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userRepository.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const skills = await skillRepository.getSkillsByUserId(userId);

    res.json({
      success: true,
      user,
      skills
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile', error: error.message });
  }
});

app.put('/api/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, department, year, bio } = req.body;

    const user = await userRepository.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (department) updates.department = department;
    if (year) updates.year = year;
    if (bio !== undefined) updates.bio = bio;

    const updatedUser = await userRepository.updateUserProfile(userId, updates);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
});

// ===== DASHBOARD =====
app.get('/api/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userRepository.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userSkills = await skillRepository.getSkillsByUserId(userId);
    const userMaterials = await materialRepository.getMaterialsByUserId(userId);
    const requests = await requestRepository.getUserRequests(userId);

    const pendingRequests = requests.received.filter(r => r.status === 'Pending');
    const acceptedRequests = requests.received.filter(r => r.status === 'Accepted');

    res.json({
      success: true,
      stats: {
        skillCount: userSkills.length,
        materialCount: userMaterials.length,
        pendingRequests: pendingRequests.length,
        acceptedRequests: acceptedRequests.length
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats', error: error.message });
  }
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`Campus Skill Exchange Portal running on http://localhost:${PORT}`);
  if (USE_MOCK_DATA) {
    console.log('Using mock data for local development');
  } else {
    console.log('Using AWS DynamoDB and S3');
  }
});
