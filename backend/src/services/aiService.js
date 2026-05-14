import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

class AIService {
  get openRouterKey() {
    return process.env.OPENROUTER_API_KEY;
  }

  get geminiKey() {
    return process.env.GEMINI_API_KEY;
  }

  async callOpenRouter(prompt, systemPrompt = '') {
    // openrouter/auto picks any available free model automatically
    const models = [
      'openrouter/auto',
      'deepseek/deepseek-chat-v3-0324:free',
      'deepseek/deepseek-r1:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'qwen/qwen3-8b:free',
      'mistralai/mistral-small-3.1-24b-instruct:free',
    ];

    for (const model of models) {
      try {
        console.log(`Trying OpenRouter model: ${model}`);
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
          },
          {
            headers: {
              'Authorization': `Bearer ${this.openRouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:5173',
              'X-Title': 'AI Interview PrepAI'
            },
            timeout: 30000
          }
        );

        const content = response.data?.choices?.[0]?.message?.content;
        if (content) {
          console.log(`✅ OpenRouter success with: ${model}`);
          return content;
        }
      } catch (err) {
        const msg = err.response?.data?.error?.message || err.message;
        console.log(`❌ ${model} failed: ${msg}`);
        // If rate limited, wait 3 seconds before next model
        if (err.response?.data?.error?.code === 429) {
          await new Promise(r => setTimeout(r, 3000));
        }
        continue;
      }
    }
    throw new Error('All OpenRouter models failed');
  }

  async callGemini(prompt, systemPrompt = '') {
    const models = [
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
    ];

    for (const model of models) {
      try {
        console.log(`Trying Gemini model: ${model}`);
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiKey}`,
          {
            contents: [{
              parts: [{
                text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000
            }
          },
          { timeout: 30000 }
        );

        const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) {
          console.log(`✅ Gemini success with: ${model}`);
          return content;
        }
      } catch (err) {
        const msg = err.response?.data?.error?.message || err.message;
        console.log(`❌ Gemini ${model} failed: ${msg}`);
        continue;
      }
    }
    throw new Error('All Gemini models failed');
  }

  async generateResponse(prompt, systemPrompt = '') {
    // Try OpenRouter first
    try {
      return await this.callOpenRouter(prompt, systemPrompt);
    } catch (err) {
      console.log('OpenRouter failed, trying Gemini...');
    }

    // Try Gemini as fallback
    try {
      return await this.callGemini(prompt, systemPrompt);
    } catch (err) {
      console.log('Gemini failed too:', err.message);
    }

    // Last resort: informative fallback
    throw new Error('AI service unavailable. Please check your API keys.');
  }

  async streamResponse(prompt, systemPrompt = '', onChunk) {
    const response = await this.generateResponse(prompt, systemPrompt);
    const words = response.split(' ');
    for (let i = 0; i < words.length; i++) {
      onChunk(words[i] + (i < words.length - 1 ? ' ' : ''));
      await new Promise(resolve => setTimeout(resolve, 30));
    }
  }
}

export default new AIService();