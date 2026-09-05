// =============================================================================
// PALASH IRIS — Jharkhand Tribal Languages Dataset (Problem Statement 26042)
// apertiumSantaliData.js | Santhali (Ol Chiki), Ho (Warang Chiti), Mundari & NIPUN Matrix
// =============================================================================

export const TRIBAL_LANGUAGES = [
  { code: 'sat', name: 'Santhali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', script: 'Ol Chiki (ᱚᱞ ᱪᱤᱠᱤ)', region: 'Santhal Pargana, East Singhbhum' },
  { code: 'hoc', name: 'Ho', nativeName: '𑢹𑣉𑣉 𑣏𑣂𑣑𑣂 (हो)', script: 'Warang Chiti (𑢹𑣉𑣉)', region: 'West Singhbhum (Kolhan), Saraikela' },
  { code: 'unr', name: 'Mundari', nativeName: 'ᱢᱩᱱᱰᱟᱨᱤ (मुंडारी)', script: 'Mundari Bani / Devanagari', region: 'Ranchi, Khunti, Gumla, Simdega' }
];

// -----------------------------------------------------------------------------
// 1. MULTILINGUAL TRIBAL LEXICON (Santhali, Ho, Mundari ↔ Hindi / English)
// -----------------------------------------------------------------------------
export const APERTIUM_SANTALI_LEXICON = {
  // Educational & Classroom Vocabulary
  "book": {
    sat: { script: "ᱯᱚᱛᱚᱵ", roman: "potob" },
    hoc: { script: "ᱯᱩᱛᱷᱤ", roman: "puthi" },
    unr: { script: "ᱯᱩᱛᱷᱤ", roman: "puthi" },
    hindi: "किताब / पुस्तक",
    pos: "noun"
  },
  "read": {
    sat: { script: "ᱯᱟᱲᱦᱟᱣ", roman: "paṛhaw" },
    hoc: { script: "ᱯᱟᱲᱦᱟᱣ", roman: "paṛhao" },
    unr: { script: "ᱯᱟᱲᱦᱟᱣ", roman: "paṛhao" },
    hindi: "पढ़ना",
    pos: "verb"
  },
  "write": {
    sat: { script: "ᱚᱞ", roman: "ol" },
    hoc: { script: "ᱚᱞ", roman: "ol" },
    unr: { script: "ᱚᱞ", roman: "ol" },
    hindi: "लिखना",
    pos: "verb"
  },
  "school": {
    sat: { script: "ᱟᱥᱲᱟ", roman: "asṛa" },
    hoc: { script: "ᱤᱥᱠᱩᱞ", roman: "iskul" },
    unr: { script: "ᱤᱥᱠᱩᱞ / ᱟᱥᱲᱟ", roman: "asṛa" },
    hindi: "विद्यालय / स्कूल",
    pos: "noun"
  },
  "teacher": {
    sat: { script: "ᱢᱟᱪᱮᱛ", roman: "machet" },
    hoc: { script: "ᱢᱟᱪᱮᱫ", roman: "mached" },
    unr: { script: "ᱢᱟᱪᱮᱫ / ᱜᱩᱨᱩ", roman: "mached" },
    hindi: "शिक्षक / गुरुजी",
    pos: "noun"
  },
  "student": {
    sat: { script: "ᱪᱮᱛᱮᱫᱤᱭᱟᱹ", roman: "chetediya" },
    hoc: { script: "ᱤᱛᱩ ᱠᱚ", roman: "itu ko" },
    unr: { script: "ᱪᱮᱛᱮᱫᱤᱭᱟᱹ", roman: "chetediya" },
    hindi: "विद्यार्थी / छात्र",
    pos: "noun"
  },
  "slate": {
    sat: { script: "ᱯᱟᱴᱟ", roman: "pata" },
    hoc: { script: "ᱯᱟᱴᱟ", roman: "pata" },
    unr: { script: "ᱯᱟᱴᱟ", roman: "pata" },
    hindi: "स्लेट / तख्ती",
    pos: "noun"
  },
  "water": {
    sat: { script: "ᱫᱟᱜ", roman: "da'" },
    hoc: { script: "ᱫᱟᱜ", roman: "da'" },
    unr: { script: "ᱫᱟᱜ", roman: "da'" },
    hindi: "पानी / जल",
    pos: "noun"
  },
  "tree": {
    sat: { script: "ᱫᱟᱨᱮ", roman: "dare" },
    hoc: { script: "ᱫᱟᱨᱩ", roman: "daru" },
    unr: { script: "ᱫᱟᱨᱩ", roman: "daru" },
    hindi: "पेड़ / वृक्ष",
    pos: "noun"
  },
  "sun": {
    sat: { script: "ᱵᱮᱲᱟ", roman: "beṛa" },
    hoc: { script: "ᱥᱤᱸᱜᱤ", roman: "singi" },
    unr: { script: "ᱥᱤᱸᱜᱤ", roman: "singi" },
    hindi: "सूरज / सूर्य",
    pos: "noun"
  },
  "flower": {
    sat: { script: "ᱵᱟᱦᱟ", roman: "baha" },
    hoc: { script: "ᱵᱟ", roman: "ba" },
    unr: { script: "ᱵᱟᱦᱟ", roman: "baha" },
    hindi: "फूल / पुष्प",
    pos: "noun"
  },
  "fruit": {
    sat: { script: "ᱡᱚ", roman: "jo" },
    hoc: { script: "ᱡᱚ", roman: "jo" },
    unr: { script: "ᱡᱚ", roman: "jo" },
    hindi: "फल",
    pos: "noun"
  },
  "bird": {
    sat: { script: "ᱪᱮᱬᱮ", roman: "cheṇe" },
    hoc: { script: "ᱪᱮᱬᱮ", roman: "cheṇe" },
    unr: { script: "ᱪᱮᱬᱮ", roman: "cheṇe" },
    hindi: "चिड़िया / पक्षी",
    pos: "noun"
  },
  "cow": {
    sat: { script: "ᱜᱟᱹᱭ", roman: "gại" },
    hoc: { script: "ᱜᱟᱹᱭ", roman: "gai" },
    unr: { script: "ᱜᱟᱹᱭ", roman: "gai" },
    hindi: "गाय",
    pos: "noun"
  },
  "village": {
    sat: { script: "ᱟᱛᱳ", roman: "ato" },
    hoc: { script: "ᱦᱟᱛᱩ", roman: "hatu" },
    unr: { script: "ᱦᱟᱛᱩ", roman: "hatu" },
    hindi: "गाँव / ग्राम",
    pos: "noun"
  },
  "child": {
    sat: { script: "ᱜᱤᱫᱽᱨᱟᱹ", roman: "gidrạ" },
    hoc: { script: "ᱦᱚᱯᱚᱱ", roman: "hopon" },
    unr: { script: "ᱦᱚᱯᱚᱱ / ᱜᱤᱫᱽᱨᱟᱹ", roman: "gidra" },
    hindi: "बच्चा",
    pos: "noun"
  },
  // Numbers
  "one": {
    sat: { script: "ᱢᱤᱫ", roman: "mit'" },
    hoc: { script: "ᱢᱤᱭᱟᱹᱫ", roman: "miyad" },
    unr: { script: "ᱢᱤᱭᱟᱹᱫ", roman: "miad" },
    hindi: "एक (१)",
    pos: "number"
  },
  "two": {
    sat: { script: "ᱵᱟᱨ", roman: "bar" },
    hoc: { script: "ᱵᱟᱹᱨᱤᱭᱟᱹ", roman: "baria" },
    unr: { script: "ᱵᱟᱹᱨᱤᱭᱟᱹ", roman: "baria" },
    hindi: "दो (२)",
    pos: "number"
  },
  "three": {
    sat: { script: "ᱯᱮ", roman: "pe" },
    hoc: { script: "ᱟᱹᱯᱤᱭᱟᱹ", roman: "apia" },
    unr: { script: "ᱟᱹᱯᱤᱭᱟᱹ", roman: "apia" },
    hindi: "तीन (३)",
    pos: "number"
  },
  "four": {
    sat: { script: "ᱯᱩᱱ", roman: "pun" },
    hoc: { script: "ᱩᱯᱩᱱᱤᱭᱟᱹ", roman: "upunia" },
    unr: { script: "ᱩᱯᱩᱱᱤᱭᱟᱹ", roman: "upunia" },
    hindi: "चार (४)",
    pos: "number"
  },
  "five": {
    sat: { script: "ᱢᱚᱬᱮ", roman: "mõṛẽ" },
    hoc: { script: "ᱢᱚᱬᱮᱭᱟᱹ", roman: "mõṛẽya" },
    unr: { script: "ᱢᱚᱬᱮᱭᱟᱹ", roman: "mõṛẽya" },
    hindi: "पाँच (५)",
    pos: "number"
  }
};

