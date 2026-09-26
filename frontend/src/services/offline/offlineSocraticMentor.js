// =============================================================================
// ShikshaSetu Offline Socratic Pedagogy Engine
// offlineSocraticMentor.js | Deterministic Pedagogy & Classroom Mentorship
// =============================================================================

import { NIPUN_OUTCOMES_MATRIX } from '../apertiumSantaliData';

export const PEDAGOGICAL_ACTIONS = [
  { id: 'explain', label: 'Explain this Competency', labelHi: 'इस दक्षता की व्याख्या करें' },
  { id: 'oral_questions', label: 'Generate 5 Oral Questions', labelHi: '५ मौखिक प्रश्न सुझाएं' },
  { id: 'activity', label: 'Suggest Classroom Activity', labelHi: 'कक्षा गतिविधि की योजना' },
  { id: 'remediation', label: 'Suggest Remediation for Struggling Learners', labelHi: 'कमजोर बच्चों हेतु उपचारात्मक शिक्षण' }
];

/**
 * Generate pedagogical guidance offline based on outcome code and action
 */
export function getOfflinePedagogicalGuidance(nipunCode = 'L1.1', actionId = 'explain', targetLang = 'sat') {
  const outcome = NIPUN_OUTCOMES_MATRIX.find(o => o.code === nipunCode) || NIPUN_OUTCOMES_MATRIX[0];

  switch (actionId) {
    case 'explain':
      return {
        title: `Competency Guide: ${outcome.code} (${outcome.grade})`,
        lakshya: outcome.lakshya,
        description: outcome.description,
        pedagogyStrategy: outcome.pedagogyGuide,
        mtbMleTip: "Always validate child expression in their home tribal language first to eliminate affective filter before bridging to standard Hindi."
      };

    case 'oral_questions':
      return {
        title: `5 Oral Classroom Questions (${outcome.code})`,
        questions: [
          { q: "1. आप अपने गाँव में स्कूल आते समय क्या-क्या देखते हैं?", sat: "ᱟᱛᱳ ᱠᱷᱚᱱ ᱦᱤᱡᱩᱜ ᱡᱚᱠᱷᱮᱡ ᱪᱮᱫ-ᱪᱮᱫ ᱯᱮ ᱧᱮᱞᱟ?" },
          { q: "2. इस चित्र में पेड़ पर कौन सा पक्षी बैठा है?", sat: "ᱱᱚᱣᱟ ᱪᱤᱛᱟᱹᱨ ᱨᱮ ᱫᱟᱨᱮ ᱪᱮᱛᱟᱱ ᱨᱮ ᱪᱮᱫ ᱪᱮᱬᱮ ᱫᱩᱲᱩᱵ ᱟᱠᱟᱱᱟᱭ?" },
          { q: "3. 'पोतोब' (किताब) का पहला अक्षर कौन सा है?", sat: "‘ᱯᱚᱛᱚᱵ’ ᱨᱮᱭᱟᱜ ᱯᱩᱭᱞᱩ ᱪᱤᱠᱤ ᱚᱠᱟ ᱠᱟᱱᱟ?" },
          { q: "4. अपनी मेज पर रखे ५ पत्थरों को गिनकर दिखाइए।", sat: "ᱢᱮᱡᱽ ᱪᱮᱛᱟᱱ ᱨᱮᱱᱟᱜ ᱢᱚᱬᱮ (᱕) ᱫᱷᱤᱨᱤ ᱞᱮᱠᱷᱟ ᱠᱟᱛᱮ ᱩᱫᱩᱜ ᱯᱮ᱾" },
          { q: "5. क्या सब बच्चों को आज की कहानी अच्छी लगी?", sat: "ᱪᱮᱫ ᱥᱟᱱᱟᱢ ᱠᱚ ᱛᱮᱦᱮᱧᱟᱜ ᱠᱟᱹᱦᱱᱤ ᱵᱮᱥ ᱯᱮ ᱵᱩᱡᱷᱟᱹᱣ ᱠᱮᱫᱟ?" }
        ]
      };

    case 'activity':
      return {
        title: `Classroom Activity Plan: Concrete Object Bridging`,
        steps: [
          "Step 1 (Warm-up): Group children in a circle and begin with the tribal greeting 'Johar Sanam Ko!'.",
          "Step 2 (Exploration): Distribute concrete counting pebbles (dhiri) or leaves (sakam).",
          "Step 3 (Dual Call & Response): Say the number in Santhali ('Mit, Bar, Pe') and ask children to lift corresponding fingers.",
          "Step 4 (Slate Drawing): Ask each child to write the Ol Chiki letter on their slate (pata)."
        ],
        timeMinutes: 20
      };

    case 'remediation':
      return {
        title: `Remediation Plan for ${outcome.code}`,
        recommendation: "Pair the child with a fluent peer buddy. Use physical flashcards with Ol Chiki tactile traces and repeat rhythmically with hand claps."
      };

    default:
      return {
        title: `Pedagogy Guidance: ${outcome.code}`,
        text: outcome.pedagogyGuide
      };
  }
}
