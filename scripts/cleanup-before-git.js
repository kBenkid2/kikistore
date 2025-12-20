/**
 * Script to clean up unnecessary files before pushing to GitHub
 * Removes development files, test files, and ensures security
 */

const fs = require('fs')
const path = require('path')

const filesToRemove = [
  // Root level duplicate images
  'AnhDiscord.png', // Already in public/
  'snowflakes.png', // Already in public/
  
  // Old SQLite database
  'prisma/dev.db',
  'prisma/dev.db-journal',
  
  // Test routes and pages
  'app/api/test',
  'app/test',
  
  // Unnecessary scripts (if exists)
  'scripts/setup-admin.js', // Use create-admin.js instead
]

const dirsToClean = [
  // Upload files (should not be committed)
  'public/uploads',
]

console.log('🧹 Cleaning up files before Git push...\n')

let removedCount = 0
let cleanedCount = 0

// Remove files
filesToRemove.forEach(file => {
  const filePath = path.join(process.cwd(), file)
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath)
      if (stats.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true })
        console.log(`✅ Removed directory: ${file}`)
        removedCount++
      } else {
        fs.unlinkSync(filePath)
        console.log(`✅ Removed file: ${file}`)
        removedCount++
      }
    }
  } catch (error) {
    console.warn(`⚠️  Could not remove ${file}:`, error.message)
  }
})

// Clean directories (remove contents but keep directory)
dirsToClean.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir)
  try {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath)
      files.forEach(file => {
        const filePath = path.join(dirPath, file)
        try {
          const stats = fs.statSync(filePath)
          if (stats.isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true })
          } else {
            fs.unlinkSync(filePath)
          }
          cleanedCount++
        } catch (error) {
          console.warn(`⚠️  Could not remove ${filePath}:`, error.message)
        }
      })
      if (cleanedCount > 0) {
        console.log(`✅ Cleaned directory: ${dir} (${cleanedCount} files)`)
      }
    }
  } catch (error) {
    console.warn(`⚠️  Could not clean ${dir}:`, error.message)
  }
})

console.log(`\n✅ Cleanup completed!`)
console.log(`   - Removed: ${removedCount} files/directories`)
console.log(`   - Cleaned: ${cleanedCount} files from uploads`)

// Check for sensitive files
console.log('\n🔒 Checking for sensitive files...\n')

const sensitiveFiles = [
  '.env',
  '.env.local',
  '.env.production',
  '.env.development',
  'prisma/dev.db',
  'prisma/dev.db-journal',
]

let foundSensitive = false
sensitiveFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file)
  if (fs.existsSync(filePath)) {
    // Check if in .gitignore
    const gitignore = fs.readFileSync('.gitignore', 'utf8')
    const isIgnored = gitignore.includes(file) || gitignore.includes(file.replace('./', ''))
    
    if (!isIgnored) {
      console.warn(`⚠️  WARNING: ${file} exists but may not be in .gitignore!`)
      foundSensitive = true
    } else {
      console.log(`✅ ${file} is properly ignored`)
    }
  }
})

if (!foundSensitive) {
  console.log('\n✅ All sensitive files are properly protected!')
}

console.log('\n📝 Next steps:')
console.log('   1. Review changes: git status')
console.log('   2. Add files: git add .')
console.log('   3. Commit: git commit -m "Clean up and prepare for deployment"')
console.log('   4. Push: git push origin main')

