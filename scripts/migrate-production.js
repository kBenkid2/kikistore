/**
 * Script to run migrations on production database
 * Usage: node scripts/migrate-production.js
 */

// Load from .env.local first, then .env
require('dotenv').config({ path: '.env.local' })
require('dotenv').config()
const { execSync } = require('child_process')

console.log('🚀 Running production migrations...\n')

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables')
  console.log('Please set DATABASE_URL in your environment')
  process.exit(1)
}

console.log('✅ DATABASE_URL found')
console.log(`   Database: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`)

try {
  console.log('📦 Running Prisma migrations...')
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env
  })
  console.log('\n✅ Migrations completed successfully!')
} catch (error) {
  console.error('\n❌ Migration failed:', error.message)
  console.log('\n💡 Troubleshooting:')
  console.log('   1. Check DATABASE_URL is correct')
  console.log('   2. Ensure database is accessible')
  console.log('   3. Check migration files are correct')
  process.exit(1)
}

