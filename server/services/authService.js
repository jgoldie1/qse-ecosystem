const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { run, get, all } = require('../db/sqlite');

async function listUsers() {
  return all(`SELECT id, email, role, platform, status, created_at FROM users ORDER BY id DESC`);
}

async function registerUser(data) {
  const now = new Date().toISOString();
  const existing = await get(`SELECT id FROM users WHERE email = ?`, [data.email]);
  if (existing) {
    throw new Error('User already exists');
  }

  if (!data.password) {
    throw new Error('Password is required');
  }

  const hash = await bcrypt.hash(data.password, 10);
  const result = await run(
    `INSERT INTO users (email, password_hash, role, platform, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.email || '',
      hash,
      data.role || 'user',
      data.platform || 'general',
      'active',
      now
    ]
  );

  return {
    id: result.id,
    email: data.email || '',
    role: data.role || 'user',
    platform: data.platform || 'general',
    status: 'active',
    createdAt: now
  };
}

async function loginUser(data) {
  const user = await get(`SELECT * FROM users WHERE email = ?`, [data.email || '']);
  if (!user) throw new Error('User not found');

  const match = await bcrypt.compare(data.password || '', user.password_hash);
  if (!match) throw new Error('Invalid password');

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      platform: user.platform
    },
    secret,
    { expiresIn: '12h' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      platform: user.platform,
      status: user.status
    }
  };
}

module.exports = {
  listUsers,
  registerUser,
  loginUser
};
