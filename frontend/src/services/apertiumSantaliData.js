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
// 4. SAMPLE FLN LESSON PASSAGES (Grade 1, Grade 2, Grade 3 FLN Curriculum)
// -----------------------------------------------------------------------------
export const SAMPLE_FLN_LESSONS = [
  // Grade 1 - Literacy (L1.2)
  {
    id: "fln-1",
    title: "हमारा विद्यालय और अक्षर पहचान (ᱟᱵᱚᱣᱟᱜ ᱟᱥᱲᱟ ᱟᱨ ᱪᱤᱠᱤ)",
    grade: "Grade 1",
    domain: "Literacy",
    competencyCode: "L1.2",
    subject: "FLN Mother-Tongue Bridge",
    sourceText: "यह हमारा स्कूल है। यहाँ हम सब पढ़ने और लिखने आते हैं। हमारे शिक्षक बहुत अच्छे हैं। हम सब मिलकर खेलते हैं और नए शब्द सीखते हैं।",
    confidence: 0.98,
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
    teacherScript: {
      hindi: "बच्चों! आज हम सब मिलकर अपने स्कूल के बारे में बात करेंगे और 'प' (ᱯ) अक्षर से शुरू होने वाले शब्द सीखेंगे।",
      sat: { script: "ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ! ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱟᱵᱚᱣᱟᱜ ᱟᱥᱲᱟ ᱵᱟᱵᱚᱛ ᱵᱚ ᱜᱟᱞᱢᱟᱨᱟᱣ-ᱟ ᱟᱨ 'ᱯ' ᱪᱤᱠᱤ ᱨᱮᱱᱟᱜ ᱟᱹᱲᱟᱹ ᱵᱚ ᱪᱮᱫᱚᱜ-ᱟ᱾", roman: "Gidrạ ko! Teheñ abo abowag asṛa babot bo galmaraw-a ar 'P' chiki renag ạṛạ bo chedog-a." },
      hoc: { script: "ᱦᱚᱯᱚᱱ ᱠᱚ! ᱛᱤᱥᱤᱝ ᱟᱵᱩ ᱤᱥᱠᱩᱞ ᱵᱟᱵᱚᱛ ᱵᱩ ᱠᱟᱡᱤ-ᱭᱟ ᱟᱨ 'ᱯ' ᱪᱤᱠᱤ ᱵᱩ ᱪᱮᱫᱚᱜ-ᱟ᱾", roman: "Hopon ko! Tising abu iskul babot bu kaji-ya ar 'P' chiki bu chedog-a." }
    },
    vocabulary: [
      { hindi: "स्कूल (School)", sat: "ᱟᱥᱲᱟ (asṛa)", hoc: "ᱤᱥᱠᱩᱞ (iskul)", unr: "ᱟᱥᱲᱟ (asṛa)" },
      { hindi: "पढ़ना (Read)", sat: "ᱯᱟᱲᱦᱟᱣ (paṛhaw)", hoc: "ᱯᱟᱲᱦᱟᱣ (paṛhao)", unr: "ᱯᱟᱲᱦᱟᱣ (paṛhao)" },
      { hindi: "लिखना (Write)", sat: "ᱚᱞ (ol)", hoc: "ᱚᱞ (ol)", unr: "ᱚᱞ (ol)" },
      { hindi: "शिक्षक (Teacher)", sat: "ᱢᱟᱪᱮᱛ (machet)", hoc: "ᱢᱟᱪᱮᱫ (mached)", unr: "ᱢᱟᱪᱮᱫ (mached)" }
    ]
  },

  // Grade 1 - Numeracy (M1.1)
  {
    id: "fln-1b",
    title: "पहला कदम: १ से ५ तक गिनती (ᱯᱩᱭᱞᱩ ᱛᱟᱲᱟᱢ: ᱑ ᱠᱷᱚᱱ ᱕ ᱞᱮᱠᱷᱟ)",
    grade: "Grade 1",
    domain: "Numeracy",
    competencyCode: "M1.1",
    subject: "Foundational Numeracy 1-5",
    sourceText: "हाथ में पाँच उंगलियाँ हैं। एक, दो, तीन, चार, पाँच। हम सब मिलकर कंकड़ गिनेंगे।",
    confidence: 0.99,
    sat: {
      script: "ᱛᱤ ᱨᱮ ᱢᱚᱬᱮ (᱕) ᱠᱟᱹᱴᱩᱵ ᱢᱮᱱᱟᱜ-ᱟ᱾ ᱢᱤᱫ, ᱵᱟᱨ, ᱯᱮ, ᱯᱩᱱ, ᱢᱚᱬᱮ᱾ ᱟᱵᱚ ᱥᱟᱱᱟᱢ ᱠᱚ ᱢᱤᱫ ᱥᱟᱶᱛᱮ ᱫᱷᱤᱨᱤ ᱵᱚ ᱞᱮᱠᱷᱟᱭᱟ᱾",
      roman: "Ti re mõṛẽ (5) kạtub mena'-a. Mit', bar, pe, pun, mõṛẽ. Abo sanam ko mit' sawte dhiri bo lekhaya."
    },
    hoc: {
      script: "ᱛᱤ ᱨᱮ ᱢᱚᱬᱮᱭᱟᱹ ᱜᱟᱱᱰᱩ ᱢᱮᱱᱟᱜ-ᱟ᱾ ᱢᱤᱭᱟᱹᱫ, ᱵᱟᱹᱨᱤᱭᱟᱹ, ᱟᱹᱯᱤᱭᱟᱹ, ᱩᱯᱩᱱᱤᱭᱟᱹ, ᱢᱚᱬᱮᱭᱟᱹ᱾",
      roman: "Ti re mõṛẽya gandu mena'-a. Miyad, baria, apia, upunia, mõṛẽya."
    },
    unr: {
      script: "ᱛᱤ ᱨᱮ ᱢᱚᱬᱮᱭᱟᱹ ᱜᱟᱱᱰᱩ ᱢᱮᱱᱟᱜ-ᱟ᱾ ᱢᱤᱭᱟᱹᱫ, ᱵᱟᱹᱨᱤᱭᱟᱹ, ᱟᱹᱯᱤᱭᱟᱹ, ᱩᱯᱩᱱᱤᱭᱟᱹ, ᱢᱚᱬᱮᱭᱟᱹ᱾",
      roman: "Ti re mõṛẽya gandu mena'-a. Miad, baria, apia, upunia, mõṛẽya."
    },
    teacherScript: {
      hindi: "बच्चों! अपनी उंगलियाँ दिखाइए और मेरे साथ संथाली में १ से ५ तक गिनिए।",
      sat: { script: "ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ! ᱟᱯᱮᱭᱟᱜ ᱠᱟᱹᱴᱩᱵ ᱩᱫᱩᱜ ᱯᱮ ᱟᱨ ᱤᱧ ᱥᱟᱶ ᱑ ᱠᱷᱚᱱ ᱕ ᱦᱟᱹᱵᱤᱡ ᱞᱮᱠᱷᱟᱭ ᱯᱮ᱾", roman: "Gidrạ ko! Apeyag kạtub udug pe ar iñ saw 1 khon 5 hạbij lekhay pe." },
      hoc: { script: "ᱦᱚᱯᱚᱱ ᱠᱚ! ᱟᱯᱮᱭᱟᱜ ᱛᱤ ᱩᱫᱩᱜ ᱯᱮ ᱟᱨ ᱑ ᱠᱷᱚᱱ ᱕ ᱞᱮᱠᱷᱟᱭ ᱯᱮ᱾", roman: "Hopon ko! Apeyag ti udug pe ar 1 khon 5 lekhay pe." }
    },
    vocabulary: [
      { hindi: "एक (1)", sat: "ᱢᱤᱫ (mit')", hoc: "ᱢᱤᱭᱟᱹᱫ (miyad)", unr: "ᱢᱤᱭᱟᱹᱫ (miad)" },
      { hindi: "दो (2)", sat: "ᱵᱟᱨ (bar)", hoc: "ᱵᱟᱹᱨᱤᱭᱟᱹ (baria)", unr: "ᱵᱟᱹᱨᱤᱭᱟᱹ (baria)" },
      { hindi: "तीन (3)", sat: "ᱯᱮ (pe)", hoc: "ᱟᱹᱯᱤᱭᱟᱹ (apia)", unr: "ᱟᱹᱯᱤᱭᱟᱹ (apia)" },
      { hindi: "पाँच (5)", sat: "ᱢᱚᱬᱮ (mõṛẽ)", hoc: "ᱢᱚᱬᱮᱭᱟᱹ (mõṛẽya)", unr: "ᱢᱚᱬᱮᱭᱟᱹ (mõṛẽya)" }
    ]
  },

  // Grade 2 - Literacy (L2.1)
  {
    id: "fln-2",
    title: "पेड़ और जल (ᱫᱟᱨᱮ ᱟᱨ ᱫᱟᱜ)",
    grade: "Grade 2",
    domain: "Literacy",
    competencyCode: "L2.1",
    subject: "Environmental Literacy & FLN",
    sourceText: "गाँव के पास एक बड़ा आम का पेड़ है। पेड़ हमें मीठे फल और छाया देता है। हमें पेड़ों को पानी देना चाहिए।",
    confidence: 0.97,
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
    teacherScript: {
      hindi: "बच्चों! आज हम प्रकृति के बारे में पढ़ेंगे। पेड़ हमारे सबसे अच्छे मित्र हैं।",
      sat: { script: "ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ! ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱥᱤᱨᱡᱚᱱ ᱵᱟᱵᱚᱛ ᱵᱚ ᱯᱟᱲᱦᱟᱣ-ᱟ᱾ ᱫᱟᱨᱮ ᱫᱚ ᱟᱵᱚᱨᱮᱱ ᱟᱹᱰᱤ ᱵᱷᱟᱹᱜᱤ ᱜᱟᱛᱮ ᱠᱟᱱᱟᱠᱚ᱾", roman: "Gidrạ ko! Teheñ abo sirjon babot bo paṛhaw-a. Dare do aboren ạḍi bhạgi gate kanako." },
      hoc: { script: "ᱦᱚᱯᱚᱱ ᱠᱚ! ᱛᱤᱥᱤᱝ ᱟᱵᱩ ᱥᱤᱨᱡᱚᱱ ᱵᱟᱵᱚᱛ ᱵᱩ ᱯᱟᱲᱦᱟᱣ-ᱟ᱾ ᱫᱟᱨᱩ ᱟᱵᱩᱨᱮᱱ ᱜᱟᱛᱮ ᱛᱟᱱᱟ᱾", roman: "Hopon ko! Tising abu sirjon babot bu paṛhao-a. Daru aburen gate tana." }
    },
    vocabulary: [
      { hindi: "गाँव (Village)", sat: "ᱟᱛᱳ (ato)", hoc: "ᱦᱟᱛᱩ (hatu)", unr: "ᱦᱟᱛᱩ (hatu)" },
      { hindi: "पेड़ (Tree)", sat: "ᱫᱟᱨᱮ (dare)", hoc: "ᱫᱟᱨᱩ (daru)", unr: "ᱫᱟᱨᱩ (daru)" },
      { hindi: "फल (Fruit)", sat: "ᱡᱚ (jo)", hoc: "ᱡᱚ (jo)", unr: "ᱡᱚ (jo)" },
      { hindi: "पानी (Water)", sat: "ᱫᱟᱜ (da')", hoc: "ᱫᱟᱜ (da')", unr: "ᱫᱟᱜ (da')" }
    ]
  },

  // Grade 2 - Numeracy (M2.1)
  {
    id: "fln-2b",
    title: "संख्या तुलना और स्थानीय मान (ᱮᱞ ᱛᱩᱞᱟᱹᱡᱚᱠᱷᱟ ᱟᱨ ᱴᱷᱟᱶ ᱢᱟᱱ)",
    grade: "Grade 2",
    domain: "Numeracy",
    competencyCode: "M2.1",
    subject: "Foundational Numeracy & Number Comparison",
    sourceText: "कक्षा में ५ कंकड़ और ३ पत्तियाँ हैं। कंकड़ पत्तियों से अधिक हैं। ५ संख्या ३ से बड़ी है।",
    confidence: 0.96,
    sat: {
      script: "ᱠᱞᱟᱥ ᱨᱮ ᱢᱚᱬᱮ (᱕) ᱫᱷᱤᱨᱤ ᱟᱨ ᱯᱮ (᱓) ᱥᱟᱠᱟᱢ ᱢᱮᱱᱟᱜ-ᱟ᱾ ᱫᱷᱤᱨᱤ ᱫᱚ ᱥᱟᱠᱟᱢ ᱠᱷᱚᱱ ᱰᱷᱮᱨ ᱜᱮᱭᱟ᱾ ᱢᱚᱬᱮ (᱕) ᱮᱞ ᱫᱚ ᱯᱮ (᱓) ᱠᱷᱚᱱ ᱢᱟᱨᱟᱝ ᱜᱮᱭᱟ᱾",
      roman: "Klas re mõṛẽ (5) dhiri ar pe (3) sakam mena'-a. Dhiri do sakam khon ḍher geya. Mõṛẽ (5) el do pe (3) khon maraṅ geya."
    },
    hoc: {
      script: "ᱠᱞᱟᱥ ᱨᱮ ᱢᱚᱬᱮᱭᱟᱹ ᱫᱷᱤᱨᱤ ᱟᱨ ᱟᱹᱯᱤᱭᱟᱹ ᱥᱟᱠᱟᱢ ᱢᱮᱱᱟᱜ-ᱟ᱾ ᱫᱷᱤᱨᱤ ᱥᱟᱠᱟᱢ ᱠᱷᱚᱱ ᱯᱩᱨᱟᱹ ᱢᱮᱱᱟᱜ-ᱟ᱾",
      roman: "Klas re mõṛẽya dhiri ar apia sakam mena'-a. Dhiri sakam khon pura mena'-a."
    },
    unr: {
      script: "ᱠᱞᱟᱥ ᱨᱮ ᱢᱚᱬᱮᱭᱟᱹ ᱫᱷᱤᱨᱤ ᱟᱨ ᱟᱹᱯᱤᱭᱟᱹ ᱥᱟᱠᱟᱢ ᱢᱮᱱᱟᱜ-ᱟ᱾ ᱫᱷᱤᱨᱤ ᱥᱟᱠᱟᱢ ᱠᱷᱚᱱ ᱯᱩᱨᱟᱹ ᱢᱮᱱᱟᱜ-ᱟ᱾",
      roman: "Klas re mõṛẽya dhiri ar apia sakam mena'-a. Dhiri sakam khon pura mena'-a."
    },
    teacherScript: {
      hindi: "बच्चों! आज हम पत्थरों और पत्तियों को गिनकर पता करेंगे कि कौन सी संख्या बड़ी है।",
      sat: { script: "ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ! ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱫᱷᱤᱨᱤ ᱟᱨ ᱥᱟᱠᱟᱢ ᱞᱮᱠᱷᱟ ᱠᱟᱛᱮ ᱵᱚ ᱧᱟᱢᱟ ᱚᱠᱟ ᱮᱞ ᱢᱟᱨᱟᱝ ᱜᱮᱭᱟ᱾", roman: "Gidrạ ko! Teheñ abo dhiri ar sakam lekha kate bo ñama oka el maraṅ geya." },
      hoc: { script: "ᱦᱚᱯᱚᱱ ᱠᱚ! ᱛᱤᱥᱤᱝ ᱟᱵᱩ ᱫᱷᱤᱨᱤ ᱟᱨ ᱥᱟᱠᱟᱢ ᱞᱮᱠᱷᱟ ᱠᱟᱛᱮ ᱵᱩ ᱧᱟᱢᱮᱭᱟ ᱚᱠᱚᱱ ᱮᱞ ᱢᱟᱨᱟᱝ ᱜᱮᱭᱟ᱾", roman: "Hopon ko! Tising abu dhiri ar sakam lekha kate bu ñameya okon el maraṅ geya." }
    },
    vocabulary: [
      { hindi: "गिनना (Count)", sat: "ᱞᱮᱠᱷᱟ (lekha)", hoc: "ᱞᱮᱠᱷᱟ (lekha)", unr: "ᱞᱮᱠᱷᱟ (lekha)" },
      { hindi: "पत्थर (Pebble)", sat: "ᱫᱷᱤᱨᱤ (dhiri)", hoc: "ᱫᱷᱤᱨᱤ (dhiri)", unr: "ᱫᱷᱤᱨᱤ (dhiri)" },
      { hindi: "पत्ता (Leaf)", sat: "ᱥᱟᱠᱟᱢ (sakam)", hoc: "ᱥᱟᱠᱟᱢ (sakam)", unr: "ᱥᱟᱠᱟᱢ (sakam)" },
      { hindi: "बड़ा (Big/Greater)", sat: "ᱢᱟᱨᱟᱝ (maraṅ)", hoc: "ᱢᱟᱨᱟᱝ (maraṅ)", unr: "ᱢᱟᱨᱟᱝ (maraṅ)" }
    ]
  },

  // Grade 3 - Literacy (L3.1)
  {
    id: "fln-3",
    title: "जंगल की सैर और पक्षी (ᱵᱤᱨ ᱫᱟᱬᱟᱬ ᱟᱨ ᱪᱮᱬᱮ ᱠᱚ)",
    grade: "Grade 3",
    domain: "Literacy",
    competencyCode: "L3.1",
    subject: "Reading Fluency & Comprehension",
    sourceText: "गाँव के उत्तर दिशा में एक हरा-भरा जंगल है। सुबह-सुबह चिड़ियाँ मीठे स्वर में गाती हैं। जंगल में स्वच्छ हवा और जल मिलता है।",
    confidence: 0.98,
    sat: {
      script: "ᱟᱛᱳ ᱨᱮᱱᱟᱜ ᱩᱛᱛᱚᱨ ᱥᱮᱫ ᱨᱮ ᱢᱤᱫᱴᱟᱝ ᱦᱟᱹᱨᱤᱭᱟᱹᱲ ᱵᱤᱨ ᱢᱮᱱᱟᱜ-ᱟ᱾ ᱥᱮᱛᱟᱜ-ᱥᱮᱛᱟᱜ ᱪᱮᱬᱮ ᱠᱚ ᱦᱮᱲᱮᱢ ᱨᱟᱦᱟ ᱛᱮᱠᱚ ᱥᱮᱨᱮᱧᱟ᱾ ᱵᱤᱨ ᱨᱮ ᱯᱷᱟᱨᱪᱟ ᱦᱚᱭ ᱟᱨ ᱫᱟᱜ ᱧᱟᱢᱚᱜ-ᱟ᱾",
      roman: "Ato renag uttor sed re mit'tang hạriyaṛ bir mena'-a. Setag-setag cheṇe ko heṛem raha teko sereña. Bir re pharcha hoy ar da' ñamog-a."
    },
    hoc: {
      script: "ᱦᱟᱛᱩ ᱨᱮᱭᱟᱜ ᱩᱛᱛᱚᱨ ᱯᱟᱦᱴᱟ ᱨᱮ ᱢᱤᱭᱟᱹᱫ ᱦᱟᱹᱨᱤᱭᱟᱹᱲ ᱵᱤᱨ ᱢᱮᱱᱟᱜ-ᱟ᱾ ᱥᱮᱛᱟᱜ ᱪᱮᱬᱮ ᱠᱚ ᱥᱮᱨᱮᱧ ᱮᱭᱟ᱾",
      roman: "Hatu reyag uttor pahta re miyad hariyar bir mena'-a. Setag chene ko seren eya."
    },
    unr: {
      script: "ᱦᱟᱛᱩ ᱨᱮᱭᱟᱜ ᱩᱛᱛᱚᱨ ᱯᱟᱦᱴᱟ ᱨᱮ ᱢᱤᱭᱟᱹᱫ ᱦᱟᱹᱨᱤᱭᱟᱹᱲ ᱵᱤᱨ ᱢᱮᱱᱟᱜ-ᱟ᱾ ᱥᱮᱛᱟᱜ ᱪᱮᱬᱮ ᱠᱚ ᱥᱮᱨᱮᱧ ᱮᱭᱟ᱾",
      roman: "Hatu reyag uttor pahta re miyad hariyar bir mena'-a. Setag chene ko seren eya."
    },
    teacherScript: {
      hindi: "बच्चों! आज हम कक्षा ३ के इस पाठ को धाराप्रवाह पढ़ेंगे और नए शब्दों के अर्थ समझेंगे।",
      sat: { script: "ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ! ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱱᱚᱣᱟ ᱯᱟᱴᱷ ᱞᱮᱛᱟᱲ ᱵᱚ ᱯᱟᱲᱦᱟᱣ-ᱟ ᱟᱨ ᱱᱟᱶᱟ ᱟᱹᱲᱟᱹ ᱨᱮᱱᱟᱜ ᱢᱮᱱᱮᱛ ᱵᱚ ᱵᱩᱡᱷᱟᱹᱣ-ᱟ᱾", roman: "Gidrạ ko! Teheñ abo nowa path letaṛ bo paṛhaw-a ar nawa ạṛạ renag menet bo bujhạw-a." },
      hoc: { script: "ᱦᱚᱯᱚᱱ ᱠᱚ! ᱛᱤᱥᱤᱝ ᱟᱵᱩ ᱱᱮᱭᱟ ᱯᱟᱴᱷ ᱵᱩ ᱯᱟᱲᱦᱟᱣ-ᱟ᱾", roman: "Hopon ko! Tising abu neya path bu parhao-a." }
    },
    vocabulary: [
      { hindi: "जंगल (Forest)", sat: "ᱵᱤᱨ (bir)", hoc: "ᱵᱤᱨ (bir)", unr: "ᱵᱤᱨ (bir)" },
      { hindi: "चिड़िया (Bird)", sat: "ᱪᱮᱬᱮ (cheṇe)", hoc: "ᱪᱮᱬᱮ (cheṇe)", unr: "ᱪᱮᱬᱮ (cheṇe)" },
      { hindi: "हवा (Air)", sat: "ᱦᱚᱭ (hoy)", hoc: "ᱦᱚᱭ (hoy)", unr: "ᱦᱚᱭ (hoy)" },
      { hindi: "गाना (Sing)", sat: "ᱥᱮᱨᱮᱧ (sereñ)", hoc: "ᱥᱮᱨᱮᱧ (seren)", unr: "ᱥᱮᱨᱮᱧ (seren)" }
    ]
  },

  // Grade 3 - Numeracy (M3.1)
  {
    id: "fln-3b",
    title: "बराबर बँटवारा और गुणा (ᱥᱚᱢᱟᱱ ᱦᱟᱹᱴᱤᱧ ᱟᱨ ᱜᱩᱬᱟ)",
    grade: "Grade 3",
    domain: "Numeracy",
    competencyCode: "M3.1",
    subject: "Multiplication & Equal Sharing",
    sourceText: "टोकरी में १२ आम हैं। ३ बच्चों में बराबर बाँटने पर हर बच्चे को ४ आम मिलेंगे। ३ गुणा ४ बराबर १२।",
    confidence: 0.97,
    sat: {
      script: "ᱴᱩᱠᱞᱤ ᱨᱮ ᱜᱮᱞᱵᱟᱨ (᱑᱒) ᱩᱞ ᱢᱮᱱᱟᱜ-ᱟ᱾ ᱯᱮ (᱓) ᱜᱤᱫᱽᱨᱟᱹ ᱛᱟᱞᱟ ᱨᱮ ᱥᱚᱢᱟᱱ ᱦᱟᱹᱴᱤᱧ ᱞᱮᱠᱷᱟᱱ ᱡᱚᱛᱚ ᱜᱤᱫᱽᱨᱟᱹ ᱯᱩᱱ (᱔) ᱩᱞ ᱠᱚ ᱧᱟᱢᱟ᱾ ᱓ × ᱔ = ᱑᱒᱾",
      roman: "Tukli re gelbar (12) ul mena'-a. Pe (3) gidrạ tala re soman hạṭiñ lekhan joto gidrạ pun (4) ul ko ñama. 3 x 4 = 12."
    },
    hoc: {
      script: "ᱴᱩᱠᱞᱤ ᱨᱮ ᱑᱒ ᱩᱞ ᱢᱮᱱᱟᱜ-ᱟ᱾ ᱓ ᱦᱚᱯᱚᱱ ᱠᱚ ᱛᱟᱞᱟ ᱨᱮ ᱔ ᱩᱞ ᱠᱚ ᱧᱟᱢᱮᱭᱟ᱾",
      roman: "Tukli re 12 ul mena'-a. 3 hopon ko tala re 4 ul ko ñameya."
    },
    unr: {
      script: "ᱴᱩᱠᱞᱤ ᱨᱮ ᱑᱒ ᱩᱞ ᱢᱮᱱᱟᱜ-ᱟ᱾ ᱓ ᱦᱚᱯᱚᱱ ᱠᱚ ᱛᱟᱞᱟ ᱨᱮ ᱔ ᱩᱞ ᱠᱚ ᱧᱟᱢᱮᱭᱟ᱾",
      roman: "Tukli re 12 ul mena'-a. 3 hopon ko tala re 4 ul ko ñameya."
    },
    teacherScript: {
      hindi: "बच्चों! आज हम फलों को बराबर बाँटकर गुणा की प्रक्रिया सीखेंगे।",
      sat: { script: "ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ! ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱡᱚ ᱥᱚᱢᱟᱱ ᱦᱟᱹᱴᱤᱧ ᱠᱟᱛᱮ ᱜᱩᱬᱟ ᱨᱮᱱᱟᱜ ᱠᱟᱹᱢᱤ ᱵᱚ ᱪᱮᱫᱚᱜ-ᱟ᱾", roman: "Gidrạ ko! Teheñ abo jo soman hạṭiñ kate guṇa renag kami bo chedog-a." },
      hoc: { script: "ᱦᱚᱯᱚᱱ ᱠᱚ! ᱛᱤᱥᱤᱝ ᱟᱵᱩ ᱡᱚ ᱦᱟᱹᱴᱤᱧ ᱠᱟᱛᱮ ᱜᱩᱬᱟ ᱵᱩ ᱪᱮᱫᱚᱜ-ᱟ᱾", roman: "Hopon ko! Tising abu jo hatin kate guna bu chedog-a." }
    },
    vocabulary: [
      { hindi: "बाँटना (Share/Divide)", sat: "ᱦᱟᱹᱴᱤᱧ (hạṭiñ)", hoc: "ᱦᱟᱹᱴᱤᱧ (hatin)", unr: "ᱦᱟᱹᱴᱤᱧ (hatin)" },
      { hindi: "बराबर (Equal)", sat: "ᱥᱚᱢᱟᱱ (soman)", hoc: "ᱥᱚᱢᱟᱱ (soman)", unr: "ᱥᱚᱢᱟᱱ (soman)" },
      { hindi: "गुणा (Multiply)", sat: "ᱜᱩᱬᱟ (guṇa)", hoc: "ᱜᱩᱬᱟ (guna)", unr: "ᱜᱩᱬᱟ (guna)" },
      { hindi: "बारह (12)", sat: "ᱜᱮᱞᱵᱟᱨ (gelbar)", hoc: "ᱜᱮᱞᱵᱟᱨ (gelbar)", unr: "ᱜᱮᱞᱵᱟᱨ (gelbar)" }
    ]
  }
];

