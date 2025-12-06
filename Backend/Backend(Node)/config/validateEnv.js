const requiredInProd = [
  'MONGODB_URI',
  'JWT_SECRET',
  'ENCRYPTION_MASTER_KEY',
  'FRONTEND_URL',
];

module.exports = function validateEnv() {
  if (process.env.NODE_ENV !== 'production') return;

  const missing = requiredInProd.filter((key) => !process.env[key]);
  if (missing.length) {
    // Fail fast so the container/task crashes rather than running insecurely
    // eslint-disable-next-line no-console
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
};
