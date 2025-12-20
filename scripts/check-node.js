// Script kiểm tra Node.js và npm
console.log('🔍 Đang kiểm tra Node.js và npm...\n')

try {
  const { execSync } = require('child_process')
  
  // Kiểm tra Node.js
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim()
    console.log('✅ Node.js:', nodeVersion)
  } catch (error) {
    console.log('❌ Node.js không được tìm thấy!')
    console.log('   Vui lòng cài đặt Node.js từ: https://nodejs.org/')
    process.exit(1)
  }

  // Kiểm tra npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim()
    console.log('✅ npm:', npmVersion)
  } catch (error) {
    console.log('❌ npm không được tìm thấy!')
    console.log('   npm thường đi kèm với Node.js. Vui lòng cài đặt lại Node.js.')
    process.exit(1)
  }

  console.log('\n✅ Tất cả đã sẵn sàng! Bạn có thể chạy "npm install" ngay bây giờ.')
} catch (error) {
  console.error('❌ Lỗi:', error.message)
  process.exit(1)
}