// -----------------------------------------------------------------------------
// 5. TWO-WAY CHILD TRIBAL RESPONSES & SPEECH RECOGNITION MAP
// -----------------------------------------------------------------------------
export const CHILD_TRIBAL_RESPONSES = [
  {
    id: "cr-1",
    category: "Comprehension & Affirmation",
    sat: { script: "ᱦᱮᱸ ᱢᱟᱪᱮᱛ, ᱤᱧ ᱵᱩᱡᱷᱟᱹᱣ ᱠᱮᱫᱟᱹᱧ᱾", roman: "Hẽ machet, iñ bujhạw kedañ." },
    hoc: { script: "ᱦᱮᱸ ᱢᱟᱪᱮᱫ, ᱟᱭᱤᱧ ᱵᱩᱡᱷᱟᱹᱣ ᱠᱤᱫᱟᱹᱧ᱾", roman: "Hẽ mached, aying bujhau kidañ." },
    hindi: "हाँ शिक्षक जी, मैंने समझ लिया।",
    english: "Yes teacher, I understood."
  },
  {
    id: "cr-2",
    category: "Comprehension & Affirmation",
    sat: { script: "ᱵᱟᱝ ᱢᱟᱪᱮᱛ, ᱟᱨ ᱢᱤᱫᱫᱷᱟᱣ ᱞᱟᱹᱭ ᱢᱮ᱾", roman: "Baṅ machet, ar middhaw lạy me." },
    hoc: { script: "ᱠᱟ ᱢᱟᱪᱮᱫ, ᱟᱨ ᱢᱤᱥᱟ ᱠᱟᱡᱤ ᱢᱮ᱾", roman: "Ka mached, ar misa kaji me." },
    hindi: "नहीं शिक्षक जी, कृपया एक बार फिर से बताइए।",
    english: "No teacher, please explain once more."
  },
  {
    id: "cr-3",
    category: "Classroom Items",
    sat: { script: "ᱱᱚᱣᱟ ᱫᱚ 'ᱯᱚᱛᱚᱵ' ᱠᱟᱱᱟ᱾", roman: "Nowa do 'Potob' kana." },
    hoc: { script: "ᱱᱮᱭᱟ ᱫᱚ 'ᱯᱩᱛᱷᱤ' ᱛᱟᱱᱟ᱾", roman: "Neya do 'Puthi' tana." },
    hindi: "यह 'किताब' (पोतोब) है।",
    english: "This is a book."
  },
  {
    id: "cr-4",
    category: "Numeracy & Counting",
    sat: { script: "ᱱᱚᱸᱰᱮ ᱯᱮ (᱓) ᱫᱷᱤᱨᱤ ᱢᱮᱱᱟᱜ-ᱟ᱾", roman: "Nonḍe pe (3) dhiri mena'-a." },
    hoc: { script: "ᱱᱮᱱᱫᱚ ᱟᱹᱯᱤᱭᱟᱹ (᱓) ᱫᱷᱤᱨᱤ ᱢᱮᱱᱟᱜ-ᱟ᱾", roman: "Nendo apia (3) dhiri mena'-a." },
    hindi: "यहाँ ३ पत्थर (कंकड़) हैं।",
    english: "Here are 3 pebbles."
  },
  {
    id: "cr-5",
    category: "Numeracy & Counting",
    sat: { script: "ᱢᱚᱬᱮ (᱕) ᱮᱞ ᱫᱚ ᱯᱮ (᱓) ᱠᱷᱚᱱ ᱢᱟᱨᱟᱝ ᱜᱮᱭᱟ᱾", roman: "Mõṛẽ (5) el do pe (3) khon maraṅ geya." },
    hoc: { script: "ᱢᱚᱬᱮᱭᱟᱹ ᱮᱞ ᱟᱹᱯᱤᱭᱟᱹ ᱠᱷᱚᱱ ᱢᱟᱨᱟᱝ ᱜᱮᱭᱟ᱾", roman: "Mõṛẽya el apia khon maraṅ geya." },
    hindi: "५ संख्या ३ से बड़ी है।",
    english: "Number 5 is greater than 3."
  },
  {
    id: "cr-6",
    category: "Classroom Interaction",
    sat: { script: "ᱤᱧ ᱫᱟᱜ ᱧᱩ ᱥᱮᱱᱚᱜ-ᱟᱹᱧ?", roman: "Iñ da' ñu senog-añ?" },
    hoc: { script: "ᱟᱭᱤᱧ ᱫᱟᱜ ᱧᱩ ᱥᱮᱱᱚᱜ-ᱟᱹᱧ?", roman: "Aying da' ñu senog-añ?" },
    hindi: "क्या मैं पानी पीने जा सकता हूँ?",
    english: "May I go drink water?"
  },
  {
    id: "cr-7",
    category: "Letter Sound & Word",
    sat: { script: "'ᱯ' ᱠᱷᱚᱱ ᱫᱚ 'ᱯᱚᱛᱚᱵ' ᱦᱩᱭᱩᱜ-ᱟ᱾", roman: "'P' khon do 'Potob' huyug-a.", phonetic: "P khon do Potob huyuga" },
    hoc: { script: "'ᱯ' ᱠᱷᱚᱱ ᱫᱚ 'ᱯᱩᱛᱷᱤ' ᱦᱩᱭᱩᱜ-ᱟ᱾", roman: "'P' khon do 'Puthi' huyug-a." },
    hindi: "'प' से 'पोतोब' (किताब) होता है।",
    english: "'P' is for 'Potob' (Book)."
  },
  {
    id: "cr-8",
    category: "Nature & Environment",
    sat: { script: "ᱫᱟᱨᱮ ᱟᱵᱚ ᱦᱮᱲᱮᱢ ᱡᱚ ᱮᱢᱟᱵᱚᱱᱟ᱾", roman: "Dare abo heṛem jo emabona." },
    hoc: { script: "ᱫᱟᱨᱩ ᱟᱵᱩ ᱦᱮᱲᱮᱢ ᱡᱚ ᱮᱢᱟᱵᱩᱣᱟ᱾", roman: "Daru abu heṛem jo emabuwa." },
    hindi: "पेड़ हमें मीठे फल देते हैं।",
    english: "Trees give us sweet fruits."
  }
];

