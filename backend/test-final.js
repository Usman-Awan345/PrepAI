import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function testAPI() {
  console.log('=== Testing OpenRouter API ===\n');
  console.log('API Key:', process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.substring(0, 20) + '...' : 'Missing');
  
  // Try with different models
  const models = [
    'mistralai/mistral-7b-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'microsoft/phi-3-mini-128k-instruct:free'
  ];
  
  for (const model of models) {
    try {
      console.log(`\n📡 Trying model: ${model}`);
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model,
          messages: [
            { role: 'user', content: 'Say "API is working" in 3 words.' }
          ],
          max_tokens: 20
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      console.log('✅ SUCCESS! Response:', response.data.choices[0].message.content);
      return true;
    } catch (error) {
      console.log('❌ Failed:', error.response?.data?.error?.message || error.message);
    }
  }
  
  return false;
}

testAPI();