// -----------------------------------------------------------------------------
// 2. REAL-TIME CLASSROOM PHRASEBOOK (<3s Latency Voice Dialogue)
// -----------------------------------------------------------------------------
export const CLASSROOM_PHRASEBOOK = [
  {
    id: "p-1",
    category: "Greetings",
    hindi: "नमस्ते सब बच्चों को!",
    english: "Good morning / Hello everyone!",
    sat: { script: "ᱡᱚᱦᱟᱨ ᱥᱟᱱᱟᱢ ᱠᱚ!", roman: "Johar sanam ko!", phonetic: "JO-HAR SA-NAAM KO" },
    hoc: { script: "ᱡᱚᱦᱟᱨ ᱥᱟᱱᱟᱢ ᱠᱚ!", roman: "Johar sanam ko!", phonetic: "JO-HAR SA-NAAM KO" },
    unr: { script: "ᱡᱚᱦᱟᱨ ᱥᱟᱱᱟᱢ ᱠᱚ!", roman: "Johar sanam ko!", phonetic: "JO-HAR SA-NAAM KO" }
  },
  {
    id: "p-2",
    category: "Greetings",
    hindi: "आज आप सब कैसे हैं?",
    english: "How are you all today?",
    sat: { script: "ᱛᱮᱦᱮᱧ ᱟᱯᱮ ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱜ ᱯᱮᱭᱟ?", roman: "Teheñ ape chet' leka mena' peya?", phonetic: "TAY-HENY AA-PAY CHET LAY-KA MAY-NA PAY-YA" },
    hoc: { script: "ᱛᱤᱥᱤᱝ ᱟᱯᱮ ᱪᱤᱞᱠᱟ ᱢᱮᱱᱟᱜ ᱯᱮᱭᱟ?", roman: "Tising ape chilka mena' peya?", phonetic: "TEE-SING AA-PAY CHIL-KA MAY-NA PAY-YA" },
    unr: { script: "ᱛᱤᱥᱤᱝ ᱟᱯᱮ ᱪᱤᱞᱠᱟ ᱢᱮᱱᱟᱜ ᱯᱮᱭᱟ?", roman: "Tising ape chilka mena' peya?", phonetic: "TEE-SING AA-PAY CHIL-KA MAY-NA PAY-YA" }
  },
  {
    id: "p-3",
    category: "Instructions",
    hindi: "कृपया शांत होकर बैठ जाइए।",
    english: "Please sit down quietly.",
    sat: { script: "ᱛᱷᱤᱨ ᱠᱟᱛᱮ ᱫᱩᱲᱩᱵ ᱯᱮ᱾", roman: "Thir kate duṛub pe.", phonetic: "THEER KA-TAY DU-RUB PAY" },
    hoc: { script: "ᱛᱷᱤᱨ ᱠᱟᱛᱮ ᱫᱩᱵᱽ ᱯᱮ᱾", roman: "Thir kate dub pe.", phonetic: "THEER KA-TAY DUB PAY" },
    unr: { script: "ᱛᱷᱤᱨ ᱠᱟᱛᱮ ᱫᱩᱵᱽ ᱯᱮ᱾", roman: "Thir kate dub pe.", phonetic: "THEER KA-TAY DUB PAY" }
  },
  {
    id: "p-4",
    category: "Instructions",
    hindi: "सब बच्चे खड़े हो जाइए।",
    english: "Please stand up.",
    sat: { script: "ᱥᱟᱱᱟᱢ ᱜᱤᱫᱽᱨᱟᱹ ᱛᱤᱸᱜᱩᱱ ᱯᱮ᱾", roman: "Sanam gidrạ tingun pe.", phonetic: "SA-NAAM GEED-RAH TING-GUN PAY" },
    hoc: { script: "ᱥᱟᱱᱟᱢ ᱠᱚ ᱛᱤᱸᱜᱩᱱ ᱯᱮ᱾", roman: "Sanam ko tingun pe.", phonetic: "SA-NAAM KO TING-GUN PAY" },
    unr: { script: "ᱥᱟᱱᱟᱢ ᱠᱚ ᱛᱤᱸᱜᱩᱱ ᱯᱮ᱾", roman: "Sanam ko tingun pe.", phonetic: "SA-NAAM KO TING-GUN PAY" }
  },
  {
    id: "p-5",
    category: "Instructions",
    hindi: "अपनी किताब का पृष्ठ संख्या ५ खोलें।",
    english: "Open your books to page 5.",
    sat: { script: "ᱯᱚᱛᱚᱵ ᱨᱮᱱᱟᱜ ᱢᱚᱬᱮ (᱕) ᱥᱟᱦᱴᱟ ᱡᱷᱤᱡᱽ ᱯᱮ᱾", roman: "Potob renag mõṛẽ (5) sahṭa jhij pe.", phonetic: "PO-TOB RAY-NAAG MON-RE SAH-TA JHIJ PAY" },
    hoc: { script: "ᱯᱩᱛᱷᱤ ᱨᱮᱭᱟᱜ ᱢᱚᱬᱮ ᱥᱟᱠᱟᱢ ᱡᱷᱤᱡᱽ ᱯᱮ᱾", roman: "Puthi reyag mõṛẽ sakam jhij pe.", phonetic: "PU-THI RAY-YAAG MON-RAY SA-KAAM JHIJ PAY" },
    unr: { script: "ᱯᱩᱛᱷᱤ ᱨᱮᱭᱟᱜ ᱢᱚᱬᱮ ᱥᱟᱠᱟᱢ ᱡᱷᱤᱡᱽ ᱯᱮ᱾", roman: "Puthi reyag mõṛẽ sakam jhij pe.", phonetic: "PU-THI RAY-YAAG MON-RAY SA-KAAM JHIJ PAY" }
  },
  {
    id: "p-6",
    category: "Instructions",
    hindi: "श्यामपट्ट (बोर्ड) पर ध्यान से देखिए।",
    english: "Look at the blackboard carefully.",
    sat: { script: "ᱵᱳᱨᱰ ᱥᱮᱫ ᱢᱚᱱᱮ ᱞᱟᱜᱟᱣ ᱠᱟᱛᱮ ᱧᱮᱞ ᱯᱮ᱾", roman: "Bord sed mone lagaw kate ñel pe.", phonetic: "BORD SED MO-NAY LA-GAW KA-TAY NYEL PAY" },
    hoc: { script: "ᱵᱳᱨᱰ ᱯᱟᱦᱴᱟ ᱫᱷᱮᱭᱟᱱ ᱛᱮ ᱧᱮᱞ ᱯᱮ᱾", roman: "Bord pahta dhyan te ñel pe.", phonetic: "BORD PAH-TA DHYAAN TAY NYEL PAY" },
    unr: { script: "ᱵᱳᱨᱰ ᱯᱟᱦᱴᱟ ᱫᱷᱮᱭᱟᱱ ᱛᱮ ᱧᱮᱞ ᱯᱮ᱾", roman: "Bord pahta dhyan te ñel pe.", phonetic: "BORD PAH-TA DHYAAN TAY NYEL PAY" }
  },
  {
    id: "p-7",
    category: "Instructions",
    hindi: "इसे अपनी स्लेट या कॉपी में लिखिए।",
    english: "Write this down on your slate or notebook.",
    sat: { script: "ᱱᱚᱣᱟ ᱯᱟᱴᱟ ᱥᱮ ᱠᱷᱟᱛᱟ ᱨᱮ ᱚᱞ ᱯᱮ᱾", roman: "Nowa pata se khata re ol pe.", phonetic: "NO-WA PA-TA SAY KHA-TA RAY OL PAY" },
    hoc: { script: "ᱱᱮᱭᱟ ᱯᱟᱴᱟ ᱨᱮ ᱚᱞ ᱯᱮ᱾", roman: "Neya pata re ol pe.", phonetic: "NAY-YA PA-TA RAY OL PAY" },
    unr: { script: "ᱱᱮᱭᱟ ᱯᱟᱴᱟ ᱨᱮ ᱚᱞ ᱯᱮ᱾", roman: "Neya pata re ol pe.", phonetic: "NAY-YA PA-TA RAY OL PAY" }
  },
  {
    id: "p-8",
    category: "Instructions",
    hindi: "मेरे बाद सब एक साथ ज़ोर से बोलिए।",
    english: "Read aloud together after me.",
    sat: { script: "ᱤᱧ ᱛᱟᱭᱚᱢ ᱛᱮ ᱥᱟᱱᱟᱢ ᱠᱚ ᱢᱤᱫ ᱥᱟᱶᱛᱮ ᱯᱟᱲᱦᱟᱣ ᱯᱮ᱾", roman: "Iñ tayom te sanam ko mit' sawte paṛhaw pe.", phonetic: "EENY TA-YOM TAY SA-NAAM KO MEET SAWW-TAY PAR-HAW PAY" },
    hoc: { script: "ᱟᱭᱤᱧ ᱛᱟᱭᱚᱢ ᱛᱮ ᱡᱚᱛᱚ ᱠᱚ ᱠᱟᱡᱤ ᱯᱮ᱾", roman: "Aying tayom te joto ko kaji pe.", phonetic: "AA-YING TA-YOM TAY JO-TO KO KA-JEE PAY" },
    unr: { script: "ᱟᱭᱤᱧ ᱛᱟᱭᱚᱢ ᱛᱮ ᱡᱚᱛᱚ ᱠᱚ ᱠᱟᱡᱤ ᱯᱮ᱾", roman: "Aying tayom te joto ko kaji pe.", phonetic: "AA-YING TA-YOM TAY JO-TO KO KA-JEE PAY" }
  },
  {
    id: "p-9",
    category: "Praise",
    hindi: "बहुत बढ़िया! / शाबाश!",
    english: "Very good! / Well done!",
    sat: { script: "ᱟᱹᱰᱤ ᱵᱷᱟᱹᱜᱤ! / ᱥᱟᱵᱟᱥ!", roman: "Ạḍi bhạgi! / Sabas!", phonetic: "AH-DEE BHA-GEE! / SHAH-BAASH!" },
    hoc: { script: "ᱵᱮᱥ ᱜᱮᱭᱟ! / ᱥᱟᱵᱟᱥ!", roman: "Bes geya! / Sabas!", phonetic: "BAYS GAY-YA! / SHAH-BAASH!" },
    unr: { script: "ᱵᱮᱥ ᱜᱮᱭᱟ! / ᱥᱟᱵᱟᱥ!", roman: "Bes geya! / Sabas!", phonetic: "BAYS GAY-YA! / SHAH-BAASH!" }
  },
  {
    id: "p-10",
    category: "Numeracy",
    hindi: "उंगलियां गिनिए: १, २, ३, ४, ५।",
    english: "Count fingers: 1, 2, 3, 4, 5.",
    sat: { script: "ᱠᱟᱹᱴᱩᱵ ᱞᱮᱠᱷᱟᱭ ᱯᱮ: ᱢᱤᱫ, ᱵᱟᱨ, ᱯᱮ, ᱯᱩᱱ, ᱢᱚᱬᱮ᱾", roman: "Kạtub lekhay pe: mit', bar, pe, pun, mõṛẽ.", phonetic: "KAH-TOOB LAY-KHAY PAY: MEET, BAAR, PAY, POON, MON-RAY" },
    hoc: { script: "ᱜᱟᱱᱰᱩ ᱞᱮᱠᱷᱟᱭ ᱯᱮ: ᱢᱤᱭᱟᱹᱫ, ᱵᱟᱹᱨᱤᱭᱟᱹ, ᱟᱹᱯᱤᱭᱟᱹ, ᱩᱯᱩᱱᱤᱭᱟᱹ, ᱢᱚᱬᱮᱭᱟᱹ᱾", roman: "Gandu lekhay pe: miyad, baria, apia, upunia, mõṛẽya.", phonetic: "MEE-YAD, BA-REE-YA, AH-PEE-YA, OO-PU-NEE-YA, MON-RAY-YA" },
    unr: { script: "ᱞᱮᱠᱷᱟᱭ ᱯᱮ: ᱢᱤᱭᱟᱹᱫ, ᱵᱟᱹᱨᱤᱭᱟᱹ, ᱟᱹᱯᱤᱭᱟᱹ, ᱩᱯᱩᱱᱤᱭᱟᱹ, ᱢᱚᱬᱮᱭᱟᱹ᱾", roman: "Lekhay pe: miad, baria, apia, upunia, mõṛẽya.", phonetic: "MEE-AD, BA-REE-YA, AH-PEE-YA, OO-PU-NEE-YA, MON-RAY-YA" }
  },
  {
    id: "p-11",
    category: "Questions",
    hindi: "प्यारे बच्चे, आपका क्या नाम है?",
    english: "What is your name, child?",
    sat: { script: "ᱫᱩᱞᱟᱹᱲ ᱜᱤᱫᱽᱨᱟᱹ, ᱟᱢᱟᱜ ᱧᱩᱛᱩᱢ ᱪᱮᱫ?", roman: "Dulạṛ gidrạ, amag ñutum chet'?", phonetic: "DOO-LAR GEED-RAH, AA-MAAG NYU-TOOM CHET?" },
    hoc: { script: "ᱟᱢᱟᱜ ᱧᱩᱛᱩᱢ ᱪᱤᱱᱟᱹ?", roman: "Amag ñutum china?", phonetic: "AA-MAAG NYU-TOOM CHEE-NA?" },
    unr: { script: "ᱟᱢᱟᱜ ᱧᱩᱛᱩᱢ ᱪᱤᱱᱟᱹ?", roman: "Amag ñutum china?", phonetic: "AA-MAAG NYU-TOOM CHEE-NA?" }
  },
  {
    id: "p-12",
    category: "Questions",
    hindi: "क्या सब बच्चों को यह पाठ समझ आया?",
    english: "Did everyone understand the lesson?",
    sat: { script: "ᱪᱮᱫ ᱥᱟᱱᱟᱢ ᱜᱤᱫᱽᱨᱟᱹ ᱱᱚᱣᱟ ᱯᱟᱴᱷ ᱯᱮ ᱵᱩᱡᱷᱟᱹᱣ ᱠᱮᱫᱟ?", roman: "Chet' sanam gidrạ nowa path pe bujhạw keda?", phonetic: "CHET SA-NAAM GEED-RAH NO-WA PAATH PAY BOO-JHAW KAY-DA?" },
    hoc: { script: "ᱪᱤ ᱡᱚᱛᱚ ᱠᱚ ᱵᱩᱡᱷᱟᱹᱣ ᱠᱮᱫᱟ?", roman: "Chi joto ko bujhau keda?", phonetic: "CHEE JO-TO KO BOO-JHAW KAY-DA?" },
    unr: { script: "ᱪᱤ ᱡᱚᱛᱚ ᱠᱚ ᱵᱩᱡᱷᱟᱹᱣ ᱠᱮᱫᱟ?", roman: "Chi joto ko bujhau keda?", phonetic: "CHEE JO-TO KO BOO-JHAW KAY-DA?" }
  }
];

