// This utility ensures backward compatibility with different environment variable names
const getTokenSecrets = () => {
  return {
    ACCESS_TOKEN_SECRET: process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_SECRET || process.env.REFRESH_TOKEN_SECRET
  };
};

module.exports = { getTokenSecrets };