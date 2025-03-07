import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'PORT',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REFRESH_TOKEN',
    'GMAIL_USER'
];

const optional = [
    'REDIS_URL',
    'GOOGLE_REDIRECT_URI',
    'NODE_ENV',
    'FRONTEND_URL'
];

console.log('Checking environment variables...\n');

let hasError = false;

console.log('Required variables:');
required.forEach(key => {
    if (!process.env[key]) {
        console.error(`❌ ${key} is missing`);
        hasError = true;
    } else {
        console.log(`✅ ${key} is set`);
    }
});

console.log('\nOptional variables:');
optional.forEach(key => {
    if (!process.env[key]) {
        console.warn(`⚠️  ${key} is not set`);
    } else {
        console.log(`✅ ${key} is set`);
    }
});

if (hasError) {
    console.error('\n❌ Missing required environment variables');
    process.exit(1);
} else {
    console.log('\n✅ All required environment variables are set');
} 