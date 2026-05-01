#!/usr/bin/env node

console.log('🚀 Starting Vercel build process...');
console.log('📋 Step 1: Environment checks');

// Environment checks
console.log('🔍 Checking Node.js version:', process.version);
console.log('🔍 Checking working directory:', process.cwd());
console.log('🔍 Checking platform:', process.platform);
console.log('🔍 Checking environment variables:');
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - VERCEL_ENV:', process.env.VERCEL_ENV);
console.log('  - VERCEL_URL:', process.env.VERCEL_URL);

console.log('\n📦 Step 2: Package.json verification');
try {
  const fs = require('fs');
  const path = require('path');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  console.log('📖 Reading package.json from:', packageJsonPath);
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log('✅ Package.json found and valid');
    console.log('📦 Project name:', packageJson.name);
    console.log('📦 Project version:', packageJson.version);
    console.log('📦 Build script:', packageJson.scripts?.build);
    console.log('📦 Vercel build script:', packageJson.scripts?.['vercel-build']);
  } else {
    console.error('❌ package.json not found at:', packageJsonPath);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error reading package.json:', error.message);
  process.exit(1);
}

console.log('\n🔧 Step 3: Angular CLI check');
try {
  const { execSync } = require('child_process');
  
  console.log('🔍 Checking Angular CLI version...');
  const ngVersion = execSync('npx ng version', { encoding: 'utf8', stdio: 'pipe' });
  console.log('✅ Angular CLI version check passed');
  console.log('📋 CLI output:', ngVersion.split('\n')[0]); // First line only
} catch (error) {
  console.error('❌ Angular CLI check failed:', error.message);
  console.error('❌ Error output:', error.stderr?.toString());
  process.exit(1);
}

console.log('\n📁 Step 4: Project structure check');
try {
  const fs = require('fs');
  const path = require('path');
  
  const criticalFiles = [
    'angular.json',
    'tsconfig.json',
    'src/main.ts',
    'src/app/app.ts',
    'src/index.html'
  ];
  
  for (const file of criticalFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.error(`❌ Critical file missing: ${file}`);
      process.exit(1);
    }
  }
} catch (error) {
  console.error('❌ Error checking project structure:', error.message);
  process.exit(1);
}

console.log('\n🏗️ Step 5: Running Angular build');
try {
  const { execSync } = require('child_process');
  
  console.log('🔨 Executing: ng build --configuration production');
  
  // Build with detailed output
  const buildOutput = execSync('npx ng build --configuration production --verbose', {
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  console.log('✅ Build completed successfully');
  console.log('📋 Build output summary:');
  
  // Show last few lines of build output (most important)
  const outputLines = buildOutput.split('\n');
  const summaryLines = outputLines.slice(-10);
  summaryLines.forEach((line, index) => {
    console.log(`  ${index + 1}. ${line}`);
  });
  
} catch (error) {
  console.error('❌ Build failed!');
  console.error('❌ Error message:', error.message);
  console.error('❌ Error output:');
  console.error(error.stderr?.toString());
  process.exit(1);
}

console.log('\n📂 Step 6: Build output verification');
try {
  const fs = require('fs');
  const path = require('path');
  
  const distPath = path.join(process.cwd(), 'dist');
  console.log('🔍 Checking dist directory:', distPath);
  
  if (fs.existsSync(distPath)) {
    console.log('✅ Dist directory exists');
    
    // List contents of dist directory
    const distContents = fs.readdirSync(distPath, { withFileTypes: true });
    console.log('📁 Dist directory contents:');
    distContents.forEach(item => {
      const itemType = item.isDirectory() ? '📁' : '📄';
      console.log(`  ${itemType} ${item.name}`);
    });
    
    // Check for expected build output
    const browserPath = path.join(distPath, 'routing', 'browser');
    if (fs.existsSync(browserPath)) {
      console.log('✅ Expected build output path exists:', browserPath);
      
      // Check for index.html
      const indexPath = path.join(browserPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        console.log('✅ index.html found in build output');
        
        // Check file size
        const stats = fs.statSync(indexPath);
        console.log('📄 index.html size:', stats.size, 'bytes');
      } else {
        console.error('❌ index.html not found in build output');
        process.exit(1);
      }
    } else {
      console.error('❌ Expected build output path not found:', browserPath);
      process.exit(1);
    }
  } else {
    console.error('❌ Dist directory not found');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error verifying build output:', error.message);
  process.exit(1);
}

console.log('\n🎉 Step 7: Build process completed successfully!');
console.log('✅ All checks passed');
console.log('✅ Build output verified');
console.log('✅ Ready for deployment');

// Final summary
console.log('\n📊 Build Summary:');
console.log('  - Environment: ✅ Verified');
console.log('  - Dependencies: ✅ Verified');
console.log('  - Project Structure: ✅ Verified');
console.log('  - Angular Build: ✅ Completed');
console.log('  - Output Verification: ✅ Passed');
console.log('\n🚀 Deployment ready!');