// -----------------------------------------------------------------------------
// 3. NIPUN BHARAT OUTCOMES MATRIX (FLN Guidelines - Jharkhand MTB-MLE)
// -----------------------------------------------------------------------------
export const NIPUN_OUTCOMES_MATRIX = [
  {
    code: "L1.1",
    domain: "Literacy",
    grade: "Grade 1 (Balvatika)",
    lakshya: "Converses freely with teachers & peers in tribal mother tongue",
    description: "Oral expression, listening comprehension, and telling simple stories.",
    pedagogyGuide: "Encourage children to narrate daily experiences in Santhali / Ho / Mundari first before repeating in Hindi."
  },
  {
    code: "L1.2",
    domain: "Literacy",
    grade: "Grade 1",
    lakshya: "Recognizes initial letter sounds in tribal script and Devanagari",
    description: "Phonological awareness of ᱚ, ᱛ, ᱜ, ᱝ, ᱞ (Ol Chiki) and 𑢹, 𑣉, 𑣏 (Warang Chiti).",
    pedagogyGuide: "Associate tribal letters with physical items (ᱯ = ᱯᱚᱛᱚᱵ / book, ᱫ = ᱫᱟᱨᱮ / tree)."
  },
  {
    code: "L2.1",
    domain: "Literacy",
    grade: "Grade 2",
    lakshya: "Reads 2-3 letter simple familiar words with 80% accuracy",
    description: "Word decoding, blending sounds into syllables.",
    pedagogyGuide: "Use bilingual flashcards with tribal script on front and Hindi meaning on back."
  },
  {
    code: "L3.1",
    domain: "Literacy",
    grade: "Grade 3",
    lakshya: "Reads an age-appropriate unseen passage with fluency (45-60 wpm)",
    description: "Reading comprehension and drawing inferences from text.",
    pedagogyGuide: "Dual-script reading aloud followed by comprehension questions."
  },
  {
    code: "M1.1",
    domain: "Numeracy",
    grade: "Grade 1",
    lakshya: "Counts objects up to 10 and associates quantities with numerals",
    description: "Number sense 1 to 10 in mother tongue.",
    pedagogyGuide: "Count pebbles, leaves, slates in Santhali (ᱢᱤᱫ...ᱢᱚᱬᱮ) or Ho (ᱢᱤᱭᱟᱹᱫ...ᱢᱚᱬᱮᱭᱟᱹ)."
  },
  {
    code: "M1.2",
    domain: "Numeracy",
    grade: "Grade 1",
    lakshya: "Solves simple addition and subtraction problems within 9",
    description: "Concrete object addition / subtraction combining sets.",
    pedagogyGuide: "Real-life word problems set in tribal village market contexts."
  },
  {
    code: "M2.1",
    domain: "Numeracy",
    grade: "Grade 2",
    lakshya: "Reads and writes numbers up to 99 and understands place value",
    description: "Tens and units bundling with tribal number terms.",
    pedagogyGuide: "Bundle sticks into tens (ᱜᱮᱞ) and units."
  },
  {
    code: "M3.1",
    domain: "Numeracy",
    grade: "Grade 3",
    lakshya: "Performs operations up to 999 and applies multiplication",
    description: "Multiplication as repeated addition and division as equal sharing.",
    pedagogyGuide: "Equal distribution of fruits and seeds among children."
  }
];

