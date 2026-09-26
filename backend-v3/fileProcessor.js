// =============================================================================
// fileProcessor.js -- Universal File Text Extractor
// Supports: .pptx / .ppt  |  .pdf (Text + Scanned/Image-Only via Gemini Multimodal)  |  .png / .jpg / .webp  |  .txt / .md
// =============================================================================

import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { createRequire } from 'module';
import officeParser from 'officeparser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import dotenv from 'dotenv';

dotenv.config();

// pdf-parse does not expose subpaths in ESM -- use createRequire as workaround
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const GEMINI_MODELS = [
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-pro-latest',
];

export async function extractText(filePath, mimeType, originalName = 'document') {
  const ext = path.extname(originalName).toLowerCase();
  console.log(`   Extracting from: ${originalName} (${ext})`);

  if (['.pptx', '.ppt', '.odp'].includes(ext)) {
    return extractFromPowerPoint(filePath, originalName);
  }
  if (ext === '.pdf' || mimeType === 'application/pdf') {
    return extractFromPdf(filePath, originalName);
  }
  if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext) || mimeType?.startsWith('image/')) {
    return extractFromImage(filePath, originalName, mimeType || `image/${ext.replace('.', '')}`);
  }
  if (['.txt', '.md', '.text'].includes(ext) || mimeType?.startsWith('text/')) {
    return extractFromText(filePath);
  }

  throw new Error(`Unsupported type: "${ext}". Allowed: .pptx .ppt .pdf .txt .md .png .jpg`);
}

async function extractFromPowerPoint(filePath, originalName) {
  return new Promise((resolve, reject) => {
    officeParser.parseOffice(filePath, (text, err) => {
      if (err) return reject(new Error(`PPTX extraction failed: ${err.message ?? err}`));
      if (!text?.trim()) return reject(new Error('PPTX has no readable text.'));
      const cleaned = cleanText(text);
      console.log(`   PPTX: ${cleaned.length} chars extracted`);
      resolve(cleaned);
    });
  });
}

async function extractFromPdf(filePath, originalName) {
  let cleaned = '';
  let parseFailed = false;

  // 1. Fast local digital text extraction
  try {
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    if (data.text?.trim()) {
      cleaned = cleanText(data.text);
      console.log(`   PDF (pdf-parse): ${cleaned.length} chars across ${data.numpages || 1} pages`);
    }
  } catch (err) {
    console.warn(`   pdf-parse notice: ${err.message}. Switching to Gemini Multimodal OCR...`);
    parseFailed = true;
  }

  // If local parsing yielded rich, complete text (>= 120 chars), use it directly
  if (!parseFailed && cleaned.length >= 120) {
    return cleaned;
  }

  // 2. Scanned, image-only, or sparse text fallback to Gemini Multimodal Document Extraction
  console.log(`   📄 Scanned or image-heavy PDF detected (${cleaned.length} chars). Running Gemini Multimodal OCR...`);
  try {
    const ocrText = await extractPdfWithGemini(filePath, originalName);
    if (ocrText && ocrText.trim().length >= 30) {
      console.log(`   ✅ Gemini Multimodal successfully extracted ${ocrText.length} chars from scanned PDF`);
      return ocrText;
    }
  } catch (geminiErr) {
    console.error(`   ❌ Gemini Multimodal OCR failed: ${geminiErr.message}`);
    if (cleaned.length >= 30) return cleaned;
    throw new Error(`Scanned PDF extraction failed: ${geminiErr.message}`);
  }

  if (cleaned.length >= 30) return cleaned;
  throw new Error('PDF appears to be empty or could not be read.');
}

