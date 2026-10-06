// AWS Configuration
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { S3Client } = require('@aws-sdk/client-s3');

// Initialize AWS clients
const dynamodbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-south-1'
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1'
});

module.exports = {
  dynamodbClient,
  s3Client
};
