const argon2 = require('argon2');

// Хешування пароля
async function hashPassword(plainPassword) {
  return argon2.hash(plainPassword, {
    type: argon2.argon2id,
  });
}

// Перевірка пароля
async function verifyPassword(plainPassword, hashedPassword) {
  return argon2.verify(hashedPassword, plainPassword);
}

module.exports = {
  hashPassword,
  verifyPassword,
};