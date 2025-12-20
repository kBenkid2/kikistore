// Script để reset database và tạo lại migration
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔄 Đang reset database...\n')

// Xóa database cũ
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath)
  console.log('✅ Đã xóa database cũ')
}

// Xóa thư mục migrations
const migrationsPath = path.join(process.cwd(), 'prisma', 'migrations')
if (fs.existsSync(migrationsPath)) {
  fs.rmSync(migrationsPath, { recursive: true, force: true })
  console.log('✅ Đã xóa migrations cũ')
}

// Load env
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') })

// Tạo migration mới
console.log('\n📦 Đang tạo migration mới...')
try {
  const env = { ...process.env, DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db' }
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit', env })
  console.log('\n✅ Migration đã được tạo!')
  console.log('\n🚀 Bây giờ chạy "npm run setup" để hoàn tất setup.\n')
} catch (error) {
  console.error('❌ Lỗi:', error.message)
  process.exit(1)
}

