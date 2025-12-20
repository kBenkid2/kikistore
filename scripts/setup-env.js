/**
 * Script to create .env.local file
 */

const fs = require('fs')
const path = require('path')

const envContent = `DATABASE_URL="postgresql://postgres:Benben582004nhe%21%40%23@db.uumwrwpxwdhurrexqoam.supabase.co:5432/postgres"
JWT_SECRET="fa107561e658d3d97cfbff80f2af1c2f2e5f194b6573f9f7086ede340d39be53"
NODE_ENV=development
`

const envPath = path.join(process.cwd(), '.env.local')

try {
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists')
    console.log('   Updating with new values...')
  }
  
  fs.writeFileSync(envPath, envContent, 'utf8')
  console.log('✅ Created .env.local successfully!')
  console.log('   - DATABASE_URL: Set')
  console.log('   - JWT_SECRET: Set')
  console.log('   - NODE_ENV: development')
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message)
  console.log('\n📝 Please create .env.local manually with:')
  console.log(envContent)
  process.exit(1)
}

