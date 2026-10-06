const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Mock Database
const db = {
  users: {
    'user1': {
      userId: 'user1',
      name: 'Rahul Kumar',
      email: 'rahul@college.edu',
      passwordHash: bcrypt.hashSync('password123', 10),
      department: 'Computer Science',
      year: '3rd',
      bio: 'Passionate about web development and AI',
      createdAt: new Date().toISOString()
    },
    'user2': {
      userId: 'user2',
      name: 'Priya Singh',
      email: 'priya@college.edu',
      passwordHash: bcrypt.hashSync('password123', 10),
      department: 'Information Technology',
      year: '2nd',
      bio: 'Expert in data science and Python',
      createdAt: new Date().toISOString()
    },
    'user3': {
      userId: 'user3',
      name: 'Amit Patel',
      email: 'amit@college.edu',
      passwordHash: bcrypt.hashSync('password123', 10),
      department: 'Electronics',
      year: '1st',
      bio: 'Learning web development',
      createdAt: new Date().toISOString()
    }
  },
  skills: {
    'skill1': { skillId: 'skill1', userId: 'user1', skillName: 'Python', description: 'Python fundamentals, data structures, OOP', createdAt: new Date().toISOString() },
    'skill2': { skillId: 'skill2', userId: 'user2', skillName: 'Data Science', description: 'Machine learning and data analysis', createdAt: new Date().toISOString() },
    'skill3': { skillId: 'skill3', userId: 'user1', skillName: 'Web Development', description: 'Full-stack web development with Node.js', createdAt: new Date().toISOString() },
    'skill4': { skillId: 'skill4', userId: 'user2', skillName: 'SQL', description: 'Database design and SQL queries', createdAt: new Date().toISOString() }
  },
  requests: {},
  materials: {
    'material1': {
      materialId: 'material1',
      userId: 'user1',
      title: 'Java',
      description: 'Master Java programming fundamentals',
      fileName: 'AWS_architecture.png',
      s3Key: 'materials/user1/AWS_architecture.png',
      fileUrl: '/files/material1',
      createdAt: new Date().toISOString()
    },
    'material2': {
      materialId: 'material2',
      userId: 'user2',
      title: 'Python Basics',
      description: 'Introduction to Python programming',
      fileName: 'python_guide.pdf',
      s3Key: 'materials/user2/python_guide.pdf',
      fileUrl: '/files/material2',
      createdAt: new Date().toISOString()
    }
  }
};


