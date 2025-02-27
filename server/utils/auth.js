const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  try {
    console.log(`Generating access token for user: ${user.email}`);
    const token = jwt.sign(
      {
        sub: user._id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId || null
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );
    return token;
  } catch (error) {
    console.error(`Error generating access token: ${error.message}`);
    throw new Error(`Failed to generate access token: ${error.message}`);
  }
};

const generateRefreshToken = (user) => {
  try {
    console.log(`Generating refresh token for user: ${user.email}`);
    const token = jwt.sign(
      {
        sub: user._id,
        role: user.role
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '30d' }
    );
    return token;
  } catch (error) {
    console.error(`Error generating refresh token: ${error.message}`);
    throw new Error(`Failed to generate refresh token: ${error.message}`);
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};