// =============================================================================
// Shiksha Setu V2 -- AI Avatar Video Pipeline | server.js | Port 3002
// Features: Unlimited scenes, full content coverage, audio-subtitle sync
// =============================================================================
import express           from 'express';
import cors              from 'cors';
import dotenv            from 'dotenv';
import { exec }          from 'child_process';
import { promisify }     from 'util';
import fs                from 'fs/promises';
import { existsSync }    from 'fs';
import path              from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 }  from 'uuid';
import multer            from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient }  from '@supabase/supabase-js';
import { extractText }   from './fileProcessor.js';
import { generateSpeech, getVoiceStatus } from './voiceGenerator.js';
import { generateScriptWithRotation, callRawAIRotation, extractJson } from './llmRotation.js';

dotenv.config();
const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REQUIRED_ENV = ['GEMINI_API_KEY', 'SUPABASE_URL', 'SUPABASE_KEY'];
const missingEnv   = REQUIRED_ENV.filter(k => !process.env[k]);
if (missingEnv.length > 0) { console.error(`Missing env: ${missingEnv.join(', ')}`); process.exit(1); }

const PORT          = parseInt(process.env.PORT ?? '3002', 10);
const REMOTION_ROOT = path.resolve(__dirname, process.env.REMOTION_PROJECT_PATH || '..');
const AUDIO_DIR     = path.join(__dirname, 'out', 'audio');
const VIDEO_DIR     = path.join(__dirname, 'out', 'video');
const UPLOADS_DIR   = path.join(__dirname, 'out', 'uploads');
const SUPABASE_BUCKET = 'sih_videos';
const SUPABASE_TABLE  = 'videos';
const ALLOWED_SCENE_TYPES       = new Set(['intro', 'code', 'visual']);
const ALLOWED_VISUAL_ANIMATIONS = new Set(['forLoopIterator', 'whileCounter']);
const DID_API_KEY          = process.env.DID_API_KEY?.trim();
const HEYGEN_API_KEY       = process.env.HEYGEN_API_KEY?.trim();
const REPLICATE_API_TOKEN  = process.env.REPLICATE_API_TOKEN?.trim();
const HF_API_KEY           = process.env.HUGGINGFACE_API_KEY?.trim();
const INDIAN_AVATAR_IMAGE  = process.env.INDIAN_AVATAR_IMAGE || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop';

const genAI    = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

for (const dir of [AUDIO_DIR, VIDEO_DIR, UPLOADS_DIR]) {
  if (!existsSync(dir)) await fs.mkdir(dir, { recursive: true });
}

const ALLOWED_EXTS = new Set(['.pptx', '.ppt', '.pdf', '.txt', '.md', '.odp', '.png', '.jpg', '.jpeg', '.webp']);
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename:    (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    ALLOWED_EXTS.has(ext) ? cb(null, true) : cb(new Error(`Unsupported: ${ext}`));
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/study-tools', express.static(path.join(__dirname, 'public5000')));
app.use('/audio', express.static(AUDIO_DIR));

// =============================================================================
// SSE Progress System
// Each job stores: { pct, phase, message, done, error }
// Connected clients stored per jobId for real-time push
// =============================================================================
const jobProgress  = new Map();   // jobId -> { pct, phase, message, done, error }
const sseClients   = new Map();   // jobId -> Set of res objects

function emitProgress(jobId, pct, phase, message, isError = false) {
  const state = { pct: Math.min(100, Math.round(pct)), phase, message, done: pct >= 100 || isError, isError };
  jobProgress.set(jobId, state);
  const clients = sseClients.get(jobId);
  if (clients) {
    const data = `data: ${JSON.stringify(state)}\n\n`;
    for (const res of clients) {
      try { res.write(data); } catch {}
    }
    if (state.done) {
      setTimeout(() => { jobProgress.delete(jobId); sseClients.delete(jobId); }, 30000);
    }
  }
  console.log(`   [${Math.round(pct)}%] ${phase} -- ${message}`);
}

// SSE endpoint: GET /progress/:jobId
app.get('/progress/:jobId', (req, res) => {
  const { jobId } = req.params;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  res.write('\n'); // flush headers

  // Send current state immediately if available
  const current = jobProgress.get(jobId);
  if (current) res.write(`data: ${JSON.stringify(current)}\n\n`);

  // Register client
  if (!sseClients.has(jobId)) sseClients.set(jobId, new Set());
  sseClients.get(jobId).add(res);

  // Keep-alive heartbeat every 15s to prevent timeouts
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const s = sseClients.get(jobId);
    if (s) { s.delete(res); if (s.size === 0) sseClients.delete(jobId); }
  });
});

// =============================================================================
// Health check
// =============================================================================
app.get('/health', (_req, res) => {
  const voice = getVoiceStatus();
  res.json({
    status: 'ok', service: 'Shiksha Setu V2 -- AI Avatar', port: PORT,
    avatar: {
      did:            DID_API_KEY ? 'Active (Indian Educator)' : 'No key',
      heygen:         HEYGEN_API_KEY ? 'Configured' : 'No key',
      replicate:      REPLICATE_API_TOKEN ? 'Active' : 'No key',
      sadtalker:      HF_API_KEY ? 'Active (HuggingFace)' : 'No HF key',
      remotionAvatar: 'Always active (Indian AI Educator)',
      using: DID_API_KEY ? 'D-ID (Indian Educator) -> Replicate -> Remotion Avatar'
           : REPLICATE_API_TOKEN ? 'Replicate -> Remotion Avatar'
           : 'Remotion Avatar (Indian AI Educator)',
    },
    voices: {
      using: voice.activeEngine,
      sarvam: voice.sarvam,
      elevenlabs: voice.elevenlabs,
      edgeTTS: true,
    },
    timestamp: new Date().toISOString(),
  });
});

// =============================================================================
// GET /credits  — Live credit/quota status for all AI APIs
// =============================================================================
app.get('/credits', async (_req, res) => {
  const results = [];

  // 1. Gemini — check via a tiny prompt, read quota headers
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
    await model.generateContent('say ok');
    results.push({ name: 'Gemini 3.5 Flash Lite', status: 'ok', info: 'Responding normally', limit: '20 req/day (free)', color: 'green' });
  } catch(e) {
    const is429 = e.message?.includes('429') || e.message?.includes('quota');
    results.push({ name: 'Gemini 3.5 Flash Lite', status: is429 ? 'rate_limited' : 'error', info: is429 ? 'Daily quota hit (20/day free limit)' : e.message?.slice(0,80), limit: '20 req/day (free)', color: is429 ? 'orange' : 'red' });
  }

  // 2. Groq — check via models list (fast, no quota cost)
  try {
    const gr = await fetch('https://api.groq.com/openai/v1/models', { headers: { Authorization: 'Bearer ' + process.env.GROQ_API_KEY } });
    if (gr.ok) {
      const d = await gr.json();
      results.push({ name: 'Groq (Llama 3.1)', status: 'ok', info: d.data?.length + ' models available', limit: '14,400 tok/min (free)', color: 'green' });
    } else {
      results.push({ name: 'Groq (Llama 3.1)', status: 'error', info: 'API returned ' + gr.status, limit: '14,400 tok/min (free)', color: 'red' });
    }
  } catch(e) {
    results.push({ name: 'Groq (Llama 3.1)', status: 'error', info: e.message?.slice(0,60), limit: '14,400 tok/min (free)', color: 'red' });
  }

  // 3. Cloudflare — check via a tiny prompt
  try {
    const cf = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + process.env.CLOUDFLARE_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] })
    });
    if (cf.ok) {
      results.push({ name: 'Cloudflare (Llama 3.1)', status: 'ok', info: 'Responding normally', limit: '10,000 req/day (free)', color: 'green' });
    } else {
      results.push({ name: 'Cloudflare (Llama 3.1)', status: 'error', info: 'API returned ' + cf.status, limit: '10,000 req/day (free)', color: 'red' });
    }
  } catch(e) {
    results.push({ name: 'Cloudflare (Llama 3.1)', status: 'error', info: e.message?.slice(0,60), limit: '10,000 req/day (free)', color: 'red' });
  }

  // 4. OpenRouter — check key info + usage
  try {
    const or = await fetch('https://openrouter.ai/api/v1/auth/key', { headers: { Authorization: 'Bearer ' + process.env.OPENROUTER_API_KEY } });
    if (or.ok) {
      const d = await or.json();
      const usage = d.data?.usage_monthly ?? 0;
      const limit = d.data?.limit;
      const remaining = limit ? (limit - usage).toFixed(4) : 'Unlimited';
      results.push({ name: 'OpenRouter (Gemma 4)', status: 'ok', info: 'Monthly used: $' + usage.toFixed(4) + ' | Remaining: ' + remaining, limit: 'Free tier (50+ models)', color: 'green' });
    } else {
      results.push({ name: 'OpenRouter (Gemma 4)', status: 'error', info: 'API returned ' + or.status, limit: 'Free tier', color: 'red' });
    }
  } catch(e) {
    results.push({ name: 'OpenRouter (Gemma 4)', status: 'error', info: e.message?.slice(0,60), limit: 'Free tier', color: 'red' });
  }

  // 5. Deepgram (Voice) — check via project usage
  try {
    const dg = await fetch('https://api.deepgram.com/v1/projects', { headers: { Authorization: 'Token ' + process.env.DEEPGRAM_API_KEY } });
    if (dg.ok) {
      results.push({ name: 'Deepgram (Voice)', status: 'ok', info: 'Active & Responding', limit: '$200 Free Credit', color: 'green' });
    } else {
      results.push({ name: 'Deepgram (Voice)', status: 'error', info: 'API returned ' + dg.status, limit: '$200 Free Credit', color: 'red' });
    }
  } catch(e) {
    results.push({ name: 'Deepgram (Voice)', status: 'error', info: e.message?.slice(0,60), limit: '$200 Free Credit', color: 'red' });
  }

  // 6. ElevenLabs — check subscription (supports comma-separated multi-keys)
  try {
    const elKeys = (process.env.ELEVENLABS_API_KEY || '').split(',').map(k => k.trim()).filter(k => k.length > 10);
    if (elKeys.length > 0) {
      let totalUsed = 0;
      let totalLimit = 0;
      let anyOk = false;
      let lastStatus = null;
      
      for (const key of elKeys) {
        const el = await fetch('https://api.elevenlabs.io/v1/user/subscription', { headers: { 'xi-api-key': key } });
        if (el.ok) {
          anyOk = true;
          const d = await el.json();
          totalUsed += (d.character_count ?? 0);
          totalLimit += (d.character_limit ?? 10000);
        } else {
          lastStatus = el.status;
        }
      }

      if (anyOk) {
        const pct = ((totalUsed / totalLimit) * 100).toFixed(1);
        results.push({ name: 'ElevenLabs (Voice)', status: pct > 90 ? 'warning' : 'ok', info: totalUsed.toLocaleString() + ' / ' + totalLimit.toLocaleString() + ' chars used (' + pct + '%)', limit: totalLimit.toLocaleString() + ' chars/month', color: pct > 90 ? 'orange' : 'green', used: totalUsed, total: totalLimit, pct: parseFloat(pct) });
      } else {
        results.push({ name: 'ElevenLabs (Voice)', status: 'error', info: 'All keys failed (Last API returned ' + lastStatus + ')', limit: (elKeys.length * 10000).toLocaleString() + ' chars/month', color: 'red' });
      }
    } else {
      results.push({ name: 'ElevenLabs (Voice)', status: 'error', info: 'No valid API keys found in .env', limit: '10,000 chars/month', color: 'red' });
    }
  } catch(e) {
    results.push({ name: 'ElevenLabs (Voice)', status: 'error', info: e.message?.slice(0,60), limit: '10,000 chars/month', color: 'red' });
  }

  // 6. Edge TTS — always free
  results.push({ name: 'Edge TTS (Voice Backup)', status: 'ok', info: 'Local system TTS — always available', limit: 'Unlimited', color: 'green' });

  res.json({ credits: results, timestamp: new Date().toISOString() });
});


