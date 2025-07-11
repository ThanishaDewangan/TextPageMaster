#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Invoice Generator Application...\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file from template...');
  try {
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ .env file created! Please update with your database credentials.\n');
  } catch (error) {
    console.log('⚠️ Please manually copy .env.example to .env and update with your credentials.\n');
  }
} else {
  console.log('✅ .env file already exists.\n');
}

// Check Node.js version
console.log('🔍 Checking Node.js version...');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js version: ${nodeVersion}\n`);
} catch (error) {
  console.log('❌ Node.js is not installed. Please install Node.js 18+ first.\n');
  process.exit(1);
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully!\n');
} catch (error) {
  console.log('❌ Failed to install dependencies. Please run "npm install" manually.\n');
  process.exit(1);
}

console.log('🎉 Setup completed successfully!\n');
console.log('Next steps:');
console.log('1. Update .env file with your database credentials');
console.log('2. Make sure PostgreSQL is running');
console.log('3. Run "npm run db:push" to set up database tables');
console.log('4. Run "npm run dev" to start the application');
console.log('\n📚 See README.md for detailed instructions.');