/**
 * Setup script for production deployment
 * This script helps setup the database and create admin account
 */

require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const { execSync } = require('child_process')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Setting up production environment...\n')

  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables')
    console.log('Please set DATABASE_URL in .env.local')
    process.exit(1)
  }

  console.log('✅ DATABASE_URL found')

  // Check if it's PostgreSQL
  if (!process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.warn('⚠️  Warning: DATABASE_URL does not look like PostgreSQL')
    console.log('   Expected format: postgresql://user:password@host:port/database')
  }

  try {
    // Test connection
    console.log('\n📡 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful')

    // Run migrations
    console.log('\n📦 Running migrations...')
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' })
      console.log('✅ Migrations completed')
    } catch (error) {
      console.error('❌ Migration failed:', error.message)
      console.log('\n💡 Try running: npx prisma migrate dev')
      process.exit(1)
    }

    // Check if admin exists
    console.log('\n👤 Checking admin accounts...')
    const adminCount = await prisma.admin.count()
    if (adminCount === 0) {
      console.log('⚠️  No admin accounts found')
      console.log('   Run: node scripts/create-admin.js')
    } else {
      console.log(`✅ Found ${adminCount} admin account(s)`)
    }

    // Check products
    const productCount = await prisma.product.count()
    console.log(`📦 Found ${productCount} product(s)`)

    console.log('\n✅ Setup completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Create admin: node scripts/create-admin.js')
    console.log('   2. Deploy to Vercel')
    console.log('   3. Set environment variables in Vercel dashboard')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

