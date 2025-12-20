/**
 * Script to create admin account automatically
 * Usage: node scripts/create-admin-auto.js
 */

require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Creating Admin Account...\n')

  const username = 'Kiki'
  const password = 'Benben582004nhe!@#'

  try {
    // Check if admin exists
    const existing = await prisma.admin.findUnique({
      where: { username },
    })

    if (existing) {
      console.log(`⚠️  Admin "${username}" already exists`)
      console.log('   Deleting existing admin...')
      
      await prisma.admin.delete({
        where: { username },
      })
      console.log('✅ Deleted existing admin')
    }

    // Hash password
    console.log('   Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin
    console.log('   Creating admin account...')
    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
      },
    })

    console.log(`\n✅ Admin account created successfully!`)
    console.log(`   Username: ${admin.username}`)
    console.log(`   ID: ${admin.id}`)
    console.log(`   Created at: ${admin.createdAt}`)
    console.log(`\n📝 Login credentials:`)
    console.log(`   Username: ${username}`)
    console.log(`   Password: ${password}`)
  } catch (error) {
    console.error('❌ Error creating admin:', error.message)
    if (error.code === 'P2002') {
      console.error('   Username already exists')
    }
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

