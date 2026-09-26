// =============================================================================
// voiceGenerator.js -- Smart TTS Fallback Engine for Shiksha Setu
//
// Fallback chain (in order):
//   1. ElevenLabs API  -- Human-quality AI voice (10K chars/month free)
//   2. Google TTS API  -- Excellent quality (4M chars/month free)
//   3. edge-tts        -- Always free, unlimited (Microsoft Neural)
//
// Handles ALL error types:
//   - Rate limits (429)
//   - Auth / invalid key (401, 403)
//   - Quota exhausted (402, "quota" in message)
//   - Network errors (fetch failed, timeout)
//   - Any other unexpected error
//
// The pipeline NEVER breaks -- always produces an audio file.
// The output path is identical regardless of which engine ran.
// =============================================================================

import fs            from 'fs/promises';
import { existsSync } from 'fs';
import path           from 'path';
import { exec }       from 'child_process';
import { promisify }  from 'util';

const execAsync = promisify(exec);

// ── Sarvam AI config (India's Sovereign Voice AI - Native Accents) ────────────
const SARVAM_MODEL = 'bulbul:v3';
const SARVAM_LANG_MAP = {
  'English':   'en-IN',
  'Hindi':     'hi-IN',
  'Hinglish':  'hi-IN',
  'Santhali':  'hi-IN',
  'Ho':        'hi-IN',
  'Mundari':   'hi-IN',
  'Bengali':   'bn-IN',
  'Gujarati':  'gu-IN',
  'Kannada':   'kn-IN',
  'Malayalam': 'ml-IN',
  'Marathi':   'mr-IN',
  'Odia':      'od-IN',
  'Punjabi':   'pa-IN',
  'Tamil':     'ta-IN',
  'Telugu':    'te-IN',
};

// ── ElevenLabs config ─────────────────────────────────────────────────────────
const EL_VOICE_ID = 'pNInz6obpgDQGcFmaJgB';  // Adam
const EL_MODEL    = 'eleven_multilingual_v2'; // Multilingual model for Indian accents & Hinglish

// ── Google Cloud TTS config (Indian English Neural Voice) ─────────────────────
const GCP_VOICE = { languageCode: 'en-IN', name: 'en-IN-Neural2-B', ssmlGender: 'MALE' };
const GCP_AUDIO = { audioEncoding: 'MP3', speakingRate: 0.95, pitch: 0 };

// ── edge-tts config (Indian English Neural Default) ───────────────────────────
const EDGE_TTS_PATH = [
  'C:\\Users\\Sribendu Prasad\\AppData\\Local\\Packages\\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\\LocalCache\\local-packages\\Python313\\Scripts\\edge-tts.exe',
].find(p => existsSync(p));
const TTS_CMD   = EDGE_TTS_PATH ?? 'edge-tts';
const TTS_VOICE = 'en-IN-PrabhatNeural';  // Authentic Microsoft Neural Indian male voice

// =============================================================================
// generateSpeech
//
// @param {string} text        -- Text to convert to speech
// @param {string} outputPath  -- Absolute .mp3 output path
// @returns {{ engine, fallbackReason }}
//   engine         -- 'ElevenLabs' | 'Google TTS' | 'edge-tts'
//   fallbackReason -- why we fell back (null if primary succeeded)
// =============================================================================
// ── Ol Chiki (Santhali) phonetic transliterator for TTS audio engines ─────────
const OL_CHIKI_MAP = {
  'ᱚ': 'o', 'ᱛ': 't', 'ᱜ': 'g', 'ᱝ': 'ng', 'ᱞ': 'l',
  'ᱟ': 'a', 'ᱠ': 'k', 'ᱡ': 'j', 'ᱢ': 'm', 'ᱣ': 'w',
  'ᱤ': 'i', 'ᱥ': 's', 'ᱦ': 'h', 'ᱨ': 'r', 'ᱩ': 'u',
  'ᱪ': 'ch','ᱫ': 'd', 'ᱬ': 'n', 'ᱭ': 'y', 'ᱮ': 'e',
  'ᱯ': 'p', 'ᱰ': 'd', 'ᱱ': 'n', 'ᱲ': 'r', 'ᱳ': 'o',
  'ᱴ': 't', 'ᱵ': 'b', 'ᱶ': 'w', 'ᱷ': 'h',
  'ᱸ': '',  'ᱹ': '',  'ᱺ': '',  'ᱻ': '',  'ᱼ': '',  'ᱽ': '', '᱾': '.', '᱿': '.',
  '᱐': '0', '᱑': '1', '᱒': '2', '᱓': '3', '᱔': '4',
  '᱕': '5', '᱖': '6', '᱗': '7', '᱘': '8', '᱙': '9'
};