// =============================================================================
// Language Prompt Directive Builder — Clean, unambiguous language rules
// =============================================================================
function getLanguagePromptDirectives(targetLanguage) {
  if (targetLanguage === 'English') {
    return `CRITICAL LANGUAGE MANDATE:
The user selected target language: **English (Indian English)**.
- Write ALL titles, headings, bullet points, flowchart steps, code comments, and spoken "text" narrations EXCLUSIVELY in clear, natural English.
- Do NOT translate into Hindi. Do NOT mix Hindi or any other language. Keep 100% of the script and speech in English.`;
  }
  if (targetLanguage === 'Hinglish') {
    return `CRITICAL LANGUAGE MANDATE:
The user selected target language: **Hinglish (Indian Conversational Blend)**.
- Visible on-screen titles, headings, code, and bullet points MUST be in clear English.
- Spoken "text" narration MUST be in natural, friendly Hinglish written in Roman script (e.g., "Hello dosto! Aaj hum cybersecurity ke major threats aur unke mechanisms ko detail mein samjhenge...").
- Do NOT use Devanagari script. Use Roman script so the Indian TTS voice speaks authentic conversational Hinglish.`;
  }
  if (targetLanguage === 'Hindi') {
    return `CRITICAL LANGUAGE MANDATE:
The user selected target language: **Hindi (हिन्दी)**.
- ALL titles, headings, bullet points, flowchart steps, and spoken "text" narrations MUST be in pure Hindi using Devanagari script (हिन्दी).
- Do NOT use English for explanations or narration. Programming syntax (e.g. 'for', 'while') can remain in code, but all explanations are in Hindi.`;
  }
  if (targetLanguage === 'Santhali') {
    return `CRITICAL LANGUAGE MANDATE:
The user selected target language: **Santhali (Ol Chiki - ᱚᱞ ᱪᱤᱠᱤ)**.
- ALL visible on-screen text MUST be in authentic Santhali using Ol Chiki script (ᱚᱞ ᱪᱤᱠᱤ).
- Spoken "text" narration MUST be in authentic Santhali vocabulary (or Romanized Santhali like "Johar! Tehen do abo...").
- ABSOLUTELY FORBIDDEN: DO NOT write in Hindi or Devanagari!`;
  }
  if (targetLanguage === 'Ho') {
    return `CRITICAL LANGUAGE MANDATE:
The user selected target language: **Ho (Ho Jagor)**.
- ALL visible on-screen text and spoken narration MUST be in authentic Ho language words. DO NOT use Hindi!`;
  }
  if (targetLanguage === 'Mundari') {
    return `CRITICAL LANGUAGE MANDATE:
The user selected target language: **Mundari (Mundari Jagor)**.
- ALL visible on-screen text and spoken narration MUST be in authentic Mundari language words. DO NOT use Hindi!`;
  }
  if (targetLanguage === 'Bengali') {
    return `CRITICAL LANGUAGE MANDATE:
The user selected target language: **Bengali (বাংলা)**.
- ALL titles, headings, bullet points, and spoken narration MUST be in pure Bengali using Bengali script.`;
  }
  return `CRITICAL LANGUAGE MANDATE:
The user selected target language: **${targetLanguage}**.
- ALL titles, headings, bullet points, and spoken narration MUST be exclusively in ${targetLanguage}.`;
}

// =============================================================================
// Helper: isCodingTopic -- intelligently detects if content is programming-related
// =============================================================================
function isCodingTopic(text) {
  if (!text) return false;
  const sample = text.slice(0, 15000).toLowerCase();

  // Strong programming keywords & syntax patterns
  const codingKeywords = [
    'python', 'javascript', 'typescript', 'c++', 'java', 'kotlin', 'golang', 'rust',
    'sql query', 'html', 'css', 'react', 'nodejs', 'function', 'class', 'method',
    'variable', 'array', 'pointer', 'loop', 'recursion', 'data structure',
    'algorithm', 'syntax', 'compiler', 'debugging', 'git commit', 'api endpoint',
    'def ', 'print(', 'console.log', '#include', 'public static void', 'int main',
    'import ', 'from ', 'select * from', 'const ', 'let ', 'var '
  ];

  let matches = 0;
  for (const kw of codingKeywords) {
    if (sample.includes(kw)) matches++;
  }

  // Strong non-coding indicators (literature, history, humanities, circuits/analog hardware, biology)
  const nonCodingKeywords = [
    'metamorphosis', 'kafka', 'novel', 'literature', 'character', 'protagonist',
    'gregor', 'poem', 'poetry', 'history', 'dynasty', 'revolution', 'empire',
    'philosophy', 'biology', 'photosynthesis', 'cell membrane', 'dna replication',
    'op amp', 'operational amplifier', 'inverting amplifier', 'gain bandwidth',
    'resistor', 'capacitor', 'slew rate', 'cmrr', 'transistor', 'economics',
    'macroeconomics', 'gdp', 'inflation', 'supply and demand', 'business study'
  ];

  let nonCodingMatches = 0;
  for (const nkw of nonCodingKeywords) {
    if (sample.includes(nkw)) nonCodingMatches++;
  }

  if (nonCodingMatches >= 2 && matches < 3) return false;
  return matches >= 2;
}

