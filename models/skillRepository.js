// Skill Repository - DynamoDB operations for skills
const { v4: uuidv4 } = require('uuid');
const dynamodbService = require('../services/dynamodbService');

const TABLE_NAME = process.env.DYNAMODB_SKILLS_TABLE || 'CampusSkillExchange-Skills';

class SkillRepository {
  // Create new skill
  async createSkill(userId, skillName, description = '') {
    try {
      const skillId = uuidv4();
      const skill = {
        skillId,
        userId,
        skillName,
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await dynamodbService.putItem(TABLE_NAME, skill);
      return skill;
    } catch (error) {
      console.error('Error creating skill:', error);
      throw error;
    }
  }

  // Get skill by ID
  async getSkillById(skillId) {
    try {
      const skill = await dynamodbService.getItem(TABLE_NAME, { skillId });
      return skill || null;
    } catch (error) {
      console.error('Error getting skill by ID:', error);
      throw error;
    }
  }

  // Get skills by user ID
  async getSkillsByUserId(userId) {
    try {
      const skills = await dynamodbService.scanTable(
        TABLE_NAME,
        'userId = :userId',
        { ':userId': userId }
      );
      return skills;
    } catch (error) {
      console.error('Error getting skills by user ID:', error);
      throw error;
    }
  }

  // Get all skills (for search)
  async getAllSkills(searchText = '') {
    try {
      if (searchText) {
        const skills = await dynamodbService.scanTable(TABLE_NAME);
        return skills.filter(skill =>
          skill.skillName.toLowerCase().includes(searchText.toLowerCase()) ||
          skill.description.toLowerCase().includes(searchText.toLowerCase())
        );
      }
      return await dynamodbService.scanTable(TABLE_NAME);
    } catch (error) {
      console.error('Error getting all skills:', error);
      throw error;
    }
  }

  // Update skill
  async updateSkill(skillId, updates) {
    try {
      const updateExpression = [];
      const expressionAttributeValues = {};
      const allowedFields = ['skillName', 'description'];

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
        { skillId },
        `SET ${updateExpression.join(', ')}`,
        expressionAttributeValues
      );

      return updated;
    } catch (error) {
      console.error('Error updating skill:', error);
      throw error;
    }
  }

  // Delete skill
  async deleteSkill(skillId) {
    try {
      await dynamodbService.deleteItem(TABLE_NAME, { skillId });
      return true;
    } catch (error) {
      console.error('Error deleting skill:', error);
      throw error;
    }
  }
}

module.exports = new SkillRepository();
