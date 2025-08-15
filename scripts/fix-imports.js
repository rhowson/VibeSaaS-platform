#!/usr/bin/env node

/**
 * Fix all import path issues for Vercel deployment
 * This script replaces all relative imports with @ alias imports
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to fix
const patterns = [
  // Fix imports from 'components/' to '@/components/'
  { from: /from ['"]components\//g, to: "from '@/components/" },
  // Fix imports from 'hooks/' to '@/hooks/'
  { from: /from ['"]hooks\//g, to: "from '@/hooks/" },
  // Fix imports from 'utils/' to '@/utils/'
  { from: /from ['"]utils\//g, to: "from '@/utils/" },
  // Fix imports from 'types/' to '@/types/'
  { from: /from ['"]types\//g, to: "from '@/types/" },
  // Fix imports from 'api/' to '@/api/'
  { from: /from ['"]api\//g, to: "from '@/api/" },
  // Fix imports from 'views/' to '@/views/'
  { from: /from ['"]views\//g, to: "from '@/views/" },
  // Fix imports from 'sections/' to '@/sections/'
  { from: /from ['"]sections\//g, to: "from '@/sections/" },
  // Fix imports from 'config' to '@/config'
  { from: /from ['"]config['"]/g, to: "from '@/config'" },
  // Fix imports from 'contexts/' to '@/contexts/'
  { from: /from ['"]contexts\//g, to: "from '@/contexts/" },
  // Fix imports from 'data/' to '@/data/'
  { from: /from ['"]data\//g, to: "from '@/data/" },
  // Fix imports from 'menu-items/' to '@/menu-items/'
  { from: /from ['"]menu-items\//g, to: "from '@/menu-items/" },
  // Fix imports from 'layout/' to '@/layout/'
  { from: /from ['"]layout\//g, to: "from '@/layout/" }
];

// Get all TypeScript and JavaScript files
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
  ignore: ['src/**/node_modules/**', 'src/**/.next/**']
});

console.log(`🔧 Fixing import paths in ${files.length} files...`);

let totalFixed = 0;

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    let newContent = content;
    let fileFixed = false;

    patterns.forEach(pattern => {
      const matches = newContent.match(pattern.from);
      if (matches) {
        newContent = newContent.replace(pattern.from, pattern.to);
        fileFixed = true;
        totalFixed += matches.length;
      }
    });

    if (fileFixed) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`✅ Fixed: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n🎉 Fixed ${totalFixed} import paths across ${files.length} files!`);
console.log('\n📋 Next steps:');
console.log('1. Run: npm run build');
console.log('2. If successful, deploy to Vercel');
console.log('3. If errors remain, check the specific files mentioned');