// =============================================================================
// Prompt Builder Helper — NotebookLM-style deep educational script
// =============================================================================
function buildScriptPrompt(rawText, targetLanguage, codeMode = 'auto') {
  const willIncludeCode = codeMode === 'always' ? true 
                        : codeMode === 'never' ? false 
                        : isCodingTopic(rawText);

  const codeRule = willIncludeCode
    ? `For code scenes: include REAL working code with comments on EVERY line.`
    : `STRICT PROHIBITION: This is a non-programming topic. DO NOT generate ANY "code" scenes! Use only "explainer", "comparison", and "flowchart" scenes.`;

  return `You are an expert educational content creator, like NotebookLM, specializing in animated explainer videos for Shiksha Setu.

Your job is to READ the full INPUT TEXT thoroughly and convert it into a deeply rich, comprehensive educational video script that:
- Covers EVERY important term, concept, keyword, and idea from the input
- Defines EVERY technical term clearly (assume the viewer is a student encountering this for the first time)
- Uses real-world analogies and examples to explain abstract concepts
- Structures content progressively (simple → complex → application)

${getLanguagePromptDirectives(targetLanguage)}

OUTPUT RULES:
1. ONLY raw JSON. No markdown, no backticks, no explanation.
2. Escape ALL newlines inside strings as \\n
3. Escape ALL double-quotes inside strings as \\"

SCHEMA:
{
  "title": "Descriptive educational title (max 70 chars)",
  "language": "${targetLanguage}",
  "summary": "A 3-4 sentence overview of the entire topic covered in this script.",
  "keyTerms": ["Term1", "Term2", "Term3", "Term4", "Term5"],
  "scenes": [ ...scene objects... ]
}

SCENE TYPES — use the most appropriate type for each concept:

A) explainer — For concepts, definitions, properties:
{ "type": "explainer", "heading": "Concept Name", "bullets": ["Point 1 with detail", "Point 2 with detail", "Point 3 with detail", "Point 4 with detail", "Point 5 with detail"], "highlights": ["Key Term 1", "Key Term 2"], "text": "Detailed 5-6 sentence narration defining the concept, explaining WHY it matters, giving a real-world analogy, and connecting it to other concepts." }

B) comparison — For comparing two approaches, technologies, concepts:
{ "type": "comparison", "leftTitle": "Concept A", "leftPoints": ["Point 1", "Point 2", "Point 3", "Point 4"], "rightTitle": "Concept B", "rightPoints": ["Point 1", "Point 2", "Point 3", "Point 4"], "text": "Detailed 5-6 sentence narration explaining the differences, when to use each, trade-offs and practical implications." }

C) flowchart — For processes, algorithms, workflows:
{ "type": "flowchart", "steps": ["Step 1: Description", "Step 2: Description", "Step 3: Description", "Step 4: Description", "Step 5: Description"], "colors": ["#7c3aed", "#0ea5e9", "#10b981", "#ef4444", "#f59e0b"], "text": "Detailed 5-6 sentence narration walking through every step, explaining what happens at each stage and why." }

D) intro — For topic overviews and summaries:
{ "type": "intro", "text": "Engaging Title\\nDetailed 6-8 sentence introduction/summary covering the full scope of what's being taught, all major themes, and why this topic is important for students." }
${willIncludeCode ? `
E) code — For programming examples only:
{ "type": "code", "code": "# Detailed commented code showing the concept\\n# Each line commented\\ncode here", "text": "Detailed 5-6 sentence narration explaining what the code does line by line, what output it produces, and how it illustrates the concept." }
` : ''}

MANDATORY RULES — follow ALL of these:
1. MINIMUM 15 scenes. If the content is rich, generate 20-25 scenes. Cover EVERY sub-topic.
2. Every scene's "text" must be AT LEAST 4-6 sentences long — no one-liners.
3. For EVERY important term/keyword in the input: dedicate at least one bullet point or an entire scene to defining it.
4. "bullets" array must have 4-6 items per explainer scene — each bullet must be a complete thought (not just a word).
5. ${codeRule}
6. Scene order: intro → concept explainer → key terms → deep dive → comparisons → ${willIncludeCode ? 'code examples → ' : ''}flowcharts → advanced concepts → real-world applications → summary
7. The "summary" field in the root JSON must be a 3-4 sentence paragraph covering the entire topic.
8. The "keyTerms" array must list ALL important vocabulary/technical terms found in the input (minimum 8 terms).
9. Do NOT skip any section of the input text — convert EVERYTHING.
10. Text fields must use conversational, teaching-style language — like a professor explaining to students.

INPUT TEXT TO CONVERT:
"""${rawText}"""

JSON ONLY (no other text):`;
}

// =============================================================================
// Video Prompt Builder — Rich 3-5 min, covers ALL topics (12-18 scenes)
// =============================================================================
function buildVideoPrompt(rawText, targetLanguage, codeMode = 'auto') {
  const willIncludeCode = codeMode === 'always' ? true 
                        : codeMode === 'never' ? false 
                        : isCodingTopic(rawText);

  const codeRule = willIncludeCode
    ? `10. For code scenes: include REAL working code with a comment on EVERY significant line.`
    : `10. STRICT NO-CODE DIRECTIVE: This topic is NOT about computer programming. DO NOT CREATE ANY "code" SCENES! DO NOT simulate character decisions or theoretical topics with fake Python code. Use only "explainer", "comparison", and "flowchart" scenes.`;

  return `You are an expert educational video scriptwriter for Shiksha Setu.

GOAL: Create a COMPREHENSIVE, deeply educational animated video that is 3-5 minutes long.
- Cover ALL important terms, concepts, and topics from the input
- Each scene explains ONE concept clearly with enough depth that a student fully understands it
- Like a perfect college lecture — thorough, engaging, and well-paced
- The Indian AI avatar teacher will narrate each scene with an Indian English accent

${getLanguagePromptDirectives(targetLanguage)}

OUTPUT RULES:
1. ONLY raw JSON. No markdown, no backticks, no explanation.
2. Escape ALL newlines inside strings as \\n

SCHEMA:
{
  "title": "Clear descriptive title (max 65 chars)",
  "language": "English",
  "scenes": [ ...scene objects... ]
}

SCENE TYPES — pick the best fit for each concept:

A) intro — Opening hook + topic overview:
{ "type": "intro", "text": "Engaging Title\\n2-3 sentence opening that hooks the viewer, clearly introduces the core subject, and explains why this skill is vital for students." }

B) explainer — For concepts, definitions, properties:
{ "type": "explainer", "heading": "Concept Name", "bullets": ["Point 1 — clear definition and purpose", "Point 2 — practical mechanism with example", "Point 3 — best practice or common pitfall", "Point 4 — key takeaway for students"], "highlights": ["Key Term 1", "Key Term 2"], "text": "2-3 concise, impactful sentences defining the concept clearly, giving an intuitive real-world analogy, and explaining how it functions." }

C) comparison — For VS / trade-offs:
{ "type": "comparison", "leftTitle": "Concept A", "leftPoints": ["Point 1", "Point 2", "Point 3"], "rightTitle": "Concept B", "rightPoints": ["Point 1", "Point 2", "Point 3"], "text": "2-3 sentences explaining the key architectural differences, practical trade-offs, and when to use each in real projects." }

D) flowchart — For processes, algorithms, steps:
{ "type": "flowchart", "steps": ["Step 1: Initiation", "Step 2: Processing", "Step 3: Decision / Validation", "Step 4: Output / Resolution"], "colors": ["#134E3F","#0ea5e9","#10b981","#EA580C"], "text": "2-3 sentences walking through the execution path logically, explaining what happens at each stage." }
${willIncludeCode ? `
E) code — For programming examples only:
{ "type": "code", "code": "# Working code example\\n# Each key line explained\\nactual_code_here", "text": "2-3 sentences explaining the code syntax, execution flow, and expected output." }
` : ''}

MANDATORY RULES — follow ALL of these:
1. Generate EXACTLY 7-9 scenes for a balanced 3-5 minute video lesson.
2. Scene order: 1 intro hook → 5-7 core concept scenes (explainer/comparison/flowchart${willIncludeCode ? '/code' : ''}) covering ALL topics → 1 summary recap intro.
3. EVERY important term/keyword from the input MUST appear in at least one scene's bullets or heading.
4. "text" narration = 2-3 clear, articulate sentences per scene (~18-24 seconds per scene). Warm, encouraging Indian educator tone.
5. "bullets" = 3-4 items per explainer scene. Each bullet is a COMPLETE, self-contained educational thought.
6. Do NOT skip any topic from the input — summarize and explain all major concepts cleanly.
7. The last scene MUST be a summary "intro" type recapping all key learnings and encouraging the student.
8. Use warm, conversational teaching language — like an experienced Indian teacher explaining to students.
9. For flowchart steps: include clear, logical step descriptions.
${codeRule}

INPUT TEXT (cover ALL important concepts from this):
"""${rawText}"""

JSON ONLY:`;
}

// =============================================================================
// Generate endpoints
// =============================================================================
app.post('/generate', (req, res) => {
  const { raw_text, script_language, code_mode } = req.body;
  if (!raw_text?.trim() || raw_text.trim().length < 10)
    return res.status(400).json({ error: "'raw_text' must be >= 10 chars." });
  
  const jobId = uuidv4();
  runPipeline(jobId, raw_text.trim(), script_language || 'English', code_mode || 'auto').catch(console.error);
  return res.status(200).json({ success: true, jobId });
});

