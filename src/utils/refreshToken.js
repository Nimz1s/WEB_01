const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: '7d'
    }
  );
}

function hashRefreshToken(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

module.exports = {
  generateRefreshToken,
  hashRefreshToken
};