const path = require('path');
const fs = require('fs');

// Helper function to get the correct path to the .env file
function getEnvPath() {
  const rootEnvPath = path.resolve(__dirname, '../../.env');
  const serverEnvPath = path.resolve(__dirname, '../.env');

  // Check which .env file exists and return the path
  if (fs.existsSync(rootEnvPath)) {
    console.log('Using root .env file');
    return rootEnvPath;
  } else if (fs.existsSync(serverEnvPath)) {
    console.log('Using server .env file');
    return serverEnvPath;
  }

  console.log('No .env file found, defaulting to server path');
  // Default to the server .env path even if it doesn't exist
  return serverEnvPath;
}

module.exports = {
  getEnvPath
};