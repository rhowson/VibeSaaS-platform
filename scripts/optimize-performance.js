#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Optimizing application performance...');

// Clean up build artifacts
const cleanupPaths = [
  '.next',
  'node_modules/.cache',
  '.swc',
  'out'
];

cleanupPaths.forEach(cleanupPath => {
  if (fs.existsSync(cleanupPath)) {
    console.log(`🧹 Cleaning up ${cleanupPath}...`);
    fs.rmSync(cleanupPath, { recursive: true, force: true });
  }
});

// Check for large dependencies
console.log('📦 Checking for large dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

// List of known large packages to watch out for
const largePackages = [
  '@mui/material',
  '@mui/icons-material',
  '@wandersonalwes/iconsax-react',
  'react-dropzone',
  'emoji-picker-react'
];

largePackages.forEach(pkg => {
  if (dependencies[pkg]) {
    console.log(`⚠️  Large package detected: ${pkg}`);
  }
});

// Create .env.local with performance optimizations if it doesn't exist
const envPath = '.env.local';
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating optimized .env.local...');
  const envContent = `# Performance optimizations
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
NEXT_SHARP_PATH=./node_modules/sharp

# Development optimizations
NEXT_FAST_REFRESH=true
NEXT_OPTIMIZE_FONTS=true

# Existing environment variables
NEXTAUTH_SECRET=zouAqExSMUIx0LGPoBKmzkUxLiveelCyGhpPjrY5yBk=
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=fcGPtgjEi4b6ytDsleY5+g91XkvbwKYIk3vB8BK0rGo=
NEXT_APP_API_URL=http://localhost:3000
`;
  fs.writeFileSync(envPath, envContent);
}

console.log('✅ Performance optimization complete!');
console.log('');
console.log('💡 Performance tips:');
console.log('   • Use dynamic imports for large components');
console.log('   • Implement code splitting for routes');
console.log('   • Optimize images with next/image');
console.log('   • Use React.memo for expensive components');
console.log('   • Consider lazy loading for non-critical features');
console.log('');
console.log('🚀 Run "npm run dev" to start the optimized development server');
