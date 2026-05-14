import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function testWorkingModels() {
  console.log('Testing OpenRouter with working models...\n');
  
  const models = [
    'mistralai/mistral-7b-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'microsoft/phi-3-mini-128k-instruct:free'
  ];
  
  for (const model of models) {
    try {
      console.log(`Trying ${model}...`);
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model,
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
      
      console.log(`✅ SUCCESS with ${model}!`);
      console.log(`Response: ${response.data.choices[0].message.content}\n`);
      return true;
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.data?.error?.message || error.message}\n`);
    }
  }
  
  return false;
}

testWorkingModels();