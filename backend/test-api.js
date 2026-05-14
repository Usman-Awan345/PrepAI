import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from correct location
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('=== Testing API Keys ===\n');
console.log('OpenRouter Key:', process.env.OPENROUTER_API_KEY ? '✓ Present' : '✗ Missing');
console.log('Gemini Key:', process.env.GEMINI_API_KEY ? '✓ Present' : '✗ Missing');
console.log('');

async function testOpenRouter() {
  console.log('📡 Testing OpenRouter API...');
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          { role: 'user', content: 'What is React? Answer in one sentence.' }
        ],
        max_tokens: 50
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    console.log('✅ OpenRouter SUCCESS!');
    console.log('Response:', response.data.choices[0].message.content);
    return true;
  } catch (error) {
    console.log('❌ OpenRouter FAILED!');
    console.log('Error:', error.response?.data?.error?.message || error.message);
    return false;
  }
}

async function testGemini() {
  console.log('\n📡 Testing Gemini API...');
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: 'What is React? Answer in one sentence.' }]
        }]
      },
      { timeout: 10000 }
    );
    console.log('✅ Gemini SUCCESS!');
    console.log('Response:', response.data.candidates[0].content.parts[0].text);
    return true;
  } catch (error) {
    console.log('❌ Gemini FAILED!');
    console.log('Error:', error.response?.data?.error?.message || error.message);
    return false;
  }
}

async function main() {
  const openRouterOk = await testOpenRouter();
  const geminiOk = await testGemini();
  
  console.log('\n=== Summary ===');
  if (openRouterOk) {
    console.log('✓ OpenRouter is WORKING - Real AI responses will come from here');
  } else if (geminiOk) {
    console.log('✓ Gemini is WORKING - Real AI responses will come from here');
  } else {
    console.log('✗ NO working API keys found!');
    console.log('\nSolutions:');
    console.log('1. Get NEW API key from: https://openrouter.ai/keys');
    console.log('2. Update .env file with new key');
    console.log('3. Restart backend server');
  }
}

main();