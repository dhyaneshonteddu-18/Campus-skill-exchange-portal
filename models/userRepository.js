// User Repository - DynamoDB operations for users
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const dynamodbService = require('../services/dynamodbService');

const TABLE_NAME = process.env.DYNAMODB_USERS_TABLE || 'CampusSkillExchange-Users';

class UserRepository {
  // Create new user
  async createUser(email, password, name, department, year, bio = '') {
    try {
      const userId = uuidv4();
      const passwordHash = bcrypt.hashSync(password, 10);
      const user = {
        userId,
        email,
        passwordHash,
        name,
        department,
        year,
        bio,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await dynamodbService.putItem(TABLE_NAME, user);
      return this._sanitizeUser(user);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const user = await dynamodbService.getItem(TABLE_NAME, { userId });
      return user ? this._sanitizeUser(user) : null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  // Get user by email
  async getUserByEmail(email) {
    try {
      const users = await dynamodbService.scanTable(
        TABLE_NAME,
        'email = :email',
        { ':email': email }
      );
      return users.length > 0 ? this._sanitizeUser(users[0]) : null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  // Authenticate user
  async authenticateUser(email, password) {
    try {
      const users = await dynamodbService.scanTable(
        TABLE_NAME,
        'email = :email',
        { ':email': email }
      );

      if (users.length === 0) {
        return null;
      }

      const user = users[0];
      const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);

      if (!isPasswordValid) {
        return null;
      }

      return this._sanitizeUser(user);
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      const updateExpression = [];
      const expressionAttributeValues = {};
      const allowedFields = ['name', 'department', 'year', 'bio'];

      Object.keys(updates).forEach((key, index) => {
        if (allowedFields.includes(key)) {
          updateExpression.push(`${key} = :val${index}`);
          expressionAttributeValues[`:val${index}`] = updates[key];
        }
      });

      updateExpression.push('updatedAt = :updatedAt');
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();

      const updated = await dynamodbService.updateItem(
        TABLE_NAME,
        { userId },
        `SET ${updateExpression.join(', ')}`,
        expressionAttributeValues
      );

      return this._sanitizeUser(updated);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Get all users (for search)
  async getAllUsers() {
    try {
      return await dynamodbService.scanTable(TABLE_NAME);
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Remove password hash from user object
  _sanitizeUser(user) {
    const sanitized = { ...user };
    delete sanitized.passwordHash;
    return sanitized;
  }
}

module.exports = new UserRepository();
