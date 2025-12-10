const requiredInProd = [
  'MONGODB_URI',
  'JWT_SECRET',
];

const recommended = [
  'ENCRYPTION_MASTER_KEY',
  'ENCRYPTION_KEY',
  'FRONTEND_URL',
];

module.exports = function validateEnv() {
  if (process.env.NODE_ENV !== 'production') return;

  // Check critical variables
  const missing = requiredInProd.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error('❌ Missing REQUIRED environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n💡 Add these in your hosting platform (Render/Railway) environment variables');
    process.exit(1);
  }

  // Warn about recommended variables
  const missingRecommended = recommended.filter((key) => !process.env[key]);
  if (missingRecommended.length) {
    console.warn('⚠️  Missing RECOMMENDED environment variables:');
    missingRecommended.forEach(key => console.warn(`   - ${key}`));
    console.warn('💡 App will run but some features may be limited\n');
  }

  console.log('✅ Environment validation passed');
};
