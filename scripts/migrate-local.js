/**
 * Script to run migrations on local database (from .env.local)
 * Usage: node scripts/migrate-local.js
 */

require('dotenv').config({ path: '.env.local' })
const { execSync } = require('child_process')

console.log('🚀 Running local migrations...\n')

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local')
  console.log('Please set DATABASE_URL in .env.local file')
  process.exit(1)
}

console.log('✅ DATABASE_URL found')
const dbUrl = process.env.DATABASE_URL
const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@')
console.log(`   Database: ${maskedUrl}\n`)

// Check if it's PostgreSQL
if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
  console.warn('⚠️  Warning: DATABASE_URL does not look like PostgreSQL')
  console.log('   Expected format: postgresql://user:password@host:port/database\n')
}

try {
  console.log('📦 Running Prisma migrations...')
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env
  })
  console.log('\n✅ Migrations completed successfully!')
  console.log('\n💡 Next steps:')
  console.log('   1. Check your database to verify migration')
  console.log('   2. Run "npm run dev" to test locally')
  console.log('   3. If everything works, push to Git for Vercel deployment')
} catch (error) {
  console.error('\n❌ Migration failed:', error.message)
  console.log('\n💡 Troubleshooting:')
  console.log('   1. Check DATABASE_URL in .env.local is correct')
  console.log('   2. Ensure database is accessible from your network')
  console.log('   3. Check migration files are correct')
  console.log('   4. Try: npx prisma migrate status')
  process.exit(1)
}

