import { GoogleGenerativeAI } from "@google/generative-ai";

const extractJson = (text) => {
  let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");
  try { return JSON.parse(cleaned); } catch (_) {}
  const s = cleaned.indexOf("{");
  const e = cleaned.lastIndexOf("}");
  if (s !== -1 && e !== -1 && e > s) return JSON.parse(cleaned.slice(s, e + 1));
  throw new Error("Could not extract JSON from response");
};

// ─── Truncate only the content section of prompt ─────────────────────────────
function truncatePrompt(prompt, maxChars) {
  if (prompt.length <= maxChars) return prompt;
  const inputStart = prompt.indexOf('"""');
  const inputEnd   = prompt.lastIndexOf('"""');
  if (inputStart !== -1 && inputEnd !== -1 && inputEnd > inputStart) {
    const instructions = prompt.slice(0, inputStart);
    const content      = prompt.slice(inputStart + 3, inputEnd);
    return instructions + '"""' + content.slice(0, maxChars) + '...(truncated)"""\n\nJSON only:';
  }
  return prompt.slice(0, maxChars);
}

// ─── 0. Gemini — via direct REST (key works as query param) ✅ ────────────────
const callGemini = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) throw new Error("No Gemini key");
  const models = [
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-flash-latest",
    "gemini-3.6-flash"
  ];
  for (const modelName of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: truncatePrompt(prompt, 10000) }] }] })
        });
        if (!res.ok) {
          const err = await res.text();
          if ((res.status === 503 || res.status === 429) && attempt === 0) {
            await new Promise(r => setTimeout(r, 1200));
            continue;
          }
          throw new Error(`Gemini ${modelName} HTTP ${res.status}: ${err.slice(0,100)}`);
        }
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
        throw new Error("Empty Gemini response");
      } catch(e) {
        console.warn(`[LLM] Gemini ${modelName} (attempt ${attempt + 1}) failed: ${e.message?.slice(0,100)}`);
        if (attempt === 0 && (e.message?.includes("503") || e.message?.includes("429"))) {
          await new Promise(r => setTimeout(r, 1200));
        }
      }
    }
  }
  throw new Error("All Gemini models failed");
};



// ─── 1. Cloudflare AI — CONFIRMED WORKING ✅ ─────────────────────────────────
const callCloudflare = async (prompt) => {
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Authorization": "Bearer " + process.env.CLOUDFLARE_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: truncatePrompt(prompt, 5000) }] })
  });
  if (!res.ok) throw new Error("Cloudflare Error " + res.status);
  const data = await res.json();
  if (!data.success) throw new Error("Cloudflare failed: " + JSON.stringify(data.errors));
  return data.result.response;
};

