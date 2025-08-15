#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Bundle Analysis Tool');
console.log('======================\n');

// Function to get file size in MB
function getFileSizeInMB(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / (1024 * 1024)).toFixed(2);
  } catch (error) {
    return 0;
  }
}

// Function to analyze node_modules size
function analyzeNodeModules() {
  console.log('📦 Analyzing node_modules...');
  
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('❌ node_modules not found');
    return;
  }

  const packages = fs.readdirSync(nodeModulesPath)
    .filter(item => {
      const itemPath = path.join(nodeModulesPath, item);
      return fs.statSync(itemPath).isDirectory() && !item.startsWith('.');
    })
    .map(package => {
      const packagePath = path.join(nodeModulesPath, package);
      const size = getFileSizeInMB(packagePath);
      return { name: package, size: parseFloat(size) };
    })
    .filter(pkg => pkg.size > 0)
    .sort((a, b) => b.size - a.size)
    .slice(0, 20);

  console.log('\n🏆 Top 20 Largest Packages:');
  packages.forEach((pkg, index) => {
    console.log(`${index + 1}. ${pkg.name}: ${pkg.size} MB`);
  });
}

// Function to analyze .next directory
function analyzeNextBuild() {
  console.log('\n📁 Analyzing .next build directory...');
  
  const nextPath = path.join(process.cwd(), '.next');
  if (!fs.existsSync(nextPath)) {
    console.log('❌ .next directory not found. Run "npm run build" first.');
    return;
  }

  const staticPath = path.join(nextPath, 'static');
  if (fs.existsSync(staticPath)) {
    const chunks = fs.readdirSync(staticPath)
      .filter(item => item.startsWith('chunks'))
      .map(chunk => {
        const chunkPath = path.join(staticPath, chunk);
        const size = getFileSizeInMB(chunkPath);
        return { name: chunk, size: parseFloat(size) };
      })
      .filter(chunk => chunk.size > 0)
      .sort((a, b) => b.size - a.size);

    console.log('\n📊 Largest JavaScript Chunks:');
    chunks.slice(0, 10).forEach((chunk, index) => {
      console.log(`${index + 1}. ${chunk.name}: ${chunk.size} MB`);
    });
  }
}

// Function to analyze TypeScript files
function analyzeTypeScriptFiles() {
  console.log('\n📝 Analyzing TypeScript files...');
  
  const srcPath = path.join(process.cwd(), 'src');
  if (!fs.existsSync(srcPath)) {
    console.log('❌ src directory not found');
    return;
  }

  function getFilesRecursively(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        getFilesRecursively(filePath, fileList);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const size = getFileSizeInMB(filePath);
        fileList.push({
          path: path.relative(process.cwd(), filePath),
          size: parseFloat(size)
        });
      }
    });
    
    return fileList;
  }

  const tsFiles = getFilesRecursively(srcPath)
    .filter(file => file.size > 0.01) // Only files larger than 10KB
    .sort((a, b) => b.size - a.size)
    .slice(0, 15);

  console.log('\n📄 Largest TypeScript Files:');
  tsFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file.path}: ${file.size} MB`);
  });
}

// Function to check for common performance issues
function checkPerformanceIssues() {
  console.log('\n⚠️  Performance Issue Check:');
  
  const issues = [];
  
  // Check for large dependencies
  const largeDeps = [
    '@mui/material',
    '@mui/icons-material',
    '@mui/lab',
    'apexcharts',
    'react-apexcharts',
    'framer-motion',
    'emoji-picker-react',
    'react-dropzone'
  ];
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    largeDeps.forEach(dep => {
      if (dependencies[dep]) {
        issues.push(`⚠️  Large dependency detected: ${dep}`);
      }
    });
  }
  
  // Check for common anti-patterns
  const srcPath = path.join(process.cwd(), 'src');
  if (fs.existsSync(srcPath)) {
    const files = fs.readdirSync(srcPath, { recursive: true });
    
    // Check for direct Material-UI imports
    const muiImports = files.filter(file => 
      typeof file === 'string' && 
      (file.endsWith('.tsx') || file.endsWith('.ts'))
    ).some(file => {
      try {
        const content = fs.readFileSync(path.join(srcPath, file), 'utf8');
        return content.includes('@mui/material') && content.includes('import');
      } catch {
        return false;
      }
    });
    
    if (muiImports) {
      issues.push('⚠️  Direct Material-UI imports detected (consider lazy loading)');
    }
  }
  
  if (issues.length === 0) {
    console.log('✅ No obvious performance issues detected');
  } else {
    issues.forEach(issue => console.log(issue));
  }
}

// Function to provide optimization recommendations
function provideRecommendations() {
  console.log('\n💡 Optimization Recommendations:');
  console.log('================================');
  
  const recommendations = [
    '🚀 Use dynamic imports for heavy components',
    '📦 Implement code splitting for routes',
    '🎯 Lazy load Material-UI components',
    '🔄 Use React.memo for expensive components',
    '📱 Optimize images and assets',
    '⚡ Consider using lighter alternatives to heavy libraries',
    '🔧 Implement proper tree shaking',
    '📊 Use bundle analyzer regularly',
    '🎨 Consider CSS-in-JS alternatives',
    '📈 Monitor bundle size in CI/CD'
  ];
  
  recommendations.forEach(rec => console.log(rec));
}

// Main execution
try {
  analyzeNodeModules();
  analyzeNextBuild();
  analyzeTypeScriptFiles();
  checkPerformanceIssues();
  provideRecommendations();
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Run "npm run analyze" to generate bundle analysis');
  console.log('2. Open the generated HTML files in your browser');
  console.log('3. Focus on the largest chunks and dependencies');
  console.log('4. Implement lazy loading for heavy components');
  console.log('5. Consider replacing large dependencies with lighter alternatives');
  
} catch (error) {
  console.error('❌ Error during analysis:', error.message);
  process.exit(1);
}
