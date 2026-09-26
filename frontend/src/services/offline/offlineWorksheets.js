// =============================================================================
// ShikshaSetu Offline Worksheet Engine
// offlineWorksheets.js | Generates & provides NIPUN worksheets without backend
// =============================================================================

import { BUNDLED_NIPUN_WORKSHEETS } from './offlinePack';
import { NIPUN_OUTCOMES_MATRIX } from '../apertiumSantaliData';

/**
 * Get or generate a structured offline worksheet for any NIPUN code
 */
export function getWorksheetForOutcome(nipunCode = 'L1.1', targetLang = 'sat') {
  if (BUNDLED_NIPUN_WORKSHEETS[nipunCode]) {
    return BUNDLED_NIPUN_WORKSHEETS[nipunCode];
  }

  const matrixEntry = NIPUN_OUTCOMES_MATRIX.find(o => o.code === nipunCode) || NIPUN_OUTCOMES_MATRIX[0];
  
  // Deterministic local generator for unbundled outcomes
  return {
    nipunCode: matrixEntry.code,
    outcomeTitle: matrixEntry.lakshya,
    grade: matrixEntry.grade,
    worksheetTitle: `ᱥᱟᱱᱛᱟᱲᱤ ${matrixEntry.code} ᱠᱟᱹᱢᱤ ᱥᱟᱠᱟᱢ (${matrixEntry.domain})`,
    instructions: "ᱱᱚᱣᱟ ᱠᱟᱹᱢᱤ ᱥᱟᱠᱟᱢ ᱯᱟᱲᱦᱟᱣ ᱢᱮ ᱟᱨ ᱥᱟᱹᱨᱤ ᱛᱮᱞᱟ ᱨᱮ ᱴᱤᱠ (✓) ᱪᱤᱱᱦᱟᱹ ᱮᱢ ᱢᱮ᱾",
    instructionsHindi: "इस कार्यपत्रक को ध्यानपूर्वक पढ़ें और सही उत्तर पर (✓) का निशान लगाएं।",
    questions: [
      {
        qNumber: 1,
        type: "mcq",
        prompt: `[${matrixEntry.code}] ᱞᱮᱠᱷᱟ ᱟᱨ ᱪᱤᱠᱤ ᱪᱤᱱᱦᱟᱹᱣ ᱢᱮ:`,
        roman: `[${matrixEntry.code}] Lekha ar chiki chinhow me:`,
        promptHindi: `[${matrixEntry.code}] सही विकल्प पहचानें:`,
        options: [
          { sat: "ᱥᱟᱹᱨᱤ ᱛᱮᱞᱟ (Correct)", roman: "Sari tela", hindi: "सही उत्तर", isCorrect: true },
          { sat: "ᱮᱴᱟᱜ ᱛᱮᱞᱟ (Other)", roman: "Etag tela", hindi: "अन्य उत्तर" }
        ],
        answer: "ᱥᱟᱹᱨᱤ ᱛᱮᱞᱟ",
        answerHindi: "सही उत्तर (Correct)"
      }
    ]
  };
}
