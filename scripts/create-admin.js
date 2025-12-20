/**
 * Script to create admin account
 * Usage: node scripts/create-admin.js
 */

require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function main() {
  console.log('🔐 Create Admin Account\n')

  const username = await question('Username: ')
  if (!username || username.trim().length < 3) {
    console.error('❌ Username must be at least 3 characters')
    process.exit(1)
  }

  const password = await question('Password: ')
  if (!password || password.length < 6) {
    console.error('❌ Password must be at least 6 characters')
    process.exit(1)
  }

  // Check if admin exists
  const existing = await prisma.admin.findUnique({
    where: { username },
  })

  if (existing) {
    console.log(`\n⚠️  Admin "${username}" already exists`)
    const overwrite = await question('Overwrite? (y/N): ')
    if (overwrite.toLowerCase() !== 'y') {
      console.log('❌ Cancelled')
      process.exit(0)
    }
    
    // Delete existing
    await prisma.admin.delete({
      where: { username },
    })
    console.log('✅ Deleted existing admin')
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create admin
  const admin = await prisma.admin.create({
    data: {
      username,
      password: hashedPassword,
    },
  })

  console.log(`\n✅ Admin "${username}" created successfully!`)
  console.log(`   ID: ${admin.id}`)
  console.log(`   Created at: ${admin.createdAt}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    rl.close()
  })