// -----------------------------------------------------------------------------
// 4. SAMPLE FLN LESSON PASSAGES (Jharkhand Primary MTB-MLE Aligned)
// -----------------------------------------------------------------------------
export const SAMPLE_FLN_LESSONS = [
  {
    id: "fln-1",
    title: "हमारा विद्यालय (ᱟᱵᱚᱣᱟᱜ ᱟᱥᱲᱟ)",
    grade: "Grade 1",
    subject: "FLN Mother-Tongue Bridge",
    sourceText: "यह हमारा स्कूल है। यहाँ हम सब पढ़ने और लिखने आते हैं। हमारे शिक्षक बहुत अच्छे हैं। हम सब मिलकर खेलते हैं और नए शब्द सीखते हैं।",
    sat: {
      script: "ᱱᱚᱣᱟ ᱫᱚ ᱟᱵᱚᱣᱟᱜ ᱟᱥᱲᱟ ᱠᱟᱱᱟ᱾ ᱱᱚᱸᱰᱮ ᱟᱵᱚ ᱥᱟᱱᱟᱢ ᱠᱚ ᱯᱟᱲᱦᱟᱣ ᱟᱨ ᱚᱞ ᱵᱚ ᱦᱤᱡᱩᱜ-ᱟ᱾ ᱟᱵᱚᱨᱮᱱ ᱢᱟᱪᱮᱛ ᱟᱹᱰᱤ ᱵᱷᱟᱹᱜᱤ ᱜᱮᱭᱟᱠᱚ᱾ ᱟᱵᱚ ᱥᱟᱱᱟᱢ ᱠᱚ ᱢᱤᱫ ᱥᱟᱶᱛᱮ ᱵᱚ ᱮᱱᱮᱡ-ᱟ ᱟᱨ ᱱᱟᱶᱟ ᱟᱹᱲᱟᱹ ᱵᱚ ᱪᱮᱫᱚᱜ-ᱟ᱾",
      roman: "Nowa do abowag asṛa kana. Nonḍe abo sanam ko paṛhaw ar ol bo hijug-a. Aboren machet ạḍi bhạgi geyako. Abo sanam ko mit' sawte bo enej-a ar nawa ạṛạ bo chedog-a."
    },
    hoc: {
      script: "ᱱᱮᱭᱟ ᱟᱵᱩᱣᱟᱜ ᱤᱥᱠᱩᱞ ᱛᱟᱱᱟ᱾ ᱱᱮᱱᱫᱚ ᱟᱵᱩ ᱡᱚᱛᱚ ᱠᱚ ᱯᱟᱲᱦᱟᱣ ᱟᱨ ᱚᱞ ᱵᱩ ᱦᱩᱡᱩᱜ-ᱟ᱾ ᱟᱵᱩᱨᱮᱱ ᱢᱟᱪᱮᱫ ᱵᱮᱥ ᱢᱮᱱᱟᱭᱟ᱾",
      roman: "Neya abuwag iskul tana. Nendo abu joto ko paṛhao ar ol bu huju'-a. Aburen mached bes menaya."
    },
    unr: {
      script: "ᱱᱮᱭᱟ ᱟᱵᱩᱣᱟᱜ ᱟᱥᱲᱟ ᱛᱟᱱᱟ᱾ ᱱᱮᱱᱫᱚ ᱟᱵᱩ ᱡᱚᱛᱚ ᱠᱚ ᱯᱟᱲᱦᱟᱣ ᱟᱨ ᱚᱞ ᱵᱩ ᱦᱩᱡᱩᱜ-ᱟ᱾ ᱟᱵᱩᱨᱮᱱ ᱢᱟᱪᱮᱫ ᱵᱮᱥ ᱢᱮᱱᱟᱭᱟ᱾",
      roman: "Neya abuwag asṛa tana. Nendo abu joto ko paṛhao ar ol bu huju'-a. Aburen mached bes menaya."
    },
    vocabulary: [
      { hindi: "स्कूल (School)", sat: "ᱟᱥᱲᱟ (asṛa)", hoc: "ᱤᱥᱠᱩᱞ (iskul)", unr: "ᱟᱥᱲᱟ (asṛa)" },
      { hindi: "पढ़ना (Read)", sat: "ᱯᱟᱲᱦᱟᱣ (paṛhaw)", hoc: "ᱯᱟᱲᱦᱟᱣ (paṛhao)", unr: "ᱯᱟᱲᱦᱟᱣ (paṛhao)" },
      { hindi: "लिखना (Write)", sat: "ᱚᱞ (ol)", hoc: "ᱚᱞ (ol)", unr: "ᱚᱞ (ol)" },
      { hindi: "शिक्षक (Teacher)", sat: "ᱢᱟᱪᱮᱛ (machet)", hoc: "ᱢᱟᱪᱮᱫ (mached)", unr: "ᱢᱟᱪᱮᱫ (mached)" }
    ]
  },
  {
    id: "fln-2",
    title: "पेड़ और जल (ᱫᱟᱨᱮ ᱟᱨ ᱫᱟᱜ)",
    grade: "Grade 2",
    subject: "Environmental Literacy & FLN",
    sourceText: "गाँव के पास एक बड़ा आम का पेड़ है। पेड़ हमें मीठे फल और छाया देता है। हमें पेड़ों को पानी देना चाहिए।",
    sat: {
      script: "ᱟᱛᱳ ᱥᱩᱨ ᱨᱮ ᱢᱤᱫᱴᱟᱝ ᱢᱟᱨᱟᱝ ᱩᱞ ᱫᱟᱨᱮ ᱢᱮᱱᱟᱜ-ᱟ᱾ ᱫᱟᱨᱮ ᱫᱚ ᱟᱵᱚ ᱦᱮᱲᱮᱢ ᱡᱚ ᱟᱨ ᱨᱮᱭᱟᱲ ᱩᱢᱩᱞ ᱮᱢᱟᱵᱚᱱᱟ᱾ ᱟᱵᱚ ᱫᱟᱨᱮ ᱨᱮ ᱫᱟᱜ ᱫᱩᱞ ᱞᱟᱹᱠᱛᱤ ᱠᱟᱱᱟ᱾",
      roman: "Ato sur re mit'tang maraṅ ul dare mena'-a. Dare do abo heṛem jo ar reyaṛ umul emabona. Abo dare re da' dul lạkti kana."
    },
    hoc: {
      script: "ᱦᱟᱛᱩ ᱥᱩᱨ ᱨᱮ ᱢᱤᱭᱟᱹᱫ ᱩᱞ ᱫᱟᱨᱩ ᱢᱮᱱᱟᱜ-ᱟ᱾ ᱫᱟᱨᱩ ᱟᱵᱩ ᱦᱮᱲᱮᱢ ᱡᱚ ᱟᱨ ᱩᱢᱩᱞ ᱮᱢᱟᱵᱩᱣᱟ᱾ ᱟᱵᱩ ᱫᱟᱨᱩ ᱨᱮ ᱫᱟᱜ ᱫᱩᱞ ᱫᱚᱨᱠᱟᱨ᱾",
      roman: "Hatu sur re miyad ul daru mena'-a. Daru abu heṛem jo ar umul emabuwa. Abu daru re da' dul dorkar."
    },
    unr: {
      script: "ᱦᱟᱛᱩ ᱥᱩᱨ ᱨᱮ ᱢᱤᱭᱟᱹᱫ ᱩᱞ ᱫᱟᱨᱩ ᱢᱮᱱᱟᱜ-ᱟ᱾ ᱫᱟᱨᱩ ᱟᱵᱩ ᱦᱮᱲᱮᱢ ᱡᱚ ᱟᱨ ᱩᱢᱩᱞ ᱮᱢᱟᱵᱩᱣᱟ᱾ ᱟᱵᱩ ᱫᱟᱨᱩ ᱨᱮ ᱫᱟᱜ ᱫᱩᱞ ᱫᱚᱨᱠᱟᱨ᱾",
      roman: "Hatu sur re miad ul daru mena'-a. Daru abu heṛem jo ar umul emabuwa. Abu daru re da' dul dorkar."
    },
    vocabulary: [
      { hindi: "गाँव (Village)", sat: "ᱟᱛᱳ (ato)", hoc: "ᱦᱟᱛᱩ (hatu)", unr: "ᱦᱟᱛᱩ (hatu)" },
      { hindi: "पेड़ (Tree)", sat: "ᱫᱟᱨᱮ (dare)", hoc: "ᱫᱟᱨᱩ (daru)", unr: "ᱫᱟᱨᱩ (daru)" },
      { hindi: "फल (Fruit)", sat: "ᱡᱚ (jo)", hoc: "ᱡᱚ (jo)", unr: "ᱡᱚ (jo)" },
      { hindi: "पानी (Water)", sat: "ᱫᱟᱜ (da')", hoc: "ᱫᱟᱜ (da')", unr: "ᱫᱟᱜ (da')" }
    ]
  }
];
