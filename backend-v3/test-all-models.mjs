import dotenv from 'dotenv';
dotenv.config();

const TEST_PROMPT = 'Say "Hello, I am working!" in exactly 5 words. Nothing else.';

async function testGroq() {
  console.log('\n[1] Testing GROQ...');
  const models = ['llama-3.1-8b-instant', 'llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
  for (const model of models) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: TEST_PROMPT }], max_tokens: 50 })
      });
      if (!res.ok) { const t = await res.text(); console.log(`   ❌ ${model} → HTTP ${res.status}: ${t.slice(0,80)}`); continue; }
      const d = await res.json();
      console.log(`   ✅ ${model} → "${d.choices?.[0]?.message?.content?.trim()}"`);
    } catch(e) { console.log(`   ❌ ${model} → ${e.message?.slice(0,80)}`); }
  }
}

async function testOpenRouter() {
  console.log('\n[2] Testing OPENROUTER...');
  const models = [
    'meta-llama/llama-3.1-8b-instruct:free',
    'qwen/qwen3.6-27b:free',
    'nvidia/nemotron-nano-12b-v2:free',
    'mistralai/mistral-7b-instruct:free',
  ];
  for (const model of models) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://codeseekho.app' },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: TEST_PROMPT }], max_tokens: 50 })
      });
      if (!res.ok) { const t = await res.text(); console.log(`   ❌ ${model} → HTTP ${res.status}: ${t.slice(0,100)}`); continue; }
      const d = await res.json();
      const content = d.choices?.[0]?.message?.content?.trim();
      if (content) console.log(`   ✅ ${model} → "${content}"`);
      else console.log(`   ⚠️  ${model} → empty response: ${JSON.stringify(d).slice(0,100)}`);
    } catch(e) { console.log(`   ❌ ${model} → ${e.message?.slice(0,80)}`); }
  }
}

async function testCloudflare() {
  console.log('\n[3] Testing CLOUDFLARE...');
  const models = ['@cf/meta/llama-3.1-8b-instruct', '@cf/meta/llama-3-8b-instruct', '@cf/mistral/mistral-7b-instruct-v0.1'];
  for (const model of models) {
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${model}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.CLOUDFLARE_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: TEST_PROMPT }] })
      });
      if (!res.ok) { const t = await res.text(); console.log(`   ❌ ${model} → HTTP ${res.status}: ${t.slice(0,100)}`); continue; }
      const d = await res.json();
      if (d.success) console.log(`   ✅ ${model} → "${d.result?.response?.trim()}"`);
      else console.log(`   ❌ ${model} → ${JSON.stringify(d.errors)}`);
    } catch(e) { console.log(`   ❌ ${model} → ${e.message?.slice(0,80)}`); }
  }
}

async function testElevenLabs() {
  console.log('\n[4] Testing ELEVENLABS keys...');
  const keys = (process.env.ELEVENLABS_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
  console.log(`   Found ${keys.length} key(s)`);
  for (let i = 0; i < keys.length; i++) {
    try {
      const res = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
        headers: { 'xi-api-key': keys[i] }
      });
      if (!res.ok) { console.log(`   ❌ Key ${i+1} → HTTP ${res.status}`); continue; }
      const d = await res.json();
      const used = d.character_count ?? 0;
      const limit = d.character_limit ?? 0;
      const pct = limit > 0 ? ((used/limit)*100).toFixed(1) : 0;
      console.log(`   ${pct > 90 ? '⚠️' : '✅'} Key ${i+1} → ${used.toLocaleString()} / ${limit.toLocaleString()} chars used (${pct}%)`);
    } catch(e) { console.log(`   ❌ Key ${i+1} → ${e.message?.slice(0,80)}`); }
  }
}

async function testDeepgram() {
  console.log('\n[5] Testing DEEPGRAM...');
  try {
    const res = await fetch('https://api.deepgram.com/v1/projects', {
      headers: { 'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}` }
    });
    if (!res.ok) { console.log(`   ❌ HTTP ${res.status}`); return; }
    const d = await res.json();
    console.log(`   ✅ Connected → ${d.projects?.length ?? 0} project(s)`);
  } catch(e) { console.log(`   ❌ ${e.message?.slice(0,80)}`); }
}

async function testGemini() {
  console.log('\n[6] Testing GEMINI (via llmRotation path)...');
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent(TEST_PROMPT);
      console.log(`   ✅ ${m} → "${result.response.text().trim()}"`);
    } catch(e) { console.log(`   ❌ ${m} → ${e.message?.slice(0,120)}`); }
  }
}

async function testSupabase() {
  console.log('\n[7] Testing SUPABASE...');
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { data, error } = await sb.from('videos').select('job_id').limit(1);
    if (error) console.log(`   ❌ DB Error: ${error.message}`);
    else console.log(`   ✅ Connected → videos table accessible (${data.length} row sample)`);
  } catch(e) { console.log(`   ❌ ${e.message?.slice(0,80)}`); }
}

// Run all tests
console.log('='.repeat(60));
console.log(' CodeSeekho — Full AI & API Diagnostic Test');
console.log('='.repeat(60));

await testGemini();
await testGroq();
await testOpenRouter();
await testCloudflare();
await testElevenLabs();
await testDeepgram();
await testSupabase();

console.log('\n' + '='.repeat(60));
console.log(' Diagnostics Complete');
console.log('='.repeat(60) + '\n');
