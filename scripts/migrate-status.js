/**
 * Script to check migration status (reads from .env.local)
 * Usage: node scripts/migrate-status.js
 */

require('dotenv').config({ path: '.env.local' })
const { execSync } = require('child_process')

console.log('📊 Checking migration status...\n')

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local')
  console.log('Please set DATABASE_URL in .env.local file')
  process.exit(1)
}

try {
  execSync('npx prisma migrate status', {
    stdio: 'inherit',
    env: process.env
  })
} catch (error) {
  console.error('\n❌ Error:', error.message)
  process.exit(1)
}