function prepareVoiceText(text) {
  if (!text) return '';
  if (/[\u1C50-\u1C7F]/.test(text)) {
    return text.split('').map(c => OL_CHIKI_MAP[c] !== undefined ? OL_CHIKI_MAP[c] : c).join('');
  }
  return text;
}

export async function generateSpeech(text, outputPath, targetLanguage = 'English') {
  const sarvamKey = process.env.SARVAM_API_KEY?.trim();
  const dgKey     = process.env.DEEPGRAM_API_KEY?.trim();
  const elKey     = process.env.ELEVENLABS_API_KEY?.trim();
  const gcpKey    = process.env.GOOGLE_TTS_API_KEY?.trim();

  const isEnglish = (targetLanguage === 'English');
  const spokenText = prepareVoiceText(text);

  // ─────────────────────────────────────────────────────────────────────────
  // ATTEMPT 1: Sarvam AI (Authentic Indian Native Voice - Bulbul v3)
  // Supports Indian English (en-IN) and regional Indian languages natively!
  // ─────────────────────────────────────────────────────────────────────────
  if (sarvamKey && sarvamKey.length > 10) {
    try {
      console.log(`   🎙️  [Voice] Trying Sarvam AI (Native Indian Accent - ${targetLanguage})...`);
      await _sarvamAI(spokenText, outputPath, sarvamKey, targetLanguage);
      console.log('   ✅  [Voice] Sarvam AI succeeded (authentic Indian accent)');
      return { engine: 'Sarvam AI (Indian Native)', fallbackReason: null };

    } catch (err) {
      const reason = classifyError(err, 'Sarvam AI');
      console.warn(`   ⚠️  [Voice] Sarvam AI FAILED — ${reason}`);
      console.warn(`   ↪️  Switching to next fallback...`);
      await safeDelete(outputPath);
    }
  } else {
    console.log('   ℹ️  [Voice] Sarvam AI key not set — skipping');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ATTEMPT 2: Deepgram Aura (English only)
  // ─────────────────────────────────────────────────────────────────────────
  if (isEnglish && dgKey && dgKey.length > 10) {
    try {
      console.log('   🎙️  [Voice] Trying Deepgram Aura...');
      await _deepgram(spokenText, outputPath, dgKey);
      console.log('   ✅  [Voice] Deepgram succeeded');
      return { engine: 'Deepgram', fallbackReason: 'Sarvam AI failed or not configured' };

    } catch (err) {
      const reason = classifyError(err, 'Deepgram');
      console.warn(`   ⚠️  [Voice] Deepgram FAILED — ${reason}`);
      console.warn(`   ↪️  Switching to next fallback...`);
      await safeDelete(outputPath);
    }
  } else if (isEnglish) {
    console.log('   ℹ️  [Voice] Deepgram key not set — skipping');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ATTEMPT 3: ElevenLabs (with Multilingual model and rotation)
  // ─────────────────────────────────────────────────────────────────────────
  const elKeys = elKey ? elKey.split(',').map(k => k.trim()).filter(k => k.length > 10) : [];
  if (elKeys.length > 0) {
    for (let i = 0; i < elKeys.length; i++) {
      try {
        console.log(`   🎙️  [Voice] Trying ElevenLabs (Multilingual v2 - ${targetLanguage} - Key ${i+1}/${elKeys.length})...`);
        await _elevenLabs(spokenText, outputPath, elKeys[i]);
        console.log('   ✅  [Voice] ElevenLabs succeeded');
        return { engine: 'ElevenLabs', fallbackReason: 'Sarvam AI failed or not configured' };
      } catch (err) {
        const reason = classifyError(err, 'ElevenLabs');
        console.warn(`   ⚠️  [Voice] ElevenLabs Key ${i+1} FAILED — ${reason}`);
        await safeDelete(outputPath);
      }
    }
    console.warn(`   ↪️  All ElevenLabs keys exhausted. Switching to next fallback...`);
  } else {
    console.log('   ℹ️  [Voice] ElevenLabs keys not set — skipping');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ATTEMPT 4: Google Cloud TTS (Indian English en-IN Neural2)
  // ─────────────────────────────────────────────────────────────────────────
  if (isEnglish && gcpKey && gcpKey.length > 10) {
    try {
      console.log('   🎙️  [Voice] Trying Google Cloud TTS (en-IN)...');
      await _googleTTS(text, outputPath, gcpKey);
      console.log('   ✅  [Voice] Google TTS succeeded');
      return { engine: 'Google TTS', fallbackReason: 'Primary voices failed' };

    } catch (err) {
      const reason = classifyError(err, 'Google TTS');
      console.warn(`   ⚠️  [Voice] Google TTS FAILED — ${reason}`);
      console.warn(`   ↪️  Falling back to edge-tts (always free)...`);
      await safeDelete(outputPath);
    }
  } else if (isEnglish) {
    console.log('   ℹ️  [Voice] Google TTS key not set — skipping');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ATTEMPT 5: edge-tts (ALWAYS works, Microsoft Neural en-IN-Prabhat / regional)
  // ─────────────────────────────────────────────────────────────────────────
  try {
    console.log(`   🎙️  [Voice] Using edge-tts (${targetLanguage})...`);
    await _edgeTTS(spokenText, outputPath, targetLanguage);
    console.log('   ✅  [Voice] edge-tts succeeded');
    return {
      engine:         'edge-tts',
      fallbackReason: isEnglish ? 'Cloud AI voices failed or not configured' : `Native ${targetLanguage} voice used`,
    };
  } catch (err) {
    // This should almost never happen
    throw new Error(`All TTS engines failed. Last error (edge-tts): ${err.message}`);
  }
}

// =============================================================================
// getVoiceStatus -- Used by /health endpoint
// =============================================================================
export function getVoiceStatus() {
  const sarvamActive = !!(process.env.SARVAM_API_KEY?.trim().length > 10);
  const dgActive     = !!(process.env.DEEPGRAM_API_KEY?.trim().length > 10);
  const elActive     = !!(process.env.ELEVENLABS_API_KEY?.trim().length > 10);
  const gcpActive    = !!(process.env.GOOGLE_TTS_API_KEY?.trim().length > 10);

  let activeEngine = 'edge-tts (en-IN fallback)';
  if (sarvamActive) activeEngine = 'Sarvam AI (Indian Native) → ElevenLabs → edge-tts';
  else if (dgActive) activeEngine = 'Deepgram → ElevenLabs → edge-tts';
  else if (elActive && gcpActive)  activeEngine = 'ElevenLabs → Google TTS → edge-tts';
  else if (elActive) activeEngine = 'ElevenLabs → edge-tts';
  else if (gcpActive) activeEngine = 'Google TTS → edge-tts';

  return { sarvam: sarvamActive, deepgram: dgActive, elevenlabs: elActive, googleTTS: gcpActive, edgeTTS: true, activeEngine };
}

// Split long narrations into <= 450 character chunks at sentence boundaries for Sarvam AI
function splitIntoSarvamChunks(text, maxLen = 450) {
  if (!text) return [];
  const safeText = text.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (safeText.length <= maxLen) return [safeText];

  const sentenceRegex = /[^.!?।\n]+[.!?।\n]+|[^.!?।\n]+$/g;
  const rawSentences = safeText.match(sentenceRegex) || [safeText];
  const chunks = [];
  let currentChunk = '';

  for (let s of rawSentences) {
    s = s.trim();
    if (!s) continue;

    if (s.length > maxLen) {
      const words = s.split(/\s+/);
      for (const w of words) {
        if ((currentChunk + ' ' + w).trim().length > maxLen) {
          if (currentChunk.trim()) chunks.push(currentChunk.trim());
          currentChunk = w;
        } else {
          currentChunk = (currentChunk + ' ' + w).trim();
        }
      }
    } else {
      if ((currentChunk + ' ' + s).trim().length > maxLen) {
        if (currentChunk.trim()) chunks.push(currentChunk.trim());
        currentChunk = s;
      } else {
        currentChunk = (currentChunk + ' ' + s).trim();
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter(c => c.length > 0);
}

// =============================================================================
// _sarvamAI -- Sarvam AI Bulbul v3 REST call (Authentic Indian Accents)
// =============================================================================
async function _sarvamAI(text, outputPath, apiKey, targetLanguage = 'English') {
  const langCode = SARVAM_LANG_MAP[targetLanguage] || 'en-IN';
  const speaker  = (langCode === 'en-IN') ? 'aditya' : 'aditya';

  const chunks = splitIntoSarvamChunks(text, 450);
  if (chunks.length === 0) throw new Error('Empty text passed to Sarvam AI');

  let res;
  try {
    res = await fetch(
      'https://api.sarvam.ai/text-to-speech',
      {
        method:  'POST',
        headers: {
          'api-subscription-key': apiKey,
          'Content-Type':         'application/json'
        },
        body: JSON.stringify({
          inputs: chunks,
          target_language_code: langCode,
          speaker: speaker,
          model: SARVAM_MODEL,
          pace: 1.0,
        }),
        signal: AbortSignal.timeout(45_000),
      }
    );
  } catch (netErr) {
    throw new Error(`Network error: ${netErr.message}`);
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Unknown error');
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }

  const data = await res.json();
  if (!data?.audios || !Array.isArray(data.audios) || data.audios.length === 0) {
    throw new Error('Sarvam AI returned empty audio array');
  }
  const buffers = data.audios
    .filter(Boolean)
    .map(a => Buffer.from(a, 'base64'))
    .filter(b => b.length > 0);
  if (buffers.length === 0) throw new Error('Sarvam AI returned empty audio payload');
  const finalBuffer = Buffer.concat(buffers);
  await fs.writeFile(outputPath, finalBuffer);
}

// =============================================================================
// _deepgram -- Deepgram Aura REST call
// =============================================================================
async function _deepgram(text, outputPath, apiKey) {
  let res;
  try {
    res = await fetch(
      'https://api.deepgram.com/v1/speak?model=aura-asteria-en',
      {
        method:  'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type':  'application/json'
        },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(30_000),
      }
    );
  } catch (netErr) {
    throw new Error(`Network error: ${netErr.message}`);
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Unknown error');
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  await fs.writeFile(outputPath, Buffer.from(arrayBuffer));
}

// =============================================================================
// _elevenLabs -- ElevenLabs REST call
// =============================================================================
async function _elevenLabs(text, outputPath, apiKey) {
  let res;
  try {
    res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE_ID}`,
      {
        method:  'POST',
        headers: {
          'xi-api-key':   apiKey,
          'Content-Type': 'application/json',
          'Accept':       'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: EL_MODEL,
          voice_settings: {
            stability:         0.5,
            similarity_boost:  0.8,
            style:             0.2,
            use_speaker_boost: true,
          },
        }),
        signal: AbortSignal.timeout(30_000),  // 30s timeout
      }
    );
  } catch (netErr) {
    throw new Error(`Network error: ${netErr.message}`);
  }

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      errMsg = body?.detail?.message ?? body?.detail ?? JSON.stringify(body);
    } catch { /* ignore parse errors */ }

    // Map status codes to meaningful errors
    if (res.status === 401) throw new Error(`Invalid API key (401)`);
    if (res.status === 402) throw new Error(`Quota exhausted / insufficient credits (402)`);
    if (res.status === 403) throw new Error(`Forbidden — check account plan (403)`);
    if (res.status === 429) throw new Error(`Rate limit exceeded (429) — ${errMsg}`);
    throw new Error(`ElevenLabs error: ${errMsg}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 100) throw new Error('ElevenLabs returned empty audio');
  await fs.writeFile(outputPath, buffer);
}

// =============================================================================
// _googleTTS -- Google Cloud TTS REST call
// =============================================================================
async function _googleTTS(text, outputPath, apiKey) {
  let res;
  try {
    res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { text }, voice: GCP_VOICE, audioConfig: GCP_AUDIO }),
        signal: AbortSignal.timeout(30_000),
      }
    );
  } catch (netErr) {
    throw new Error(`Network error: ${netErr.message}`);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg  = body?.error?.message ?? `HTTP ${res.status}`;
    if (res.status === 400) throw new Error(`Bad request: ${msg}`);
    if (res.status === 403) throw new Error(`API key invalid or billing not enabled: ${msg}`);
    if (res.status === 429) throw new Error(`Quota exceeded: ${msg}`);
    throw new Error(`Google TTS error: ${msg}`);
  }

  const data = await res.json();
  if (!data.audioContent) throw new Error('Google TTS returned no audio content');
  await fs.writeFile(outputPath, Buffer.from(data.audioContent, 'base64'));
}

// =============================================================================
// _edgeTTS -- Microsoft Neural TTS (free, always available)
// =============================================================================
function getEdgeVoice(lang) {
  const map = {
    'English': 'en-IN-PrabhatNeural',
    'Hindi': 'hi-IN-MadhurNeural',
    'Hinglish': 'hi-IN-MadhurNeural',
    'Santhali': 'hi-IN-MadhurNeural',
    'Ho': 'hi-IN-MadhurNeural',
    'Mundari': 'hi-IN-MadhurNeural',
    'Bengali': 'bn-IN-BashkarNeural',
    'Marathi': 'mr-IN-ManoharNeural',
    'Telugu': 'te-IN-MohanNeural',
    'Tamil': 'ta-IN-ValluvarNeural',
    'Gujarati': 'gu-IN-NiranjanNeural',
    'Kannada': 'kn-IN-GaganNeural',
    'Malayalam': 'ml-IN-MidhunNeural',
    'Punjabi': 'pa-IN-OjasNeural',
    'Urdu': 'ur-IN-SalmanNeural'
  };
  return map[lang] || 'en-IN-PrabhatNeural';
}

async function _edgeTTS(text, outputPath, targetLanguage = 'English') {
  const voice = getEdgeVoice(targetLanguage);
  
  // Do NOT strip non-ASCII characters anymore, because other languages need them!
  const safeText = text
    .replace(/\n/g, ' ')
    .replace(/"/g, "'")
    .trim();

  const cmd = `"${TTS_CMD}" --voice "${voice}" --text "${safeText}" --write-media "${outputPath}"`;
  await execAsync(cmd, { timeout: 60_000 });
}

// =============================================================================
// Helpers
// =============================================================================

// Classify error into human-readable reason
function classifyError(err, service) {
  const msg = err.message.toLowerCase();
  if (msg.includes('quota') || msg.includes('402') || msg.includes('credit'))
    return `${service}: Monthly quota/credits exhausted`;
  if (msg.includes('401') || msg.includes('invalid api key') || msg.includes('invalid key'))
    return `${service}: Invalid API key`;
  if (msg.includes('429') || msg.includes('rate limit'))
    return `${service}: Rate limit hit`;
  if (msg.includes('403') || msg.includes('forbidden'))
    return `${service}: Forbidden / billing issue`;
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout'))
    return `${service}: Network/timeout error`;
  return `${service}: ${err.message.slice(0, 80)}`;
}

// Silently delete a file (used to clean up partial writes before retry)
async function safeDelete(filePath) {
  try { await fs.unlink(filePath); } catch { /* ignore */ }
}