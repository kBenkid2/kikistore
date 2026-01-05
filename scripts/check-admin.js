require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    const admins = await prisma.admin.findMany()
    
    if (admins.length === 0) {
      console.log('⚠️  Chưa có tài khoản admin nào trong database')
      console.log('💡 Chạy: node scripts/create-admin-auto.js để tạo admin')
    } else {
      console.log('📋 Danh sách tài khoản admin:')
      admins.forEach(a => {
        console.log(`   Username: ${a.username}`)
        console.log(`   ID: ${a.id}`)
        console.log(`   Created: ${a.createdAt}`)
        console.log('')
      })
    }
  } catch (error) {
    console.error('❌ Lỗi:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()