// ===== GET PAGES =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== AUTHENTICATION =====
app.post('/api/register', (req, res) => {
  try {
    const { name, email, password, department, year, bio } = req.body;

    if (!name || !email || !password || !department || !year) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    if (Object.values(db.users).some(u => u.email === email)) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const userId = uuidv4();
    db.users[userId] = {
      userId,
      name,
      email,
      passwordHash: bcrypt.hashSync(password, 10),
      department,
      year,
      bio: bio || '',
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      userId,
      user: { userId, name, email, department, year, bio }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = Object.values(db.users).find(u => u.email === email);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      userId: user.userId,
      user: { userId: user.userId, name: user.name, email: user.email, department: user.department, year: user.year, bio: user.bio }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// ===== SKILLS =====
app.get('/api/skills', (req, res) => {
  try {
    const { search } = req.query;
    let skills = Object.values(db.skills);

    if (search) {
      skills = skills.filter(s => 
        s.skillName.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    const enriched = skills.map(skill => ({
      ...skill,
      userName: db.users[skill.userId]?.name || 'Unknown',
      userDepartment: db.users[skill.userId]?.department || 'Unknown',
      userYear: db.users[skill.userId]?.year || 'Unknown'
    }));

    res.json({ success: true, skills: enriched, count: enriched.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch skills' });
  }
});

app.post('/api/skills', (req, res) => {
  try {
    const { userId, skillName, description } = req.body;

    if (!userId || !skillName) {
      return res.status(400).json({ success: false, message: 'User ID and skill name required' });
    }

    if (!db.users[userId]) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const skillId = uuidv4();
    db.skills[skillId] = { skillId, userId, skillName, description: description || '', createdAt: new Date().toISOString() };

    res.status(201).json({ success: true, message: 'Skill added', skill: db.skills[skillId] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add skill' });
  }
});

app.delete('/api/skills/:skillId', (req, res) => {
  try {
    const { skillId } = req.params;

    if (!db.skills[skillId]) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    delete db.skills[skillId];
    res.json({ success: true, message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete skill' });
  }
});

// ===== LEARNING REQUESTS =====
app.post('/api/requests', (req, res) => {
  try {
    const { senderId, receiverId, skillId, skillName } = req.body;

    if (!senderId || !receiverId || !skillId || !skillName) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ success: false, message: 'Cannot send request to yourself' });
    }

    const requestId = uuidv4();
    db.requests[requestId] = {
      requestId,
      senderId,
      receiverId,
      skillId,
      skillName,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    res.status(201).json({ success: true, message: 'Request sent', request: db.requests[requestId] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send request' });
  }
});

app.get('/api/requests/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    if (!db.users[userId]) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const received = Object.values(db.requests).filter(r => r.receiverId === userId);
    const sent = Object.values(db.requests).filter(r => r.senderId === userId);

    res.json({
      success: true,
      receivedRequests: received.map(r => ({
        ...r,
        senderName: db.users[r.senderId]?.name || 'Unknown',
        senderDepartment: db.users[r.senderId]?.department || 'Unknown'
      })),
      sentRequests: sent.map(r => ({
        ...r,
        receiverName: db.users[r.receiverId]?.name || 'Unknown',
        receiverDepartment: db.users[r.receiverId]?.department || 'Unknown'
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch requests' });
  }
});

app.put('/api/requests/:requestId/accept', (req, res) => {
  try {
    if (!db.requests[req.params.requestId]) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    db.requests[req.params.requestId].status = 'Accepted';
    res.json({ success: true, message: 'Request accepted', request: db.requests[req.params.requestId] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to accept request' });
  }
});

app.put('/api/requests/:requestId/reject', (req, res) => {
  try {
    if (!db.requests[req.params.requestId]) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    db.requests[req.params.requestId].status = 'Rejected';
    res.json({ success: true, message: 'Request rejected', request: db.requests[req.params.requestId] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reject request' });
  }
});

// ===== MATERIALS =====
app.post('/api/materials', (req, res) => {
  try {
    const { userId, title, description, fileName } = req.body;

    if (!userId || !title || !fileName) {
      return res.status(400).json({ success: false, message: 'User ID, title, and file name required' });
    }

    if (!db.users[userId]) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const materialId = uuidv4();
    db.materials[materialId] = {
      materialId,
      userId,
      title,
      description: description || '',
      fileName,
      s3Key: `materials/${userId}/${fileName}`,
      fileUrl: `/files/${materialId}`,
      createdAt: new Date().toISOString()
    };

    res.status(201).json({ success: true, message: 'Material uploaded', material: db.materials[materialId] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upload material' });
  }
});

app.get('/api/materials', (req, res) => {
  try {
    const { userId } = req.query;
    let materials = Object.values(db.materials);

    if (userId) {
      materials = materials.filter(m => m.userId === userId);
    }

    const enriched = materials.map(m => ({
      ...m,
      userName: db.users[m.userId]?.name || 'Unknown'
    }));

    res.json({ success: true, materials: enriched, count: enriched.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch materials' });
  }
});

app.delete('/api/materials/:materialId', (req, res) => {
  try {
    const { materialId } = req.params;

    if (!db.materials[materialId]) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    delete db.materials[materialId];
    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete material' });
  }
});

app.get('/download/:materialId', (req, res) => {
  try {
    const { materialId } = req.params;

    if (!db.materials[materialId]) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    const material = db.materials[materialId];
    
    // For mock purposes, create a text file with material info
    // In production, this would download from S3
    const fileContent = `Material: ${material.title}\nDescription: ${material.description}\nUploaded: ${material.createdAt}`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${material.fileName}"`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(fileContent);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to download material' });
  }
});

// ===== PROFILE =====
app.get('/api/profile/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    if (!db.users[userId]) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = db.users[userId];
    const skills = Object.values(db.skills).filter(s => s.userId === userId);

    res.json({
      success: true,
      user: { userId: user.userId, name: user.name, email: user.email, department: user.department, year: user.year, bio: user.bio },
      skills
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

app.put('/api/profile/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { name, department, year, bio } = req.body;

    if (!db.users[userId]) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) db.users[userId].name = name;
    if (department) db.users[userId].department = department;
    if (year) db.users[userId].year = year;
    if (bio !== undefined) db.users[userId].bio = bio;

    const user = db.users[userId];
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: { userId: user.userId, name: user.name, email: user.email, department: user.department, year: user.year, bio: user.bio }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// ===== DASHBOARD =====
app.get('/api/dashboard/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    if (!db.users[userId]) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userSkills = Object.values(db.skills).filter(s => s.userId === userId);
    const userMaterials = Object.values(db.materials).filter(m => m.userId === userId);
    const pendingRequests = Object.values(db.requests).filter(r => r.receiverId === userId && r.status === 'Pending');
    const acceptedRequests = Object.values(db.requests).filter(r => (r.receiverId === userId || r.senderId === userId) && r.status === 'Accepted');

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
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
});

// ===== START SERVER =====

app.listen(PORT, () => {
  console.log(`Campus Skill Exchange Portal running on http://localhost:${PORT}`);
  console.log('Using mock data for local development');
});
