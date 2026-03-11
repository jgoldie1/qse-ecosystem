/**
 * Auth Engine - Handles user authentication for QSE Ecosystem
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_PATH = path.join(__dirname, '../data/users.json');

function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  } catch {
    return [];
  }
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function generateToken(userId) {
  return crypto.randomBytes(32).toString('hex') + '.' + Buffer.from(userId).toString('base64');
}

const DUMMY_SALT = 'ffffffffffffffffffffffffffffffff';
const DUMMY_HASH = crypto.scryptSync('dummy', DUMMY_SALT, 64).toString('hex');

const authEngine = {
  login({ email, password }) {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    const users = loadUsers();
    const user = users.find(u => u.email === email);

    const salt = user ? user.passwordSalt : DUMMY_SALT;
    const expectedHash = user ? user.passwordHash : DUMMY_HASH;
    const hash = hashPassword(password, salt);

    if (!user || hash !== expectedHash) {
      return { success: false, error: 'Invalid credentials' };
    }

    const token = generateToken(user.id);

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }
};

module.exports = authEngine;
