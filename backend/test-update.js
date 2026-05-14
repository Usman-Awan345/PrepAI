import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import aiService from './src/services/aiService.js';

async function test() {
  console.log('Testing updated AI Service...\n');
  const response = await aiService.generateResponse(
    'How to prepare for system design interviews?',
    'You are a technical interviewer. Give a concise answer.'
  );
  console.log('\n📝 Response:\n', response);
}

test();