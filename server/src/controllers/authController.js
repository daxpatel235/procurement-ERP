const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const env = require('../config/env');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendMail } = require('../services/emailService');
const notify = require('../services/notificationService');

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, company } = req.body;

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  // Only allow self-registration for non-privileged roles.
  const safeRole = ['buyer', 'manager', 'approver', 'vendor'].includes(role) ? role : 'buyer';

  const user = await User.create({ name, email, password, role: safeRole, company });
  await notify.record({ actor: user.name, action: 'registered', entityType: 'User', message: `${user.name} created an account` });

  const token = signToken(user);
  res.status(201).json({ token, user: user.toJSON() });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  if (user.status !== 'Active') {
    return res.status(403).json({ message: 'Your account is not active. Contact an administrator.' });
  }

  const token = signToken(user);
  res.json({ token, user: user.toJSON() });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toJSON() });
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() });

  // Always respond the same way so we don't leak which emails exist.
  if (user) {
    const resetToken = crypto.randomBytes(20).toString('hex');
    await sendMail({
      to: user.email,
      subject: 'Reset your Wolf ERP password',
      html: `<p>Use this token to reset your password: <code>${resetToken}</code></p>
             <p>If you didn't request this, you can ignore this email.</p>`,
    });
  }

  res.json({ message: 'If that email is registered, a reset link is on its way.' });
});

module.exports = { register, login, me, forgotPassword };
