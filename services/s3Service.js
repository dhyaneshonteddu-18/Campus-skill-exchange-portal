// S3 Service for file uploads and downloads
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client } = require('../config/aws');

class S3Service {
  // Upload file to S3
  async uploadFile(bucketName, key, fileBuffer, contentType, metadata = {}) {
    try {
      const params = {
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        Metadata: metadata
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);

      return {
        bucket: bucketName,
        key: key,
        url: `https://${bucketName}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`
      };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  }

  // Generate presigned URL for download
  async getPresignedDownloadUrl(bucketName, key, expirationSeconds = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn: expirationSeconds });
      return url;
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw error;
    }
  }

  // Delete file from S3
  async deleteFile(bucketName, key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw error;
    }
  }

  // List files in S3 folder
  async listFiles(bucketName, prefix = '') {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix
      });

      const response = await s3Client.send(command);
      return response.Contents || [];
    } catch (error) {
      console.error('Error listing files in S3:', error);
      throw error;
    }
  }

  // Download file from S3
  async downloadFile(bucketName, key) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key
      });

      const response = await s3Client.send(command);
      // Convert response body to buffer
      const chunks = [];
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      console.error('Error downloading file from S3:', error);
      throw error;
    }
  }
}

module.exports = new S3Service();
