const { execSync } = require('child_process')
const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') })

// Get migration name from args
const args = process.argv.slice(2)
const migrationName = args.find(arg => arg.startsWith('--name')) 
  ? args[args.indexOf('--name') + 1] 
  : 'update'

// Set environment variables
const env = { 
  ...process.env, 
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db' 
}

try {
  console.log('🔄 Đang chạy migration...')
  execSync(`npx prisma migrate dev --name ${migrationName}`, { 
    stdio: 'inherit', 
    env,
    cwd: process.cwd()
  })
  console.log('✅ Migration hoàn tất!')
} catch (error) {
  console.error('❌ Lỗi khi chạy migration:', error.message)
  process.exit(1)
}

