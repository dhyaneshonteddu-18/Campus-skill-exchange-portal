// DynamoDB Service
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { dynamodbClient } = require('../config/aws');

// Create DynamoDB Document client
const docClient = DynamoDBDocumentClient.from(dynamodbClient);

class DynamoDBService {
  // Get item from table
  async getItem(tableName, key) {
    try {
      const command = new GetCommand({
        TableName: tableName,
        Key: key
      });
      const response = await docClient.send(command);
      return response.Item || null;
    } catch (error) {
      console.error(`Error getting item from ${tableName}:`, error);
      throw error;
    }
  }

  // Put item into table
  async putItem(tableName, item) {
    try {
      const command = new PutCommand({
        TableName: tableName,
        Item: item
      });
      await docClient.send(command);
      return item;
    } catch (error) {
      console.error(`Error putting item into ${tableName}:`, error);
      throw error;
    }
  }

  // Update item in table
  async updateItem(tableName, key, updateExpression, expressionAttributeValues, expressionAttributeNames = {}) {
    try {
      const command = new UpdateCommand({
        TableName: tableName,
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
        ReturnValues: 'ALL_NEW'
      });
      const response = await docClient.send(command);
      return response.Attributes;
    } catch (error) {
      console.error(`Error updating item in ${tableName}:`, error);
      throw error;
    }
  }

  // Delete item from table
  async deleteItem(tableName, key) {
    try {
      const command = new DeleteCommand({
        TableName: tableName,
        Key: key
      });
      await docClient.send(command);
      return true;
    } catch (error) {
      console.error(`Error deleting item from ${tableName}:`, error);
      throw error;
    }
  }

  // Scan table
  async scanTable(tableName, filterExpression = null, expressionAttributeValues = null) {
    try {
      const params = {
        TableName: tableName
      };

      if (filterExpression && expressionAttributeValues) {
        params.FilterExpression = filterExpression;
        params.ExpressionAttributeValues = expressionAttributeValues;
      }

      const command = new ScanCommand(params);
      const response = await docClient.send(command);
      return response.Items || [];
    } catch (error) {
      console.error(`Error scanning ${tableName}:`, error);
      throw error;
    }
  }

  // Query table by GSI or primary key
  async queryTable(tableName, keyConditionExpression, expressionAttributeValues, indexName = null) {
    try {
      const params = {
        TableName: tableName,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeValues: expressionAttributeValues
      };

      if (indexName) {
        params.IndexName = indexName;
      }

      const command = new QueryCommand(params);
      const response = await docClient.send(command);
      return response.Items || [];
    } catch (error) {
      console.error(`Error querying ${tableName}:`, error);
      throw error;
    }
  }

  // Batch get items
  async batchGetItems(tableName, keys) {
    try {
      const params = {
        RequestItems: {
          [tableName]: {
            Keys: keys
          }
        }
      };

      const command = new ScanCommand(params);
      const response = await docClient.send(command);
      return response.Responses ? response.Responses[tableName] : [];
    } catch (error) {
      console.error(`Error batch getting items from ${tableName}:`, error);
      throw error;
    }
  }
}

module.exports = new DynamoDBService();
