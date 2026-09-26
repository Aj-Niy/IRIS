import dotenv from 'dotenv';
dotenv.config();
const key = process.env.GEMINI_API_KEY;
for (const modelName of ['gemini-3.6-flash', 'gemini-3.5-flash']) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: 'Hello' }] }] })
  });
  console.log(modelName, res.status, await res.text());
}
