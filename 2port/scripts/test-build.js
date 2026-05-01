#!/usr/bin/env node

console.log('🧪 Testing build script locally...');
console.log('📍 Current directory:', process.cwd());

// Test if our vercel-build script exists and is executable
const fs = require('fs');
const path = require('path');

const buildScriptPath = path.join(process.cwd(), 'scripts', 'vercel-build.js');
console.log('🔍 Build script path:', buildScriptPath);

if (fs.existsSync(buildScriptPath)) {
  console.log('✅ Build script exists');
  
  try {
    // Test the build script
    console.log('🏃 Running build script test...');
    const { execSync } = require('child_process');
    
    // Run with timeout to prevent hanging
    const result = execSync('node scripts/vercel-build.js', {
      encoding: 'utf8',
      stdio: 'inherit',
      timeout: 300000 // 5 minutes timeout
    });
    
    console.log('✅ Build script test completed successfully');
  } catch (error) {
    console.error('❌ Build script test failed:', error.message);
    process.exit(1);
  }
} else {
  console.error('❌ Build script not found');
  process.exit(1);
}

console.log('🎉 Build script test completed!');