// ─── 2. Cloudflare Mistral — CONFIRMED WORKING ✅ ────────────────────────────
const callCloudflareMistral = async (prompt) => {
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/mistral/mistral-7b-instruct-v0.1`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Authorization": "Bearer " + process.env.CLOUDFLARE_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: truncatePrompt(prompt, 4000) }] })
  });
  if (!res.ok) throw new Error("Cloudflare Mistral Error " + res.status);
  const data = await res.json();
  if (!data.success) throw new Error("Cloudflare Mistral failed");
  return data.result.response;
};

// ─── 3. Groq — updated to current valid models ───────────────────────────────
const callGroqModel = async (prompt, model) => {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": "Bearer " + process.env.GROQ_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages: [{ role: "user", content: truncatePrompt(prompt, 6000) }], temperature: 0.7, max_tokens: 4096 })
  });
  if (!res.ok) { const err = await res.text(); throw new Error("Groq " + model + " HTTP " + res.status + ": " + err.slice(0, 100)); }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
};

const callGroqLlama  = (p) => callGroqModel(p, "llama-3.3-70b-versatile");
const callGroqLlama8 = (p) => callGroqModel(p, "llama-3.1-8b-instant");

// ─── 4. OpenRouter — updated to current available models ─────────────────────
const callOpenRouter = async (prompt, model) => {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("No OpenRouter key");
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY, "Content-Type": "application/json", "HTTP-Referer": "https://shikshasetu.app", "X-Title": "Shiksha Setu" },
    body: JSON.stringify({ model, messages: [{ role: "user", content: truncatePrompt(prompt, 7000) }], temperature: 0.7 })
  });
  if (!res.ok) { const err = await res.text(); throw new Error("OpenRouter " + model + " HTTP " + res.status + ": " + err.slice(0, 150)); }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
};

const callOpenRouterGemma   = (p) => callOpenRouter(p, "google/gemma-2-9b-it:free");
const callOpenRouterPhi     = (p) => callOpenRouter(p, "microsoft/phi-3-mini-128k-instruct:free");
const callOpenRouterDeepseek= (p) => callOpenRouter(p, "deepseek/deepseek-r1:free");


// ─── MAIN ROTATION — Cloudflare FIRST (confirmed working) ─────────────────────
export async function generateScriptWithRotation(prompt, emitProgress, jobId) {
  const models = [
    { name: "Gemini 3.6 Flash",        fn: callGemini },
    { name: "Cloudflare Llama 3.1",    fn: callCloudflare },
    { name: "Cloudflare Mistral 7B",   fn: callCloudflareMistral },
    { name: "Groq Llama 3.3 70B",      fn: callGroqLlama },
    { name: "Groq Llama 3.1 8B",       fn: callGroqLlama8 },
    { name: "OpenRouter Gemma-2 9B",   fn: callOpenRouterGemma },
    { name: "OpenRouter Phi-3 Mini",   fn: callOpenRouterPhi },
    { name: "OpenRouter DeepSeek R1",  fn: callOpenRouterDeepseek },
  ];

  for (const model of models) {
    try {
      console.log("[LLM] Trying " + model.name + "...");
      const rawText = await model.fn(prompt);
      const json = extractJson(rawText);
      if (!json.scenes || !Array.isArray(json.scenes) || json.scenes.length === 0) {
        throw new Error("Empty or invalid scenes array in response");
      }
      console.log("[LLM] ✅ " + model.name + " Succeeded! " + json.scenes.length + " scenes");
      // Only emit progress on success
      emitProgress?.(jobId, 20, "gemini", "Script ready: " + json.scenes.length + " scenes (" + model.name + ")");
      return json;
    } catch (err) {
      console.warn("[LLM] ❌ " + model.name + " Failed: " + err.message?.slice(0, 150));
      // Removed emitProgress for failures to make the rotation smooth and invisible to the user
    }
  }
  throw new Error("All AI Models in the rotation failed or exhausted tokens.");
}

export async function callRawAIRotation(prompt) {
  const models = [
    { name: "Gemini 3.6 Flash",        fn: callGemini },
    { name: "Cloudflare Llama 3.1",    fn: callCloudflare },
    { name: "Cloudflare Mistral 7B",   fn: callCloudflareMistral },
    { name: "Groq Llama 3.3 70B",      fn: callGroqLlama },
    { name: "Groq Llama 3.1 8B",       fn: callGroqLlama8 },
    { name: "OpenRouter Gemma-2 9B",   fn: callOpenRouterGemma },
    { name: "OpenRouter Phi-3 Mini",   fn: callOpenRouterPhi },
    { name: "OpenRouter DeepSeek R1",  fn: callOpenRouterDeepseek },
  ];

  for (const model of models) {
    try {
      console.log("[Raw LLM] Trying " + model.name + "...");
      const rawText = await model.fn(prompt);
      if (rawText && rawText.length > 20) {
        console.log("[Raw LLM] ✅ " + model.name + " Succeeded!");
        return rawText;
      }
    } catch (err) {
      console.warn("[Raw LLM] ❌ " + model.name + " Failed: " + err.message?.slice(0, 100));
    }
  }
  throw new Error("All AI Models in the rotation failed.");
}

export { extractJson };