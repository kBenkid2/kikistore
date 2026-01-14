const { spawn } = require('child_process')
const { execSync } = require('child_process')

// Chạy check-setup trước
try {
  execSync('node scripts/check-setup.js', { stdio: 'inherit' })
} catch (error) {
  process.exit(1)
}

// Log admin URL trước khi start Next.js
console.log('\n🔐 Admin URL: http://localhost:3000/admin-secret-kiki2024\n')

// Spawn next dev process
const nextDev = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true
})

nextDev.on('close', (code) => {
  process.exit(code)
})

nextDev.on('error', (error) => {
  console.error('Error starting Next.js:', error)
  process.exit(1)
})
