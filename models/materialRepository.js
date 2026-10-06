// Material Repository - DynamoDB operations for materials
const { v4: uuidv4 } = require('uuid');
const dynamodbService = require('../services/dynamodbService');

const TABLE_NAME = process.env.DYNAMODB_MATERIALS_TABLE || 'CampusSkillExchange-Materials';

class MaterialRepository {
  // Create new material
  async createMaterial(userId, title, description = '', fileName, s3Key, fileUrl) {
    try {
      const materialId = uuidv4();
      const material = {
        materialId,
        userId,
        title,
        description,
        fileName,
        s3Key,
        fileUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await dynamodbService.putItem(TABLE_NAME, material);
      return material;
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  }

  // Get material by ID
  async getMaterialById(materialId) {
    try {
      const material = await dynamodbService.getItem(TABLE_NAME, { materialId });
      return material || null;
    } catch (error) {
      console.error('Error getting material by ID:', error);
      throw error;
    }
  }

  // Get materials by user ID
  async getMaterialsByUserId(userId) {
    try {
      const materials = await dynamodbService.scanTable(
        TABLE_NAME,
        'userId = :userId',
        { ':userId': userId }
      );
      return materials;
    } catch (error) {
      console.error('Error getting materials by user ID:', error);
      throw error;
    }
  }

  // Get all materials
  async getAllMaterials() {
    try {
      return await dynamodbService.scanTable(TABLE_NAME);
    } catch (error) {
      console.error('Error getting all materials:', error);
      throw error;
    }
  }

  // Update material
  async updateMaterial(materialId, updates) {
    try {
      const updateExpression = [];
      const expressionAttributeValues = {};
      const allowedFields = ['title', 'description'];

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
        { materialId },
        `SET ${updateExpression.join(', ')}`,
        expressionAttributeValues
      );

      return updated;
    } catch (error) {
      console.error('Error updating material:', error);
      throw error;
    }
  }

  // Delete material
  async deleteMaterial(materialId) {
    try {
      await dynamodbService.deleteItem(TABLE_NAME, { materialId });
      return true;
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  }
}

module.exports = new MaterialRepository();
