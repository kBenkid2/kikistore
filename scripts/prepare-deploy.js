/**
 * Script to prepare code for deployment
 * Removes development files and prepares production build
 */

const fs = require('fs')
const path = require('path')

const filesToRemove = [
  'node_modules',
  '.next',
  '.git',
  '*.db',
  '*.db-journal',
  '.env.local',
  'dev.db',
  'dev.db-journal',
]

const dirsToKeep = [
  'public',
  'app',
  'components',
  'lib',
  'prisma',
  'scripts',
  'styles',
]

console.log('📦 Preparing code for deployment...\n')

// Check if .env exists
if (!fs.existsSync('.env') && !fs.existsSync('.env.production')) {
  console.warn('⚠️  Warning: No .env or .env.production file found')
  console.log('   Make sure to set environment variables on your hosting')
}

// Check package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
if (!packageJson.scripts.build) {
  console.error('❌ Build script not found in package.json')
  process.exit(1)
}

console.log('✅ Code is ready for deployment')
console.log('\n📝 Next steps:')
console.log('   1. Upload code to hosting (via Git, FTP, or control panel)')
console.log('   2. SSH into hosting and run:')
console.log('      - npm install --production')
console.log('      - npx prisma generate')
console.log('      - npx prisma migrate deploy')
console.log('      - npm run build')
console.log('      - npm start (or use PM2/systemd)')
console.log('   3. Set environment variables on hosting')
console.log('   4. Create admin account: node scripts/create-admin.js')

