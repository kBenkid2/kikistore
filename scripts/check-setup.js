const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env.local')
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const nodeModulesPath = path.join(process.cwd(), 'node_modules')

// Kiểm tra node_modules
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Đang cài đặt dependencies...')
  const { execSync } = require('child_process')
  execSync('npm install', { stdio: 'inherit' })
}

// Kiểm tra .env.local
if (!fs.existsSync(envPath)) {
  console.log('⚠️  File .env.local chưa tồn tại. Đang chạy setup...\n')
  const { execSync } = require('child_process')
  try {
    execSync('npm run setup', { stdio: 'inherit' })
  } catch (error) {
    console.error('❌ Lỗi khi chạy setup. Vui lòng chạy "npm run setup" thủ công.')
    process.exit(1)
  }
  return
}

// Load env để kiểm tra database
require('dotenv').config({ path: envPath })

// Kiểm tra database
if (!fs.existsSync(dbPath)) {
  console.log('⚠️  Database chưa được khởi tạo. Đang chạy setup...\n')
  const { execSync } = require('child_process')
  try {
    execSync('npm run setup', { stdio: 'inherit' })
  } catch (error) {
    console.error('❌ Lỗi khi chạy setup. Vui lòng chạy "npm run setup" thủ công.')
    process.exit(1)
  }
  return
}

// Kiểm tra Prisma client
const prismaClientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client')
if (!fs.existsSync(prismaClientPath)) {
  console.log('⚠️  Prisma client chưa được tạo. Đang chạy setup...\n')
  const { execSync } = require('child_process')
  try {
    execSync('npm run setup', { stdio: 'inherit' })
  } catch (error) {
    console.error('❌ Lỗi khi chạy setup. Vui lòng chạy "npm run setup" thủ công.')
    process.exit(1)
  }
  return
}

// Mọi thứ đã sẵn sàng
process.exit(0)

