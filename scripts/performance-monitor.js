#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path'); // Added missing import for path

console.log('🔍 Performance Monitoring...\n');

// Check bundle size
try {
  console.log('📦 Bundle Analysis:');
  const bundleInfo = execSync('npx next-bundle-analyzer --help', { encoding: 'utf8' });
  console.log('Bundle analyzer available');
} catch (error) {
  console.log('Bundle analyzer not available, install with: npm install --save-dev @next/bundle-analyzer');
}

// Check for large files
console.log('\n📁 Large Files Check:');
const largeFiles = [];
const srcDir = './src';

function checkFileSize(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      checkFileSize(filePath);
    } else if (stat.isFile() && file.endsWith('.tsx') || file.endsWith('.ts')) {
      const sizeInKB = stat.size / 1024;
      if (sizeInKB > 50) { // Files larger than 50KB
        largeFiles.push({ file: filePath, size: sizeInKB });
      }
    }
  });
}

if (fs.existsSync(srcDir)) {
  checkFileSize(srcDir);
  largeFiles.sort((a, b) => b.size - a.size);
  largeFiles.slice(0, 10).forEach(file => {
    console.log(`  ${file.file}: ${file.size.toFixed(2)}KB`);
  });
}

// Check dependencies
console.log('\n📋 Dependency Analysis:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

const heavyDeps = [
  '@mui/material',
  '@mui/icons-material',
  '@wandersonalwes/iconsax-react',
  'react-dropzone',
  'emoji-picker-react',
  'framer-motion',
  'apexcharts',
  'react-apexcharts'
];

heavyDeps.forEach(dep => {
  if (allDeps[dep]) {
    console.log(`  ⚠️  Heavy dependency: ${dep}`);
  }
});

// Performance recommendations
console.log('\n💡 Performance Recommendations:');
console.log('  1. Use dynamic imports for heavy components');
console.log('  2. Implement React.memo for expensive components');
console.log('  3. Use Next.js Image component for images');
console.log('  4. Consider code splitting for routes');
console.log('  5. Optimize Material-UI imports');
console.log('  6. Use SWR for data fetching with caching');
console.log('  7. Implement virtual scrolling for large lists');
console.log('  8. Use React.lazy for component lazy loading');

console.log('\n🚀 Quick fixes:');
console.log('  • Run: npm run optimize');
console.log('  • Run: npm run clean');
console.log('  • Use: npm run dev:fast');
