// Request Repository - DynamoDB operations for skill exchange requests
const { v4: uuidv4 } = require('uuid');
const dynamodbService = require('../services/dynamodbService');

const TABLE_NAME = process.env.DYNAMODB_REQUESTS_TABLE || 'CampusSkillExchange-Requests';

class RequestRepository {
  // Create new request
  async createRequest(senderId, receiverId, skillId, skillName) {
    try {
      const requestId = uuidv4();
      const request = {
        requestId,
        senderId,
        receiverId,
        skillId,
        skillName,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await dynamodbService.putItem(TABLE_NAME, request);
      return request;
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  }

  // Get request by ID
  async getRequestById(requestId) {
    try {
      const request = await dynamodbService.getItem(TABLE_NAME, { requestId });
      return request || null;
    } catch (error) {
      console.error('Error getting request by ID:', error);
      throw error;
    }
  }

  // Get requests received by user
  async getReceivedRequests(receiverId) {
    try {
      const requests = await dynamodbService.scanTable(
        TABLE_NAME,
        'receiverId = :receiverId',
        { ':receiverId': receiverId }
      );
      return requests;
    } catch (error) {
      console.error('Error getting received requests:', error);
      throw error;
    }
  }

  // Get requests sent by user
  async getSentRequests(senderId) {
    try {
      const requests = await dynamodbService.scanTable(
        TABLE_NAME,
        'senderId = :senderId',
        { ':senderId': senderId }
      );
      return requests;
    } catch (error) {
      console.error('Error getting sent requests:', error);
      throw error;
    }
  }

  // Get all requests for a user (both received and sent)
  async getUserRequests(userId) {
    try {
      const received = await this.getReceivedRequests(userId);
      const sent = await this.getSentRequests(userId);
      return { received, sent };
    } catch (error) {
      console.error('Error getting user requests:', error);
      throw error;
    }
  }

  // Update request status
  async updateRequestStatus(requestId, status) {
    try {
      const updated = await dynamodbService.updateItem(
        TABLE_NAME,
        { requestId },
        'SET #status = :status, updatedAt = :updatedAt',
        { ':status': status, ':updatedAt': new Date().toISOString() },
        { '#status': 'status' }
      );

      return updated;
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  }

  // Accept request
  async acceptRequest(requestId) {
    try {
      return await this.updateRequestStatus(requestId, 'Accepted');
    } catch (error) {
      console.error('Error accepting request:', error);
      throw error;
    }
  }

  // Reject request
  async rejectRequest(requestId) {
    try {
      return await this.updateRequestStatus(requestId, 'Rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  }

  // Delete request
  async deleteRequest(requestId) {
    try {
      await dynamodbService.deleteItem(TABLE_NAME, { requestId });
      return true;
    } catch (error) {
      console.error('Error deleting request:', error);
      throw error;
    }
  }
}

module.exports = new RequestRepository();
