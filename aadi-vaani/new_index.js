/**
 * Aadi Vaani (आदि वाणी) - Tribal Voice & Text Translation Adapter for IRIS
 * Provides Node.js/Express bridge methods to translate between Hindi/English and
 * indigenous languages: Santali (Ol Chiki), Mundari, and Ho (Warang Citi).
 */

const http = require('http');

const AADI_VAANI_HOST = process.env.AADI_VAANI_HOST || '127.0.0.1';
const AADI_VAANI_PORT = process.env.AADI_VAANI_PORT || 8000;

/**
 * Translates text between supported language pairs.
 * @param {string} text - The input text to translate.
 * @param {string} sourceLang - 'hin', 'eng', 'sat', 'unr', 'hoc'
 * @param {string} targetLang - 'hin', 'eng', 'sat', 'unr', 'hoc'
 * @param {string|null} scriptPreference - 'ol_chiki', 'warang_citi', 'devanagari'
 * @returns {Promise<Object>}
 */
async function translateTribalText(text, sourceLang = 'hin', targetLang = 'sat', scriptPreference = null) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      text,
      source_lang: sourceLang,
      target_lang: targetLang,
      script_preference: scriptPreference,
      allow_fallback: true
    });

    const options = {
      hostname: AADI_VAANI_HOST,
      port: AADI_VAANI_PORT,
      path: '/translate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(parsed.detail || 'Translation error'));
          } else {
            resolve(parsed);
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(payload);
    req.end();
  });
}

module.exports = {
  translateTribalText
};

if (require.main === module) {
  console.log(`Aadi Vaani Node.js client initialized. Connecting to Python service at http://${AADI_VAANI_HOST}:${AADI_VAANI_PORT}`);
}