// Live Child Tribal Speech Recognition Keywords Map
export const TRIBAL_SPEECH_RECOGNITION_MAP = [
  { patterns: [/johar/i, /ᱡᱚᱦᱟᱨ/i, /नमस्ते/i], sat: "ᱡᱚᱦᱟᱨ", roman: "Johar", hindi: "नमस्ते (Greetings)", category: "Greeting" },
  { patterns: [/he\b/i, /hẽ/i, /हाँ/i, /ᱦᱮᱸ/i, /hen/i], sat: "ᱦᱮᱸ", roman: "Hẽ", hindi: "हाँ (Yes)", category: "Affirmation" },
  { patterns: [/bang/i, /baṅ/i, /nahi/i, /नहीं/i, /ᱵᱟᱝ/i], sat: "ᱵᱟᱝ", roman: "Baṅ", hindi: "नहीं (No)", category: "Affirmation" },
  { patterns: [/he machet/i, /ᱦᱮᱸ ᱢᱟᱪᱮᱛ/i, /yes teacher/i], sat: "ᱦᱮᱸ ᱢᱟᱪᱮᱛ", roman: "Hẽ machet", hindi: "हाँ शिक्षक जी (Yes Teacher)", category: "Classroom" },
  { patterns: [/bang machet/i, /ᱵᱟᱝ ᱢᱟᱪᱮᱛ/i], sat: "ᱵᱟᱝ ᱢᱟᱪᱮᱛ", roman: "Baṅ machet", hindi: "नहीं शिक्षक जी (No Teacher)", category: "Classroom" },
  { patterns: [/potob/i, /ᱯᱚᱛᱚᱵ/i, /kitab/i, /किताब/i, /puthi/i], sat: "ᱯᱚᱛᱚᱵ", roman: "Potob", hindi: "किताब / पुस्तक (Book)", category: "School Item" },
  { patterns: [/pata/i, /ᱯᱟᱴᱟ/i, /slate/i, /स्लेट/i], sat: "ᱯᱟᱴᱟ", roman: "Pata", hindi: "स्लेट (Slate)", category: "School Item" },
  { patterns: [/machet/i, /ᱢᱟᱪᱮᱛ/i, /mached/i, /शिक्षक/i, /guru/i], sat: "ᱢᱟᱪᱮᱛ", roman: "Machet", hindi: "शिक्षक / गुरुजी (Teacher)", category: "People" },
  { patterns: [/asra/i, /asṛa/i, /ᱟᱥᱲᱟ/i, /iskul/i, /school/i], sat: "ᱟᱥᱲᱟ", roman: "Asṛa", hindi: "विद्यालय / स्कूल (School)", category: "School" },
  { patterns: [/parhaw/i, /paṛhaw/i, /ᱯᱟᱲᱦᱟᱣ/i, /parhna/i, /पढ़/i], sat: "ᱯᱟᱲᱦᱟᱣ", roman: "Paṛhaw", hindi: "पढ़ना (Reading / Read)", category: "Action" },
  { patterns: [/ol\b/i, /ᱚᱞ/i, /likhna/i, /लिख/i], sat: "ᱚᱞ", roman: "Ol", hindi: "लिखना (Writing / Write)", category: "Action" },
  { patterns: [/da\b/i, /da'/i, /daag/i, /ᱫᱟᱜ/i, /pani/i, /पानी/i], sat: "ᱫᱟᱜ", roman: "Da'", hindi: "पानी / जल (Water)", category: "Nature" },
  { patterns: [/dare/i, /ᱫᱟᱨᱮ/i, /daru/i, /ped/i, /पेड़/i], sat: "ᱫᱟᱨᱮ", roman: "Dare", hindi: "पेड़ / वृक्ष (Tree)", category: "Nature" },
  { patterns: [/baha/i, /ᱵᱟᱦᱟ/i, /phool/i, /फूल/i], sat: "ᱵᱟᱦᱟ", roman: "Baha", hindi: "फूल (Flower)", category: "Nature" },
  { patterns: [/jo\b/i, /ᱡᱚ/i, /phal/i, /फल/i], sat: "ᱡᱚ", roman: "Jo", hindi: "फल (Fruit)", category: "Nature" },
  { patterns: [/chene/i, /cheṇe/i, /ᱪᱮᱬᱮ/i, /chidiya/i, /चिड़िया/i], sat: "ᱪᱮᱬᱮ", roman: "Cheṇe", hindi: "चिड़िया / पक्षी (Bird)", category: "Nature" },
  { patterns: [/mit/i, /mit'/i, /ᱢᱤᱫ/i, /ek/i, /एक/i, /miyad/i], sat: "ᱢᱤᱫ", roman: "Mit'", hindi: "एक (1)", category: "Number" },
  { patterns: [/bar\b/i, /ᱵᱟᱨ/i, /do\b/i, /दो/i, /baria/i], sat: "ᱵᱟᱨ", roman: "Bar", hindi: "दो (2)", category: "Number" },
  { patterns: [/pe\b/i, /ᱯᱮ/i, /teen/i, /तीन/i, /apia/i], sat: "ᱯᱮ", roman: "Pe", hindi: "तीन (3)", category: "Number" },
  { patterns: [/pun\b/i, /ᱯᱩᱱ/i, /chaar/i, /चार/i, /upunia/i], sat: "ᱯᱩᱱ", roman: "Pun", hindi: "चार (4)", category: "Number" },
  { patterns: [/more/i, /mõṛẽ/i, /ᱢᱚᱬᱮ/i, /paanch/i, /पाँच/i, /panch/i], sat: "ᱢᱚᱬᱮ", roman: "Mõṛẽ", hindi: "पाँच (5)", category: "Number" },
  { patterns: [/marang/i, /maraṅ/i, /ᱢᱟᱨᱟᱝ/i, /bada/i, /बड़ा/i], sat: "ᱢᱟᱨᱟᱝ", roman: "Maraṅ", hindi: "बड़ा (Greater / Big)", category: "Comparison" },
  { patterns: [/hudin/i, /huḍiñ/i, /ᱦᱩᱰᱤᱧ/i, /chhota/i, /छोटा/i], sat: "ᱦᱩᱰᱤᱧ", roman: "Huḍiñ", hindi: "छोटा (Smaller / Small)", category: "Comparison" },
  { patterns: [/bujhaw/i, /bujhạw/i, /ᱵᱩᱡᱷᱟᱹᱣ/i, /samajh/i, /समझ/i], sat: "ᱵᱩᱡᱷᱟᱹᱣ ᱠᱮᱫᱟᱹᱧ", roman: "Bujhạw kedañ", hindi: "समझ लिया (Understood)", category: "Comprehension" }
];

/**
 * Recognizes child tribal speech or phonetics and returns the matched meaning
 * @param {string} transcript Spoken transcript from speech recognition
 * @param {string} langCode 'sat' | 'hoc' | 'unr'
 */
export function recognizeChildTribalSpeech(transcript, langCode = 'sat') {
  if (!transcript || !transcript.trim()) return null;
  const clean = transcript.trim().toLowerCase();

  // 1. Direct match in TRIBAL_SPEECH_RECOGNITION_MAP
  for (const item of TRIBAL_SPEECH_RECOGNITION_MAP) {
    for (const pattern of item.patterns) {
      if (pattern.test(clean)) {
        return {
          matched: true,
          script: item.sat,
          roman: item.roman,
          hindi: item.hindi,
          category: item.category,
          sourceInput: transcript
        };
      }
    }
  }

  // 2. Match in CHILD_TRIBAL_RESPONSES
  for (const resp of CHILD_TRIBAL_RESPONSES) {
    const satScript = resp[langCode]?.script || resp.sat.script;
    const satRoman = resp[langCode]?.roman || resp.sat.roman;
    if (
      clean.includes(satRoman.toLowerCase()) ||
      clean.includes(resp.hindi.toLowerCase()) ||
      satScript.includes(transcript)
    ) {
      return {
        matched: true,
        script: satScript,
        roman: satRoman,
        hindi: resp.hindi,
        category: resp.category,
        sourceInput: transcript
      };
    }
  }

  // Fallback: general recognition
  return {
    matched: false,
    script: transcript,
    roman: transcript,
    hindi: `"${transcript}" (कक्षा अभिव्यक्ति)`,
    category: "General Expression",
    sourceInput: transcript
  };
}

