const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  const payload = {
    sub: user._id,
    role: user.role,
    org: user.organizationId
  };
  
  console.log(`Generating access token for user ${user._id} with role ${user.role}`);
  
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
  } catch (error) {
    console.error(`Error generating access token: ${error.message}`, error);
    throw new Error(`Failed to generate access token: ${error.message}`);
  }
};

const generateRefreshToken = (user) => {
  const payload = {
    sub: user._id,
    role: user.role
  };
  
  console.log(`Generating refresh token for user ${user._id}`);
  
  try {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
  } catch (error) {
    console.error(`Error generating refresh token: ${error.message}`, error);
    throw new Error(`Failed to generate refresh token: ${error.message}`);
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};