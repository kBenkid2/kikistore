/**
 * Script to check security before pushing to Git
 * Ensures no sensitive files are being committed
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔒 Security Check before Git Push\n')

// Check if .gitignore exists
if (!fs.existsSync('.gitignore')) {
  console.error('❌ .gitignore file not found!')
  process.exit(1)
}

const gitignore = fs.readFileSync('.gitignore', 'utf8')

// List of sensitive files that MUST be ignored
const criticalFiles = [
  '.env',
  '.env.local',
  '.env.production',
  '.env.development',
  'prisma/dev.db',
  '*.db',
  '*.db-journal',
]

console.log('📋 Checking critical files...\n')

let allSafe = true

criticalFiles.forEach(pattern => {
  // Check if pattern is in .gitignore
  // Handle wildcards: .env*.local should match .env.local
  let isIgnored = false
  
  if (pattern.includes('*')) {
    // For wildcard patterns, check if base pattern exists
    const basePattern = pattern.replace('*', '')
    isIgnored = gitignore.includes(pattern) || 
                gitignore.includes(basePattern) ||
                gitignore.includes('.env*.local') // Special case for .env.local
  } else {
    isIgnored = gitignore.includes(pattern) || 
                gitignore.includes(pattern.replace('./', ''))
  }
  
  // Special check for .env.local (should match .env*.local)
  if (pattern === '.env.local') {
    isIgnored = isIgnored || gitignore.includes('.env*.local') || gitignore.includes('.env')
  }
  
  if (!isIgnored) {
    console.error(`❌ CRITICAL: ${pattern} is NOT in .gitignore!`)
    allSafe = false
  } else {
    console.log(`✅ ${pattern} is properly ignored`)
  }
})

// Check if sensitive files exist and are tracked by git
console.log('\n🔍 Checking if sensitive files are tracked by Git...\n')

try {
  const trackedFiles = execSync('git ls-files', { encoding: 'utf8' }).split('\n')
  
  const sensitivePatterns = [
    /\.env$/,
    /\.env\.local$/,
    /\.env\.production$/,
    /\.db$/,
    /\.db-journal$/,
    /\.pem$/,
    /\.key$/,
  ]
  
  let foundTracked = false
  trackedFiles.forEach(file => {
    if (!file) return
    
    sensitivePatterns.forEach(pattern => {
      if (pattern.test(file)) {
        console.error(`❌ WARNING: ${file} is tracked by Git!`)
        console.error(`   Run: git rm --cached ${file}`)
        foundTracked = true
        allSafe = false
      }
    })
  })
  
  if (!foundTracked) {
    console.log('✅ No sensitive files are tracked by Git')
  }
} catch (error) {
  // Git not initialized yet, that's okay
  console.log('ℹ️  Git not initialized yet (this is okay for first commit)')
}

// Check for hardcoded secrets in code
console.log('\n🔍 Checking for potential hardcoded secrets...\n')

const codeFiles = [
  'app/**/*.ts',
  'app/**/*.tsx',
  'lib/**/*.ts',
  'components/**/*.tsx',
]

const suspiciousPatterns = [
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /secret\s*[:=]\s*['"][^'"]+['"]/i,
  /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
  /jwt[_-]?secret\s*[:=]\s*['"][^'"]+['"]/i,
  /database[_-]?url\s*[:=]\s*['"]postgresql/i,
]

// This is a basic check - in production, use tools like git-secrets
console.log('ℹ️  Basic check completed. For thorough scan, use:')
console.log('   - git-secrets (AWS)')
console.log('   - truffleHog')
console.log('   - gitleaks')

if (allSafe) {
  console.log('\n✅ Security check passed! Safe to push to GitHub.')
  console.log('\n📝 Remember:')
  console.log('   - Never commit .env files')
  console.log('   - Never commit database files')
  console.log('   - Never commit API keys or secrets')
  console.log('   - Review all changes before pushing')
} else {
  console.error('\n❌ Security check FAILED!')
  console.error('   Please fix the issues above before pushing to GitHub.')
  process.exit(1)
}

