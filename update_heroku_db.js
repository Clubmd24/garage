#!/usr/bin/env node
import { execSync } from 'child_process';

const NEW_DATABASE_URL = 'mysql://bpeecgtjjap3zgh0:a1iz4j4ahjmfx3b9@e7qyahb3d90mletd.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/wly7t9e8kb0s0mb7';

async function updateHerokuDatabase() {
  console.log('🚀 Updating Heroku database configuration...');
  
  try {
    // Update the DATABASE_URL environment variable
    console.log('📝 Setting new DATABASE_URL...');
    execSync(`heroku config:set DATABASE_URL="${NEW_DATABASE_URL}"`, { stdio: 'inherit' });
    
    // Verify the configuration
    console.log('🔍 Verifying configuration...');
    execSync('heroku config:get DATABASE_URL', { stdio: 'inherit' });
    
    console.log('✅ Heroku database configuration updated successfully!');
    console.log('🔄 You may need to restart your dynos for the changes to take effect.');
    console.log('💡 Run: heroku restart');
    
  } catch (error) {
    console.error('❌ Failed to update Heroku configuration:', error.message);
    console.log('💡 Make sure you have the Heroku CLI installed and are logged in.');
  }
}

// Run the update
updateHerokuDatabase();
