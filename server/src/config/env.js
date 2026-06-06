// Centralized, validated access to environment variables.
// Everything that reads process.env should go through here.

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,

  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wolf_erp',

  JWT_SECRET: process.env.JWT_SECRET || 'dev_only_change_me_super_secret_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  // SMTP is optional — if unset, emails are logged to the console instead of sent.
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  MAIL_FROM: process.env.MAIL_FROM || 'Wolf ERP <no-reply@wolferp.in>',
};

env.isProd = env.NODE_ENV === 'production';
env.emailEnabled = Boolean(env.SMTP_HOST && env.SMTP_USER);

module.exports = env;