async function extractPdfWithGemini(filePath, originalName) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Cannot perform OCR on scanned PDF.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const fileManager = new GoogleAIFileManager(apiKey);

  const prompt = `You are an expert academic professor and curriculum synthesizer.
The user has uploaded a lecture document, scanned notes, or textbook chapter: "${originalName}".
Thoroughly extract, transcribe, and explain all educational content from this document so that a comprehensive 3-5 minute animated educational video lesson can be generated.

Include in full detail:
1. Core Concepts & Definitions: All technical terms, parameters, and foundational principles.
2. Operational Characteristics & Formulas: Equivalent models, formulas, equations, derivations, ideal vs practical specs.
3. Step-by-Step Circuit / Process Analysis: How each configuration/process functions, input/output relationships.
4. Applications, Advantages, and Limitations.

Transcribe all key headings, bullet points, and explanatory text in clear, well-structured educational notes.`;

  // Strategy A: GoogleAIFileManager (handles files up to 2GB, perfect for 10MB+ scanned PDFs)
  let uploadedFile = null;
  try {
    console.log(`   [Gemini File API] Uploading ${path.basename(filePath)} (${originalName})...`);
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType: 'application/pdf',
      displayName: originalName || path.basename(filePath),
    });
    uploadedFile = uploadResult.file;
    console.log(`   [Gemini File API] Uploaded: ${uploadedFile.name} (${uploadedFile.uri})`);

    for (const m of GEMINI_MODELS) {
      try {
        console.log(`   [Gemini OCR] Transcribing via ${m}...`);
        const model = genAI.getGenerativeModel({ model: m });
        const res = await model.generateContent([
          {
            fileData: {
              mimeType: uploadedFile.mimeType,
              fileUri: uploadedFile.uri,
            },
          },
          { text: prompt },
        ]);
        const text = res.response?.text();
        if (text && text.trim().length >= 50) {
          return cleanText(text);
        }
      } catch (mErr) {
        console.warn(`   [Gemini OCR] ${m} warning: ${mErr.message?.slice(0, 100)}`);
      }
    }
  } catch (uploadErr) {
    console.warn(`   [Gemini File API] Upload failed: ${uploadErr.message}. Trying inline base64 fallback...`);
  } finally {
    if (uploadedFile?.name) {
      try {
        await fileManager.deleteFile(uploadedFile.name);
        console.log(`   [Gemini File API] Cleaned up: ${uploadedFile.name}`);
      } catch {}
    }
  }

  // Strategy B: Inline Base64 fallback (works for PDFs under 20MB)
  try {
    const stat = await fs.stat(filePath);
    if (stat.size <= 20 * 1024 * 1024) {
      console.log(`   [Gemini Inline] Reading ${stat.size} bytes into base64...`);
      const buffer = await fs.readFile(filePath);
      const base64 = buffer.toString('base64');

      for (const m of GEMINI_MODELS) {
        try {
          console.log(`   [Gemini Inline] Transcribing via ${m}...`);
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: prompt },
                  { inline_data: { mime_type: 'application/pdf', data: base64 } }
                ]
              }]
            })
          });
          if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim().length >= 50) {
              return cleanText(text);
            }
          }
        } catch (inErr) {
          console.warn(`   [Gemini Inline] ${m} error: ${inErr.message?.slice(0, 100)}`);
        }
      }
    }
  } catch (base64Err) {
    console.warn(`   [Gemini Inline] Base64 fallback error: ${base64Err.message}`);
  }

  throw new Error('Could not extract text from scanned PDF. Please ensure the document is clear and readable.');
}

async function extractFromImage(filePath, originalName, mimeType = 'image/png') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY missing for image OCR.');

  const genAI = new GoogleGenerativeAI(apiKey);
  const buffer = await fs.readFile(filePath);
  const base64 = buffer.toString('base64');

  const prompt = `You are an expert educator. Extract and explain all text, diagrams, formulas, equations, and topics present in this image into clear structured educational notes for teaching.`;

  for (const m of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent([
        {
          inlineData: {
            mimeType: mimeType.startsWith('image/') ? mimeType : 'image/png',
            data: base64,
          },
        },
        { text: prompt },
      ]);
      const text = res.response?.text();
      if (text && text.trim().length >= 20) {
        console.log(`   Image OCR extracted ${text.length} chars via ${m}`);
        return cleanText(text);
      }
    } catch (e) {
      console.warn(`   Image OCR ${m} error: ${e.message?.slice(0, 100)}`);
    }
  }

  throw new Error('Image OCR failed to extract educational content.');
}

async function extractFromText(filePath) {
  const text = await fs.readFile(filePath, 'utf8');
  if (!text?.trim()) throw new Error('Text file is empty.');
  const cleaned = cleanText(text);
  console.log(`   TXT: ${cleaned.length} chars extracted`);
  return cleaned;
}

function cleanText(raw) {
  return raw
    .replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    .replace(/[^\x09\x0A\x20-\x7E\u00A0-\uFFFF]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}