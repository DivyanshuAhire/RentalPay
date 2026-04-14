const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

function parseEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return {};
  return fs.readFileSync(envPath, 'utf8').split(/\r?\n/).reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return acc;
    const index = trimmed.indexOf('=');
    if (index === -1) return acc;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    acc[key] = value;
    return acc;
  }, {});
}

const envPath = path.resolve(__dirname, '../.env.local');
const env = parseEnvFile(envPath);
const MONGODB_URI = process.env.MONGODB_URI || env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment or .env.local');
  process.exit(1);
}

const userSchema = new mongoose.Schema({ name: String, role: String }, { strict: false });
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function main() {
  await mongoose.connect(MONGODB_URI, {
    family: 4,
    bufferCommands: false,
  });

  const result = await User.updateMany(
    { name: 'DivAdmin' },
    { $set: { role: 'ADMIN' } }
  );

  console.log('Update result:', {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  });

  if (result.matchedCount === 0) {
    console.error('No user found with name "DivAdmin".');
    process.exit(1);
  }

  console.log('DivAdmin has been promoted to ADMIN.');
  process.exit(0);
}

main().catch((error) => {
  console.error('Error updating admin role:', error);
  process.exit(1);
});
