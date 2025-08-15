#!/usr/bin/env node

/**
 * Generate secure secrets for environment variables
 * Run with: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

console.log('🔐 Generating secure secrets for your SaaS platform...\n');

// Generate random secrets
const generateSecret = (length = 32) => {
  return crypto.randomBytes(length).toString('base64');
};

const secrets = {
  NEXTAUTH_SECRET: generateSecret(32),
  JWT_SECRET: generateSecret(32),
};

console.log('📋 Copy these values to your .env.local file:\n');

Object.entries(secrets).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});

console.log('\n🔑 Additional steps needed:');
console.log('1. Get Supabase credentials from: https://supabase.com/dashboard');
console.log('2. Get OpenAI API key from: https://platform.openai.com/api-keys');
console.log('3. Get Anthropic API key from: https://console.anthropic.com/');
console.log('4. Update your .env.local file with all the real values');

console.log('\n✅ Secrets generated successfully!');
