import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

try {
  const r = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    { contents: [{ parts: [{ text: 'Say hello in one sentence' }] }] }
  );
  console.log('SUCCESS:', r.data.candidates[0].content.parts[0].text);
} catch(e) {
  console.log('ERROR:', JSON.stringify(e.response?.data || e.message));
}