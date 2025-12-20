const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

console.log('🚀 Đang thiết lập dự án...\n')

// Tạo .env.local nếu chưa có
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  console.log('📝 Tạo file .env.local...')
  const jwtSecret = crypto.randomBytes(32).toString('base64')
  
  const envContent = `DATABASE_URL="file:./dev.db"
JWT_SECRET="${jwtSecret}"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
DISCORD_USERNAME="elainedna"
DISCORD_ID="your-discord-id"

NEXT_PUBLIC_DISCORD_USERNAME="elainedna"
NEXT_PUBLIC_DISCORD_ID="your-discord-id"
`
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Đã tạo file .env.local với cấu hình mặc định')
  console.log('⚠️  Vui lòng cập nhật DISCORD_USERNAME và DISCORD_ID trong file .env.local\n')
} else {
  console.log('✅ File .env.local đã tồn tại\n')
}

// Load environment variables từ .env.local
require('dotenv').config({ path: envPath })

// Chạy Prisma generate
console.log('📦 Đang tạo Prisma client...')
try {
  // Set environment variable cho Prisma
  const env = { ...process.env, DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db' }
  execSync('npx prisma generate', { stdio: 'inherit', env })
  console.log('✅ Prisma client đã được tạo\n')
} catch (error) {
  console.error('❌ Lỗi khi tạo Prisma client:', error.message)
  process.exit(1)
}

// Chạy Prisma migrate
console.log('🗄️  Đang khởi tạo database...')
try {
  // Set environment variable cho Prisma
  const env = { ...process.env, DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db' }
  
  // Kiểm tra xem đã có migration chưa
  const migrationsPath = path.join(process.cwd(), 'prisma', 'migrations')
  const hasMigrations = fs.existsSync(migrationsPath) && fs.readdirSync(migrationsPath).length > 0
  
  if (hasMigrations) {
    // Nếu đã có migration, dùng migrate deploy
    execSync('npx prisma migrate deploy', { stdio: 'inherit', env })
  } else {
    // Nếu chưa có migration, tạo migration mới
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit', env })
  }
} catch (error) {
  console.error('❌ Lỗi khi khởi tạo database:', error.message)
  process.exit(1)
}
console.log('✅ Database đã được khởi tạo\n')

// Tạo admin account
console.log('👤 Đang tạo tài khoản admin...')
try {
  const env = { ...process.env }
  // Sử dụng create-admin-auto.js thay vì setup-admin.js (đã bị xóa)
  execSync('node scripts/create-admin-auto.js', { stdio: 'inherit', env })
  console.log('✅ Tài khoản admin đã được tạo\n')
} catch (error) {
  console.error('❌ Lỗi khi tạo admin:', error.message)
  console.log('💡 Bạn có thể tạo admin thủ công bằng: npm run create-admin')
  // Không exit, cho phép tiếp tục
}

// Tạo thư mục uploads
const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log('✅ Đã tạo thư mục uploads\n')
}

console.log('🎉 Thiết lập hoàn tất!')
console.log('\n📌 Thông tin đăng nhập admin:')
console.log('   Username: admin')
console.log('   Password: admin123')
console.log('   Link admin: http://localhost:3000/admin')
console.log('\n📌 Trang chủ công khai:')
console.log('   Link: http://localhost:3000')
console.log('   Ai cũng có thể xem, chỉ admin mới chỉnh sửa được')
console.log('\n⚠️  Vui lòng đổi mật khẩu và cập nhật thông tin Discord trong file .env.local')
console.log('\n🚀 Chạy "npm run dev" để bắt đầu!\n')