app.post('/generate-from-file', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file. Field: 'file'" });
  const uploadedPath = req.file.path;
  const script_language = req.body.script_language || 'English';
  const code_mode = req.body.code_mode || 'auto';
  console.log(`\nFile: ${req.file.originalname} | Target Language: ${script_language} | Code Mode: ${code_mode}`);
  try {
    const rawText = await extractText(uploadedPath, req.file.mimetype, req.file.originalname);
    if (rawText.trim().length < 20) return res.status(422).json({ error: 'Text too short.' });
    
    const jobId = uuidv4();
    runPipeline(jobId, rawText, script_language, code_mode).catch(console.error).finally(() => fs.unlink(uploadedPath).catch(()=>{}));
    
    return res.status(200).json({ success: true, jobId, sourceFile: req.file.originalname });
  } catch (err) {
    try { await fs.unlink(uploadedPath); } catch {}
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =============================================================================
// Script-Only (Summary) endpoints
// =============================================================================
app.post('/generate-script', async (req, res) => {
  const { raw_text, script_language, code_mode } = req.body;
  if (!raw_text?.trim() || raw_text.trim().length < 10)
    return res.status(400).json({ error: "'raw_text' must be >= 10 chars." });
  
  try {
    const prompt = buildScriptPrompt(raw_text.trim(), script_language || 'English', code_mode || 'auto');
    const script = await generateScriptWithRotation(prompt, () => {}, 'script-only');
    const markdown = scriptToMarkdown(script);
    
    // Save to Supabase
    const jobId = uuidv4();
    const supabasePath = `scripts/v3_${jobId}.md`;
    await supabase.storage.from(SUPABASE_BUCKET).upload(supabasePath, Buffer.from(markdown, 'utf-8'), { contentType: 'text/markdown', upsert: false });
    const { data: urlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(supabasePath);
    await supabase.from(SUPABASE_TABLE).insert({
      job_id: jobId, title: script.title, language: script.language,
      scene_count: script.scenes.length, script_json: script,
      video_url: urlData.publicUrl, storage_path: supabasePath,
      status: 'script_only', created_at: new Date().toISOString(),
    });
    
    return res.status(200).json({ success: true, markdown });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/generate-script-from-file', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file. Field: 'file'" });
  const uploadedPath = req.file.path;
  const script_language = req.body.script_language || 'English';
  const code_mode = req.body.code_mode || 'auto';
  try {
    const rawText = await extractText(uploadedPath, req.file.mimetype, req.file.originalname);
    if (rawText.trim().length < 20) return res.status(422).json({ error: 'Text too short.' });
    
    const prompt = buildScriptPrompt(rawText, script_language, code_mode);
    const script = await generateScriptWithRotation(prompt, () => {}, 'script-only');
    const markdown = scriptToMarkdown(script);
    
    // Save to Supabase
    const jobId = uuidv4();
    const supabasePath = `scripts/v3_${jobId}.md`;
    await supabase.storage.from(SUPABASE_BUCKET).upload(supabasePath, Buffer.from(markdown, 'utf-8'), { contentType: 'text/markdown', upsert: false });
    const { data: urlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(supabasePath);
    await supabase.from(SUPABASE_TABLE).insert({
      job_id: jobId, title: script.title, language: script.language,
      scene_count: script.scenes.length, script_json: script,
      video_url: urlData.publicUrl, storage_path: supabasePath,
      status: 'script_only', created_at: new Date().toISOString(),
    });
    
    await fs.unlink(uploadedPath).catch(()=>{});
    return res.status(200).json({ success: true, markdown });
  } catch (err) {
    try { await fs.unlink(uploadedPath); } catch {}
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =============================================================================
// scriptToMarkdown -- NotebookLM-style rich educational summary with Index
// =============================================================================
function scriptToMarkdown(script) {
  const lines = [];
  const now   = new Date().toLocaleDateString('en-IN', { dateStyle: 'long' });

  // ── Helper: get topic title for each scene ─────────────────────────────────
  function getTopicTitle(scene, idx) {
    if (scene.type === 'intro') {
      const first = (scene.text || '').split('\\n')[0] || (scene.text || '').split(/\\n/)[0] || '';
      return first.trim() || (idx === 0 ? 'Introduction' : 'Summary');
    }
    if (scene.type === 'explainer')  return scene.heading || 'Concept Explanation';
    if (scene.type === 'comparison') return `${scene.leftTitle || 'A'} vs ${scene.rightTitle || 'B'}`;
    if (scene.type === 'flowchart')  return scene.steps?.[0]?.replace(/^step \d+[:\s]*/i,'') ? `Process: ${(scene.steps[0]||'').replace(/^Step \d+[:\s]*/i,'')}` : 'Process Flow';
    if (scene.type === 'code')       return 'Code Example';
    return `Topic ${idx + 1}`;
  }

  // Pre-build topic titles list for index
  const topicTitles = script.scenes.map((s, i) => getTopicTitle(s, i));

  // ── Header ────────────────────────────────────────────────────────────────
  lines.push(`# 📚 ${script.title}`);
  lines.push(`> **Generated:** ${now} | **Topics:** ${script.scenes.length} | **Language:** ${script.language || 'General'} | *Shiksha Setu*`);
  lines.push('');

  // ── Topic Overview ─────────────────────────────────────────────────────────
  if (script.summary) {
    lines.push('## 🎯 Overview');
    lines.push('');
    lines.push(script.summary);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // ── 📋 INDEX / Table of Contents ──────────────────────────────────────────
  lines.push('## 📋 Index — Topics Covered');
  lines.push('');
  topicTitles.forEach((title, i) => {
    const icon = (() => {
      const t = script.scenes[i].type;
      if (t === 'intro')      return i === 0 ? '🚀' : '🏁';
      if (t === 'explainer')  return '📘';
      if (t === 'comparison') return '⚖️';
      if (t === 'flowchart')  return '🔄';
      if (t === 'code')       return '💻';
      return '📌';
    })();
    lines.push(`${i + 1}. ${icon} **${title}**`);
  });
  lines.push('');
  lines.push('---');
  lines.push('');

  // ── Key Terms Glossary ─────────────────────────────────────────────────────
  if (script.keyTerms?.length) {
    lines.push('## 🔑 Key Terms & Vocabulary');
    lines.push('');
    script.keyTerms.forEach(term => lines.push(`- **${term}**`));
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // ── Topic-by-Topic Content ─────────────────────────────────────────────────
  lines.push('## 📖 Detailed Topic Breakdown');
  lines.push('');

  script.scenes.forEach((scene, idx) => {
    const n = idx + 1;
    const topicLabel = `Topic ${n}`;
    const topicTitle = topicTitles[idx];

    if (scene.type === 'intro') {
      const parts = (scene.text || '').split(/\\n|\\\\n/);
      lines.push(`### ${topicLabel}: ${topicTitle}`);
      lines.push('');
      const body = parts.slice(1).join(' ').trim();
      if (body) lines.push(body);
      else if (scene.text) lines.push(scene.text.replace(/\\\\n/g, ' ').replace(/\\n/g, ' '));
      lines.push('');

    } else if (scene.type === 'explainer') {
      lines.push(`### ${topicLabel}: ${topicTitle}`);
      lines.push('');
      if (scene.bullets?.length) {
        scene.bullets.forEach(b => lines.push(`- ${b}`));
        lines.push('');
      }
      if (scene.text) {
        lines.push('**📢 Explanation:**');
        lines.push('');
        lines.push('> ' + scene.text.replace(/\\\\n/g, ' ').replace(/\\n/g, ' '));
        lines.push('');
      }
      if (scene.highlights?.length) {
        lines.push(`**🏷️ Key Terms:** ${scene.highlights.map(h => `\`${h}\``).join(' · ')}`);
        lines.push('');
      }

    } else if (scene.type === 'comparison') {
      lines.push(`### ${topicLabel}: ${topicTitle}`);
      lines.push('');
      const leftPts  = scene.leftPoints  || [];
      const rightPts = scene.rightPoints || [];
      const maxRows  = Math.max(leftPts.length, rightPts.length);
      lines.push(`| **${scene.leftTitle || 'Option A'}** | **${scene.rightTitle || 'Option B'}** |`);
      lines.push('|---|---|');
      for (let i = 0; i < maxRows; i++) {
        lines.push(`| ${leftPts[i] || ''} | ${rightPts[i] || ''} |`);
      }
      lines.push('');
      if (scene.text) {
        lines.push('**📢 Explanation:**');
        lines.push('');
        lines.push('> ' + scene.text.replace(/\\\\n/g, ' ').replace(/\\n/g, ' '));
        lines.push('');
      }

    } else if (scene.type === 'flowchart') {
      lines.push(`### ${topicLabel}: ${topicTitle}`);
      lines.push('');
      if (scene.steps?.length) {
        scene.steps.forEach((step, i) => lines.push(`${i + 1}. **${step}**`));
        lines.push('');
      }
      if (scene.text) {
        lines.push('**📢 Explanation:**');
        lines.push('');
        lines.push('> ' + scene.text.replace(/\\\\n/g, ' ').replace(/\\n/g, ' '));
        lines.push('');
      }

    } else if (scene.type === 'code') {
      lines.push(`### ${topicLabel}: ${topicTitle}`);
      lines.push('');
      if (scene.code) {
        const lang = (script.language || 'python').toLowerCase().replace('c++', 'cpp').replace('c#', 'csharp');
        lines.push('```' + lang);
        lines.push(scene.code.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n'));
        lines.push('```');
        lines.push('');
      }
      if (scene.text) {
        lines.push('**📢 Explanation:**');
        lines.push('');
        lines.push('> ' + scene.text.replace(/\\\\n/g, ' ').replace(/\\n/g, ' '));
        lines.push('');
      }
    }

    lines.push('---');
    lines.push('');
  });

  lines.push(`*📅 Generated on ${now} by Shiksha Setu — Powered by NotebookLM-style deep educational scripting*`);
  return lines.join('\n');
}

app.get('/script/:jobId/markdown', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE).select('*').eq('job_id', req.params.jobId).single();
    if (error || !data) return res.status(404).json({ error: 'Job not found' });
    const script = data.script_json;
    const md     = scriptToMarkdown(script);
    const fname  = (script.title || 'script').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fname}.md"`);
    return res.send(md);
  } catch(err) { return res.status(500).json({ error: err.message }); }
});

// =============================================================================
// extractJSON -- Robust Gemini response cleaner
// =============================================================================
function extractJSON(raw) {
  let text = raw
    .replace(/^\uFEFF/, '')
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```\s*$/m, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim();

  try { return JSON.parse(text); } catch (_) {}

  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch (_) {}
  }

  const cleaned = text.replace(/,\s*([}\]])/g, '$1');
  try { return JSON.parse(cleaned); } catch (_) {}

  const s2 = cleaned.indexOf('{');
  const e2 = cleaned.lastIndexOf('}');
  if (s2 !== -1 && e2 !== -1 && e2 > s2) {
    return JSON.parse(cleaned.slice(s2, e2 + 1));
  }

  throw new Error('Could not extract valid JSON from Gemini response');
}

// =============================================================================
// generateSubtitleWords -- Create word-level subtitle timing from text
// Calculates when each word should appear based on audio duration (FPS=30)
// =============================================================================
function generateSubtitleWords(text, audioDurationSec, fps = 30) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const totalFrames  = Math.round(audioDurationSec * fps);
  const framesPerWord = totalFrames / words.length;
  return words.map((word, i) => ({
    word,
    startFrame: Math.round(i * framesPerWord),
    endFrame:   Math.round((i + 1) * framesPerWord),
  }));
}

// Get audio duration in seconds using ffprobe if available, else estimate by word count
async function getAudioDuration(audioPath, text) {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v quiet -print_format json -show_streams "${audioPath}"`,
      { timeout: 10000 }
    );
    const info = JSON.parse(stdout);
    const dur  = parseFloat(info?.streams?.[0]?.duration ?? 0);
    if (dur > 0) return dur;
    throw new Error('Invalid duration from ffprobe');
  } catch {
    // ffprobe not available -- estimate from word count (~2.5 words / sec)
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return Math.max((wordCount / 2.5), 3); // minimum 3 seconds
  }
}

// =============================================================================
// runPipeline -- 5-Phase AI Avatar Pipeline
// =============================================================================
async function runPipeline(jobId, rawText, targetLanguage = 'English', codeMode = 'auto') {
  const phase     = { current: 'init' };
  const tempFiles = [];

  console.log(`\n${'='.repeat(60)}\nV2 Avatar Job: ${jobId} | Target Language: ${targetLanguage} | Code Mode: ${codeMode}\n${'='.repeat(60)}`);
  emitProgress(jobId, 2, 'init', `Job started... Target language: ${targetLanguage}`);

  try {
    // PHASE 1 -- Fast video script (max 8 scenes, short narration)
    phase.current = 'gemini';
    console.log('\n[1/5] LLM -- generating video script...');
    emitProgress(jobId, 5, 'gemini', `AI writing video script in ${targetLanguage}...`);
    
    const prompt = buildVideoPrompt(rawText, targetLanguage, codeMode);

    let script;
    try {
      script = await generateScriptWithRotation(prompt, emitProgress, jobId);
    } catch(err) {
      throw Object.assign(new Error(`LLM failed: ${err.message}`), { phase: 'gemini' });
    }
    
    // Sanitize code scenes if code should not be included
    const shouldHaveCode = codeMode === 'always' ? true
                         : codeMode === 'never' ? false
                         : isCodingTopic(rawText);

    if (!shouldHaveCode) {
      for (let i = 0; i < script.scenes.length; i++) {
        const s = script.scenes[i];
        if (s.type === 'code') {
          console.log(`   [Sanitizer] Converted unwarranted code scene ${i} to explainer scene`);
          s.type = 'explainer';
          s.heading = s.heading || 'Core Concept Analysis';
          s.bullets = [
            s.text?.slice(0, 90) || 'Detailed exploration of the foundational concept.',
            'Underlying mechanisms, operational rules, and significance.',
            'Practical takeaways and critical principles for students.'
          ];
          s.highlights = ['Analysis', 'Key Insights'];
          delete s.code;
        }
      }
    }
    
    console.log(`   Script: "${script.title}" | ${script.scenes.length} scenes | ${script.language}`);
    emitProgress(jobId, 20, 'gemini', `Script ready: ${script.scenes.length} scenes generated`);

    // Inject video INDEX scene as scene[1] automatically
    // Builds the table of contents from the AI-generated scenes
    const topicList = script.scenes.slice(1).map((s, i) => {
      let label = '';
      if (s.type === 'intro')      label = (s.text || '').split('\\n')[0].slice(0, 60) || `Introduction ${i + 1}`;
      else if (s.type === 'explainer')  label = (s.heading || 'Concept').slice(0, 60);
      else if (s.type === 'comparison') label = `${s.leftTitle || 'A'} vs ${s.rightTitle || 'B'}`.slice(0, 60);
      else if (s.type === 'flowchart')  label = (s.steps?.[0] || 'Process').replace(/^Step \d+[:\s]*/i, '').slice(0, 60);
      else if (s.type === 'code')       label = 'Code Example';
      else label = `Topic ${i + 1}`;
      return { label, type: s.type };
    });
    const indexScene = {
      type: 'index',
      title: 'Topics in This Video',
      topics: topicList,
      text: `In this video, we will cover ${topicList.length} topics including ${topicList.slice(0, 3).map(t => t.label).join(', ')} and more. Let us begin.`,
    };
    // Insert after the first scene (intro)
    script.scenes.splice(1, 0, indexScene);
    console.log(`   Injected index scene. Total: ${script.scenes.length} scenes`);
    emitProgress(jobId, 21, 'gemini', `Video index scene added (${topicList.length} topics)`);

    phase.current = 'voice';
    console.log('\n[2/5] AI Voice + subtitle timing...');
    emitProgress(jobId, 22, 'voice', 'Starting AI voice generation...');
    const audioFiles = [];
    const totalScenes = script.scenes.length;
    let voiceDone = 0;
    for (let i = 0; i < script.scenes.length; i++) {
      const scene = script.scenes[i];
      const voiceText = scene.text || scene.heading || scene.steps?.join('. ') || 'Scene ' + (i + 1);
      if (!voiceText?.trim()) { voiceDone++; continue; }
      const audioPath = path.join(AUDIO_DIR, `${jobId}_scene_${i}.mp3`);
      tempFiles.push(audioPath);
      try {
        const { engine } = await generateSpeech(voiceText, audioPath, targetLanguage);
        const durationSec = await getAudioDuration(audioPath, voiceText);
        const subtitleWords = generateSubtitleWords(voiceText, durationSec);
        audioFiles.push({ sceneIndex: i, path: audioPath, engine, durationSec, subtitleWords });
        voiceDone++;
        const voicePct = 22 + (voiceDone / totalScenes) * 18;
        emitProgress(jobId, voicePct, 'voice', `Voice: scene ${voiceDone}/${totalScenes} done [${engine}]`);
        console.log(`   Scene ${i} [${scene.type}] -> [${engine}] ${durationSec?.toFixed(1)}s ${subtitleWords.length} words`);
      } catch(e) { console.warn(`   Voice skipped scene ${i}: ${e.message}`); voiceDone++; }
    }
    emitProgress(jobId, 40, 'voice', `Voice complete: ${audioFiles.length} audio files`);
    console.log(`   Voice: ${audioFiles.length} audio files`);

    // PHASE 3 -- Avatar generation
    phase.current = 'avatar';
    console.log('\n[3/5] Avatar generation...');
    emitProgress(jobId, 42, 'avatar', 'Starting avatar generation...');
    const avatarResults = [];
    const disabledAvatarEngines = new Set();
    for (let ai = 0; ai < audioFiles.length; ai++) {
      const af = audioFiles[ai];
      const avatarVideoPath = path.join(AUDIO_DIR, `${jobId}_avatar_${af.sceneIndex}.mp4`);
      tempFiles.push(avatarVideoPath);
      const result = await generateAvatar(af.path, avatarVideoPath, disabledAvatarEngines);
      avatarResults.push({ ...af, avatarPath: result.path, avatarEngine: result.engine });
      const avatarPct = 42 + ((ai + 1) / audioFiles.length) * 13;
      emitProgress(jobId, avatarPct, 'avatar', `Avatar: scene ${ai + 1}/${audioFiles.length} [${result.engine}]`);
      console.log(`   Scene ${af.sceneIndex} avatar -> [${result.engine}]`);
    }
    emitProgress(jobId, 55, 'avatar', `Avatar complete: ${avatarResults[0]?.avatarEngine ?? 'Remotion-Avatar'}`);

    // PHASE 4 -- Remotion render with enriched props
    phase.current = 'render';
    console.log('\n[4/5] Remotion render...');
    emitProgress(jobId, 57, 'render', 'Preparing scene data for render...');
    const jobScriptPath   = path.join(__dirname, `temp_v2_${jobId}.json`);
    const outputVideoPath = path.join(VIDEO_DIR, `${jobId}.mp4`);
    tempFiles.push(jobScriptPath, outputVideoPath);

    // Copy audio files to Remotion's public/audio folder so they're accessible during render
    const remotionPublicAudio = path.join(REMOTION_ROOT, 'public', 'audio');
    await fs.mkdir(remotionPublicAudio, { recursive: true });

    const remotionAudioFiles = [];
    for (const [idx, af] of audioFiles.entries()) {
      const audioFilename = `${jobId}_scene_${af.sceneIndex ?? idx}.mp3`;
      const destPath = path.join(remotionPublicAudio, audioFilename);
      await fs.copyFile(af.path, destPath);
      tempFiles.push(destPath);   // clean up after render

      // Check if avatar video was generated for this scene
      const matchingAvatar = avatarResults.find(ar => ar.sceneIndex === (af.sceneIndex ?? idx));
      let avatarRelPath = null;
      if (matchingAvatar?.avatarPath && existsSync(matchingAvatar.avatarPath)) {
        const avatarFilename = `${jobId}_avatar_${af.sceneIndex ?? idx}.mp4`;
        const avatarDestPath = path.join(remotionPublicAudio, avatarFilename);
        await fs.copyFile(matchingAvatar.avatarPath, avatarDestPath);
        tempFiles.push(avatarDestPath);
        avatarRelPath = `/audio/${avatarFilename}`;
      }

      remotionAudioFiles.push({
        sceneIndex:      af.sceneIndex ?? idx,
        path:            `/audio/${audioFilename}`,  // Remotion's staticFile path (relative to public/)
        durationSec:     af.durationSec ?? 10,
        subtitleWords:   af.subtitleWords ?? [],
        avatarVideoPath: avatarRelPath,
      });
    }

    // Root.jsx V3VideoEngine expects: { script: { scenes, language, ... }, audioFiles: [...], avatarEngine }
    const remotionProps = {
      script: { ...script },
      audioFiles: remotionAudioFiles,
      avatarEngine: avatarResults[0]?.avatarEngine ?? 'Remotion-Avatar',
    };
    await fs.writeFile(jobScriptPath, JSON.stringify(remotionProps, null, 2), 'utf8');

    emitProgress(jobId, 60, 'render', `Rendering ${script.scenes.length} scenes via Remotion...`);
    const propsArg  = jobScriptPath.replace(/\\/g, '/');
    const outputArg = outputVideoPath.replace(/\\/g, '/');
    const remotionBin = process.platform === 'win32'
      ? `"${path.join(REMOTION_ROOT, 'node_modules', '.bin', 'remotion.cmd')}"`
      : 'npx remotion';
    const renderCmd = `${remotionBin} render src/Root.jsx ShikshaSetu-Avatar "${outputArg}" --props="${propsArg}" --concurrency=8 --gl=angle --jpeg-quality=95 --log=verbose`;
    console.log(`   ${renderCmd}`);

    // Stream render progress by parsing Remotion output and capturing errors
    let remotionStderr = '';
    let remotionStdout = '';
    const renderProc = exec(renderCmd, { cwd: REMOTION_ROOT, maxBuffer: 100*1024*1024 });
    await new Promise((resolve, reject) => {
      renderProc.stdout?.on('data', (data) => {
        const s = data.toString();
        remotionStdout += s;
        const m = s.match(/Rendered (\d+)\/(\d+)/);
        if (m) {
          const done = parseInt(m[1]), total = parseInt(m[2]);
          const renderPct = 60 + (done / total) * 25;
          emitProgress(jobId, renderPct, 'render', `Rendering frame ${done}/${total} (${Math.round(done/total*100)}%)`);
        }
      });
      renderProc.stderr?.on('data', (data) => {
        const s = data.toString();
        remotionStderr += s;
        console.error(`   [Remotion stderr] ${s.trim()}`);
      });
      renderProc.on('close', code => {
        if (code === 0) {
          resolve();
        } else {
          const errMsg = remotionStderr.trim() || remotionStdout.slice(-600).trim() || `Exit code ${code}`;
          reject(new Error(`Remotion render failed (code ${code}): ${errMsg}`));
        }
      });
      renderProc.on('error', (err) => {
        reject(new Error(`Failed to execute Remotion process: ${err.message}`));
      });
    });
    emitProgress(jobId, 85, 'render', 'Render complete!');
    console.log(`   Rendered: ${path.basename(outputVideoPath)}`);

    // PHASE 5 -- Compress + Supabase upload
    phase.current = 'upload';
    console.log('\n[5/5] Compressing + Supabase upload...');
    emitProgress(jobId, 85, 'upload', 'Optimizing video for crisp HD playback...');

    // Compress with ffmpeg: CRF 20, 720p max, pristine broadcast clarity
    const compressedPath = outputVideoPath.replace('.mp4', '_compressed.mp4');
    let uploadPath = outputVideoPath;
    try {
      const ffmpegCmd = `ffmpeg -y -i "${outputVideoPath}" -vf "scale=trunc(min(iw\\,1280)/2)*2:trunc(min(ih\\,720)/2)*2" -c:v libx264 -crf 20 -preset medium -c:a aac -b:a 192k -movflags +faststart "${compressedPath}"`;
      await execAsync(ffmpegCmd, { timeout: 300_000 });
      const origSize = (await fs.stat(outputVideoPath)).size;
      const compSize = (await fs.stat(compressedPath)).size;
      console.log(`   Optimized: ${(origSize/1024/1024).toFixed(1)} MB → ${(compSize/1024/1024).toFixed(1)} MB (CRF 20, 192k AAC)`);
      uploadPath = compressedPath;
      tempFiles.push(compressedPath);
    } catch (ffmpegErr) {
      console.warn(`   ⚠️ Compression failed (${ffmpegErr.message}), uploading original...`);
      uploadPath = outputVideoPath;
    }

    const supabasePath = `videos/v2_${jobId}.mp4`;
    const videoBuffer  = await fs.readFile(uploadPath);
    const sizeMB = (videoBuffer.length / 1024 / 1024).toFixed(1);
    emitProgress(jobId, 90, 'upload', `Uploading to Supabase (${sizeMB} MB)...`);
    const { error: uploadErr } = await supabase.storage.from(SUPABASE_BUCKET)
      .upload(supabasePath, videoBuffer, { contentType: 'video/mp4', upsert: false });
    if (uploadErr) throw Object.assign(new Error(`Upload: ${uploadErr.message}`), { phase: 'upload' });
    emitProgress(jobId, 96, 'upload', 'Upload done! Saving to database...');

    const { data: urlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(supabasePath);
    const publicUrl = urlData.publicUrl;
    console.log(`   URL: ${publicUrl}`);

    await supabase.from(SUPABASE_TABLE).insert({
      job_id: jobId, title: script.title, language: script.language,
      scene_count: script.scenes.length, script_json: script,
      video_url: publicUrl, storage_path: supabasePath,
      status: 'completed', created_at: new Date().toISOString(),
    });

    console.log(`\nV2 Job ${jobId} complete! ${script.scenes.length} scenes`);
    emitProgress(jobId, 100, 'done', 'Video ready! Redirecting...');
    // Clean up SSE after 30s
    setTimeout(() => { jobProgress.delete(jobId); sseClients.delete(jobId); }, 30000);

    return {
      success: true, jobId, videoUrl: publicUrl,
      title: script.title, language: script.language,
      sceneCount: script.scenes.length,
      audioCount: audioFiles.length,
      avatarEngine: avatarResults[0]?.avatarEngine ?? 'Remotion-Avatar',
      version: 'v2-avatar', timestamp: new Date().toISOString(),
    };

  } catch(err) {
    err.phase = err.phase ?? phase.current;
    console.error(`\nV2 FAILED [${err.phase}]: ${err.message}`);
    emitProgress(jobId, phase.current === 'init' ? 0 : 50, err.phase, `Error: ${err.message}`, true);
    throw err;
  } finally {
    for (const f of tempFiles) { try { await fs.unlink(f); } catch {} }
  }
}

// =============================================================================
// generateAvatar -- D-ID (Indian Presenter) -> HeyGen -> Replicate -> SadTalker -> Remotion fallback
// Uses circuit breaker to instantly bypass broken cloud engines for subsequent scenes
// =============================================================================
async function generateAvatar(audioPath, outputPath, disabledEngines = new Set()) {
  if (DID_API_KEY && !disabledEngines.has('did')) {
    try {
      console.log('   👤  Generating Indian video avatar via D-ID...');
      await generateWithDID(audioPath, outputPath);
      return { path: outputPath, engine: 'D-ID (Indian Educator)' };
    } catch(e) {
      console.warn(`   D-ID failed: ${e.message.slice(0, 80)} — bypassing for rest of job`);
      disabledEngines.add('did');
    }
  }
  if (HEYGEN_API_KEY && !disabledEngines.has('heygen')) {
    try {
      console.log('   👤  Trying HeyGen video avatar...');
      await generateWithHeyGen(audioPath, outputPath);
      return { path: outputPath, engine: 'HeyGen' };
    } catch(e) {
      console.warn(`   HeyGen failed: ${e.message.slice(0, 80)} — bypassing for rest of job`);
      disabledEngines.add('heygen');
    }
  }
  if (REPLICATE_API_TOKEN && !disabledEngines.has('replicate')) {
    try {
      console.log('   👤  Trying Replicate talking head avatar...');
      await generateWithReplicate(audioPath, outputPath);
      return { path: outputPath, engine: 'Replicate (Talking Head)' };
    } catch(e) {
      console.warn(`   Replicate failed: ${e.message.slice(0, 80)} — bypassing for rest of job`);
      disabledEngines.add('replicate');
    }
  }
  if (HF_API_KEY && !disabledEngines.has('sadtalker')) {
    try {
      await generateWithSadTalker(audioPath, outputPath);
      return { path: outputPath, engine: 'SadTalker' };
    } catch(e) {
      console.warn(`   SadTalker failed: ${e.message.slice(0, 80)} — bypassing for rest of job`);
      disabledEngines.add('sadtalker');
    }
  }
  return { path: null, engine: 'Remotion-Avatar' };
}

async function generateWithDID(audioPath, outputPath) {
  const audioBase64 = (await fs.readFile(audioPath)).toString('base64');
  const createRes = await fetch('https://api.d-id.com/talks', {
    method: 'POST',
    headers: { 'Authorization': `Basic ${DID_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_url: INDIAN_AVATAR_IMAGE,
      script: { type: 'audio', audio_url: `data:audio/mpeg;base64,${audioBase64}` },
      config: { stitch: true },
    }),
  });
  if (!createRes.ok) {
    const errText = await createRes.text().catch(() => '');
    throw new Error(`D-ID HTTP ${createRes.status}: ${errText}`);
  }
  const { id } = await createRes.json();
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 4000));
    const s = await (await fetch(`https://api.d-id.com/talks/${id}`, { headers: { 'Authorization': `Basic ${DID_API_KEY}` } })).json();
    if (s.status === 'done' && s.result_url) {
      const vidRes = await fetch(s.result_url);
      await fs.writeFile(outputPath, Buffer.from(await vidRes.arrayBuffer()));
      return;
    }
    if (s.status === 'error') throw new Error(`D-ID: ${s.error?.description || JSON.stringify(s.error)}`);
  }
  throw new Error('D-ID timeout');
}

async function generateWithHeyGen(audioPath, outputPath) {
  const res = await fetch('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: {
      'X-Api-Key': HEYGEN_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      video_inputs: [{
        character: { type: 'avatar', avatar_id: 'default' },
        voice: { type: 'audio', audio_url: `data:audio/mpeg;base64,${(await fs.readFile(audioPath)).toString('base64')}` }
      }],
      dimension: { width: 1280, height: 720 }
    }),
  });
  if (!res.ok) throw new Error(`HeyGen HTTP ${res.status}`);
  const { data } = await res.json();
  const videoId = data?.video_id;
  if (!videoId) throw new Error('No video_id returned by HeyGen');

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const statusRes = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      headers: { 'X-Api-Key': HEYGEN_API_KEY }
    });
    const sData = await statusRes.json();
    if (sData?.data?.status === 'completed' && sData.data.video_url) {
      const vidRes = await fetch(sData.data.video_url);
      await fs.writeFile(outputPath, Buffer.from(await vidRes.arrayBuffer()));
      return;
    }
    if (sData?.data?.status === 'failed') throw new Error(`HeyGen error: ${sData.data.error}`);
  }
  throw new Error('HeyGen timeout');
}

async function generateWithReplicate(audioPath, outputPath) {
  const audioBase64 = (await fs.readFile(audioPath)).toString('base64');
  const audioDataUri = `data:audio/mpeg;base64,${audioBase64}`;

  const startRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'a519cc0cf43a85234d17a73123fa33a857e384501a81452296d36e8f44ff53e7',
      input: {
        source_image: INDIAN_AVATAR_IMAGE,
        driven_audio: audioDataUri,
        still: true,
      },
    }),
  });
  if (!startRes.ok) throw new Error(`Replicate HTTP ${startRes.status}`);
  let pred = await startRes.json();
  const getUrl = pred.urls?.get;
  if (!getUrl) throw new Error('No polling URL from Replicate');

  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 4000));
    const pollRes = await fetch(getUrl, {
      headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}` },
    });
    pred = await pollRes.json();
    if (pred.status === 'succeeded' && pred.output) {
      const vidRes = await fetch(pred.output);
      await fs.writeFile(outputPath, Buffer.from(await vidRes.arrayBuffer()));
      return;
    }
    if (pred.status === 'failed' || pred.status === 'canceled') {
      throw new Error(`Replicate ${pred.status}: ${pred.error || 'Failed'}`);
    }
  }
  throw new Error('Replicate timeout');
}

async function generateWithSadTalker(audioPath, outputPath) {
  const res = await fetch('https://api-inference.huggingface.co/models/vinthony/SadTalker', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${HF_API_KEY}`, 'Content-Type': 'application/octet-stream' },
    body: await fs.readFile(audioPath),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw new Error(`SadTalker HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error('Empty response');
  await fs.writeFile(outputPath, buf);
}

// =============================================================================
// validateScript
// =============================================================================
function validateScript(script) {
  if (!script?.title?.trim()) throw new Error("'title' required");
  if (typeof script.duration !== 'number') throw new Error("'duration' must be number");
  if (!['Python','C++'].includes(script.language)) throw new Error("'language' must be Python or C++");
  if (!Array.isArray(script.scenes) || script.scenes.length < 2) throw new Error("Need >= 2 scenes");
  for (let i = 0; i < script.scenes.length; i++) {
    const s = script.scenes[i];
    if (!ALLOWED_SCENE_TYPES.has(s.type)) throw new Error(`scenes[${i}].type invalid: '${s.type}'`);
    if (s.type === 'intro'  && !s.text?.trim()) throw new Error(`scenes[${i}] intro needs text`);
    if (s.type === 'code'   && !s.code?.trim()) throw new Error(`scenes[${i}] code needs code`);
    if (s.type === 'visual' && !ALLOWED_VISUAL_ANIMATIONS.has(s.animation))
      throw new Error(`scenes[${i}] animation must be forLoopIterator|whileCounter, got '${s.animation}'`);
  }
}

// =============================================================================
// Jobs endpoints
// =============================================================================
app.get('/jobs/:jobId', async (req, res) => {
  const { data, error } = await supabase.from(SUPABASE_TABLE).select('*').eq('job_id', req.params.jobId).single();
  if (error || !data) return res.status(404).json({ error: 'Not found' });
  return res.json({ success: true, job: data });
});

app.get('/jobs', async (_req, res) => {
  const { data, error } = await supabase.from(SUPABASE_TABLE)
    .select('job_id,title,language,scene_count,video_url,created_at,status')
    .order('created_at', { ascending: false }).limit(50);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, count: data.length, jobs: data });
});

// =============================================================================
// STUDY TOOLS — Flashcards & Worksheets AI Engine (Appended from Proxy)
// =============================================================================
function getStudyToolLanguageGuidance(language = 'English') {
  const lang = (language || 'English').trim();
  if (/santhali|santali/i.test(lang)) {
    return `
CRITICAL LANGUAGE & CULTURAL DIRECTIVE — SANTHALI (ᱥᱟᱱᱛᱟᱲᱤ / संथाली):
- You MUST write ALL questions, answers, options, definitions, titles, and explanations STRICTLY in Santhali.
- Use Santhali in Ol Chiki script (ᱥᱟᱱᱛᱟᱲᱤ) or Devanagari transliteration (संथाली).
- DO NOT default to English or Hindi! Every single card front, card back, and worksheet question must be in Santhali.
- Include the traditional Santhali greeting: "Johar!" (ᱡᱚᱦᱟᱨ / जोहार).
- Only technical programming identifiers/code (like 'for', 'while', 'print', 'x = 5') may remain in Latin code syntax.`;
  }
  if (/^ho$/i.test(lang)) {
    return `
CRITICAL LANGUAGE & CULTURAL DIRECTIVE — HO (हो / ᱦᱳ):
- You MUST write ALL questions, answers, options, definitions, titles, and explanations STRICTLY in Ho language (using Devanagari script or Varang Kshiti).
- DO NOT write explanations in English. Every single card front, card back, and worksheet question must be in pure Ho.
- Include the traditional Ho greeting: "Johar!" (जोहार).
- Only technical programming identifiers/code (like 'for', 'while', 'print', 'x = 5') may remain in Latin code syntax.`;
  }
  if (/mundari/i.test(lang)) {
    return `
CRITICAL LANGUAGE & CULTURAL DIRECTIVE — MUNDARI (मुंडारी / ᱢᱩᱱᱰᱟᱨᱤ):
- You MUST write ALL questions, answers, options, definitions, titles, and explanations STRICTLY in Mundari language (using Devanagari script or Mundari Bani).
- DO NOT write explanations in English. Every single card front, card back, and worksheet question must be in pure Mundari.
- Include the traditional Mundari greeting: "Johar!" (जोहार).
- Only technical programming identifiers/code (like 'for', 'while', 'print', 'x = 5') may remain in Latin code syntax.`;
  }
  if (/hinglish/i.test(lang)) {
    return `
CRITICAL LANGUAGE DIRECTIVE — HINGLISH:
- Write ALL questions, explanations, and instructions in natural conversational Hinglish (Hindi written using Latin Roman script, e.g., "Yeh concept samjho...").`;
  }
  if (/hindi/i.test(lang)) {
    return `
CRITICAL LANGUAGE DIRECTIVE — HINDI (हिंदी):
- Write ALL questions, options, answers, and instructions in pure Hindi using Devanagari script.`;
  }
  return `
CRITICAL LANGUAGE DIRECTIVE:
- Write ALL content strictly in ${lang}. Use the authentic script of ${lang}.`;
}

function buildFlashcardPrompt(rawText, language = 'English') {
  const langGuidance = getStudyToolLanguageGuidance(language);
  return `You are an expert educator. From the provided study material, create a comprehensive set of FLASHCARDS.

TARGET LANGUAGE: ${language}
${langGuidance}

Generate 15-25 flashcards covering ALL important concepts, terms, definitions, and key facts.

Output ONLY valid JSON in this exact structure:
{
  "title": "Topic name (in ${language})",
  "language": "${language}",
  "total": 15,
  "cards": [
    {
      "id": 1,
      "front": "Question or term in ${language} (concise, clear)",
      "back": "Answer or definition in ${language} (detailed, informative, 2-4 sentences)",
      "category": "Definition | Concept | Formula | Example | Comparison",
      "difficulty": "Easy | Medium | Hard"
    }
  ]
}

RULES:
1. Front = clear question or term to recall in ${language}.
2. Back = complete, informative answer in ${language} (not just 1 word).
3. Cover every major concept from the input.
4. Mix different difficulty levels.
5. Categories help students identify what type of knowledge is being tested.
6. The entire card content must be in ${language}.

INPUT TEXT:
"""${rawText.slice(0, 15000)}"""

JSON ONLY:`;
}

function buildWorksheetPrompt(rawText, language = 'English') {
  const langGuidance = getStudyToolLanguageGuidance(language);
  return `You are an expert educator. From the provided study material, create a comprehensive WORKSHEET for students.

TARGET LANGUAGE: ${language}
${langGuidance}

Output ONLY valid JSON:
{
  "title": "Worksheet title (in ${language})",
  "subject": "Subject/topic name (in ${language})",
  "language": "${language}",
  "instructions": "General instructions for the student (in ${language})",
  "sections": [
    {
      "type": "mcq",
      "title": "Section A: Multiple Choice Questions (in ${language})",
      "questions": [
        {
          "id": 1,
          "question": "Question text in ${language}",
          "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
          "answer": "A"
        }
      ]
    },
    {
      "type": "fill_blank",
      "title": "Section B: Fill in the Blanks (in ${language})",
      "questions": [
        { "id": 1, "question": "Question with blank in ${language}", "answer": "correct word in ${language}" }
      ]
    },
    {
      "type": "short_answer",
      "title": "Section C: Short Answer Questions (in ${language})",
      "questions": [
        { "id": 1, "question": "Explain in 2-3 lines in ${language}...", "answer": "Model answer in ${language}..." }
      ]
    },
    {
      "type": "true_false",
      "title": "Section D: True or False (in ${language})",
      "questions": [
        { "id": 1, "question": "Statement here in ${language}.", "answer": "True" }
      ]
    },
    {
      "type": "long_answer",
      "title": "Section E: Long Answer Questions (in ${language})",
      "questions": [
        { "id": 1, "question": "Describe in detail in ${language}...", "answer": "Detailed model answer in ${language}..." }
      ]
    }
  ]
}

RULES:
1. MCQ section: Minimum 8-10 questions.
2. Fill in the blank: Minimum 6-8 questions.
3. Short answer: Minimum 5 questions.
4. True/False: Minimum 6-8 questions.
5. Long answer: Minimum 2-3 questions.
6. Questions must cover ALL major topics from the input.
7. Include model answers for everything.
8. Every question, option, and answer MUST BE STRICTLY in ${language}.

INPUT TEXT:
"""${rawText.slice(0, 15000)}"""

JSON ONLY:`;
}

// Flashcards from raw text
app.post('/flashcards', async (req, res) => {
  const { raw_text, language = 'English' } = req.body;
  if (!raw_text?.trim() || raw_text.trim().length < 20)
    return res.status(400).json({ error: 'raw_text must be at least 20 characters.' });
  try {
    const prompt = buildFlashcardPrompt(raw_text.trim(), language);
    const rawOut = await callRawAIRotation(prompt);
    const flashcards = extractJson(rawOut);
    const id = uuidv4();
    try { await supabase.from('study_tools').insert({ tool_id: id, type: 'flashcard', title: flashcards.title, language, data: flashcards, created_at: new Date().toISOString() }); } catch(_) {}
    return res.json({ success: true, id, flashcards });
  } catch(e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Flashcards from file upload
app.post('/flashcards-from-file', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  const language = req.body.language || 'English';
  try {
    const rawText = await extractText(req.file.path, req.file.mimetype, req.file.originalname);
    await fs.unlink(req.file.path).catch(() => {});
    if (rawText.trim().length < 20) return res.status(422).json({ error: 'Text too short.' });
    const prompt = buildFlashcardPrompt(rawText, language);
    const rawOut = await callRawAIRotation(prompt);
    const flashcards = extractJson(rawOut);
    const id = uuidv4();
    try { await supabase.from('study_tools').insert({ tool_id: id, type: 'flashcard', title: flashcards.title, language, data: flashcards, created_at: new Date().toISOString() }); } catch(_) {}
    return res.json({ success: true, id, flashcards });
  } catch(e) {
    await fs.unlink(req.file?.path).catch(() => {});
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Worksheets from raw text
app.post('/worksheet', async (req, res) => {
  const { raw_text, language = 'English' } = req.body;
  if (!raw_text?.trim() || raw_text.trim().length < 20)
    return res.status(400).json({ error: 'raw_text must be at least 20 characters.' });
  try {
    const prompt = buildWorksheetPrompt(raw_text.trim(), language);
    const rawOut = await callRawAIRotation(prompt);
    const worksheet = extractJson(rawOut);
    const id = uuidv4();
    try { await supabase.from('study_tools').insert({ tool_id: id, type: 'worksheet', title: worksheet.title, language, data: worksheet, created_at: new Date().toISOString() }); } catch(_) {}
    return res.json({ success: true, id, worksheet });
  } catch(e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Worksheets from file upload
app.post('/worksheet-from-file', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  const language = req.body.language || 'English';
  try {
    const rawText = await extractText(req.file.path, req.file.mimetype, req.file.originalname);
    await fs.unlink(req.file.path).catch(() => {});
    if (rawText.trim().length < 20) return res.status(422).json({ error: 'Text too short.' });
    const prompt = buildWorksheetPrompt(rawText, language);
    const rawOut = await callRawAIRotation(prompt);
    const worksheet = extractJson(rawOut);
    const id = uuidv4();
    try { await supabase.from('study_tools').insert({ tool_id: id, type: 'worksheet', title: worksheet.title, language, data: worksheet, created_at: new Date().toISOString() }); } catch(_) {}
    return res.json({ success: true, id, worksheet });
  } catch(e) {
    await fs.unlink(req.file?.path).catch(() => {});
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Proxy route aliases for backwards compatibility
app.get('/proxy/health', (req, res) => res.json({ status: 'ok', service: 'Shiksha Setu Unified Pipeline', port: PORT }));
app.get('/proxy/jobs', async (req, res) => {
  const { data, error } = await supabase.from(SUPABASE_TABLE).select('job_id,title,language,scene_count,video_url,created_at,status').order('created_at', { ascending: false }).limit(50);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, count: data.length, jobs: data });
});
app.get('/proxy/jobs/:id', async (req, res) => {
  const { data, error } = await supabase.from(SUPABASE_TABLE).select('*').eq('job_id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: 'Not found' });
  return res.json({ success: true, job: data });
});
app.get('/proxy/credits', (_req, res) => res.redirect('/credits'));

// =============================================================================
// TRANSLATION ENDPOINT — Regional & Indigenous Languages (Santhali, Ho, Mundari, etc.)
// =============================================================================
app.post(['/translate', '/proxy/translate'], async (req, res) => {
  const { text, targetLanguage = 'Hindi', studentName } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ success: false, error: 'Text is required' });
  }

  try {
    let scriptInstructions = '';
    const langLower = targetLanguage.toLowerCase();
    if (langLower.includes('santhali') || langLower.includes('santali')) {
      scriptInstructions = 'Translate into authentic Santhali (Santali) using Ol Chiki script (ᱚᱞ ᱪᱤᱠᱤ) or Devanagari script with cultural greetings ("Johar!"). Provide both Ol Chiki and Devanagari/pronunciation if beneficial.';
    } else if (langLower.includes('ho')) {
      scriptInstructions = 'Translate into authentic Ho language using Devanagari script (or Warang Chiti / Latin transliteration) with cultural greetings ("Johar!").';
    } else if (langLower.includes('mundari')) {
      scriptInstructions = 'Translate into authentic Mundari language using Devanagari script with cultural greetings ("Johar!").';
    } else {
      scriptInstructions = `Translate into authentic ${targetLanguage} in its native script.`;
    }

    const prompt = `You are an expert indigenous and regional language translator for Indian students on Shiksha Setu.
Translate the following educational text into ${targetLanguage}.
${scriptInstructions}
Keep code blocks in English syntax, but translate comments and explanations.
Return ONLY the translated text without extra conversational fillers or markdown wrapping.

INPUT:
${text.trim()}`;

    const translatedText = await callRawAIRotation(prompt);
    return res.json({
      success: true,
      translatedText: translatedText.trim(),
      targetLanguage,
      studentName: studentName || 'Student'
    });
  } catch (err) {
    console.error('[Translate API] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Translation failed: ' + err.message
    });
  }
});


app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, _req, res, _next) => res.status(500).json({ error: err.message }));

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(64)}`);
  console.log(`  Shiksha Setu V2 -- AI Avatar Pipeline`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  Scenes: UNLIMITED (covers all content)`);
  console.log(`  Avatar: ${DID_API_KEY ? 'D-ID' : HF_API_KEY ? 'SadTalker' : 'Remotion Animated'}`);
  console.log(`  Voice : ${process.env.ELEVENLABS_API_KEY ? 'ElevenLabs + edge-tts' : 'edge-tts'}`);
  console.log(`  Subtitles: Word-level sync enabled`);
  console.log(`${'='.repeat(64)}\n`);
});
