/**
 * Script to fix Prisma Client after schema change
 * Usage: node scripts/fix-prisma.js
 */

require('dotenv').config({ path: '.env.local' })
const { execSync } = require('child_process')

console.log('🔧 Fixing Prisma Client...\n')

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local')
  process.exit(1)
}

console.log('✅ DATABASE_URL found\n')

try {
  console.log('📦 Regenerating Prisma Client...')
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: process.env
  })
  console.log('\n✅ Prisma Client regenerated successfully!')
  console.log('\n💡 Now you can run: npm run dev')
} catch (error) {
  console.error('\n❌ Error:', error.message)
  console.log('\n💡 Make sure dev server is stopped (Ctrl+C)')
  console.log('   Then run this script again')
  process.exit(1)
}

