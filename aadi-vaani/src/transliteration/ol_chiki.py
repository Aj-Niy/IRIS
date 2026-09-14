"""
Ol Chiki (Santali) Script Transliteration & Normalization Utility.
Supports bidirectional conversion between Ol Chiki, Devanagari, and Latin (Romanization).
"""

from typing import Dict

# Ol Chiki to Latin Phonetic Mapping
OL_CHIKI_TO_LATIN: Dict[str, str] = {
    # Vowels
    "ᱚ": "o",
    "ᱟ": "a",
    "ᱤ": "i",
    "ᱩ": "u",
    "ᱮ": "e",
    "ᱳ": "o",
    
    # Consonants
    "ᱛ": "t",
    "ᱜ": "g",
    "ᱝ": "ng",
    "ᱞ": "l",
    "ᱠ": "k",
    "ᱡ": "j",
    "ᱢ": "m",
    "ᱣ": "w",
    "ᱥ": "s",
    "ᱦ": "h",
    "ᱧ": "ny",
    "ᱨ": "r",
    "ᱪ": "c",
    "ᱫ": "d",
    "ᱬ": "n",
    "ᱭ": "y",
    "ᱯ": "p",
    "ᱰ": "d",
    "ᱱ": "n",
    "ᱲ": "r",
    "ᱴ": "t",
    "ᱵ": "b",
    "ᱶ": "v",
    "ᱷ": "h",

    # Modifiers
    "ᱸ": "n",
    "ᱹ": "",
    "ᱺ": "",
    "ᱻ": "",
    "ᱼ": "-",
    "ᱽ": "",

    # Numerals
    "᱐": "0",
    "᱑": "1",
    "᱒": "2",
    "᱓": "3",
    "᱔": "4",
    "᱕": "5",
    "᱖": "6",
    "᱗": "7",
    "᱘": "8",
    "᱙": "9",
}

# Ol Chiki to Devanagari Mapping
OL_CHIKI_TO_DEVA: Dict[str, str] = {
    "ᱚ": "ऑ",
    "ᱟ": "आ",
    "ᱤ": "इ",
    "ᱩ": "उ",
    "ᱮ": "ए",
    "ᱳ": "ओ",
    
    "ᱛ": "त्",
    "ᱜ": "ग्",
    "ᱝ": "ङ्",
    "ᱞ": "ल्",
    "ᱠ": "क्",
    "ᱡ": "ज्",
    "ᱢ": "म्",
    "ᱣ": "व्",
    "ᱥ": "स्",
    "ᱦ": "ह्",
    "ᱧ": "ञ्",
    "ᱨ": "र्",
    "ᱪ": "च्",
    "ᱫ": "द्",
    "ᱬ": "ण्",
    "ᱭ": "य्",
    "ᱯ": "प्",
    "ᱰ": "ड्",
    "ᱱ": "न्",
    "ᱲ": "ड़्",
    "ᱴ": "ट्",
    "ᱵ": "ब्",
    "ᱶ": "व्",
    "ᱷ": "ह्",

    "ᱸ": "ँ",
    "ᱹ": "",
    "ᱺ": "",
    "ᱻ": "",
    "ᱼ": "-",
    "ᱽ": "्",

    "᱐": "०",
    "᱑": "१",
    "᱒": "२",
    "᱓": "३",
    "᱔": "४",
    "᱕": "५",
    "᱖": "६",
    "᱗": "७",
    "᱘": "८",
    "᱙": "९",
}

LATIN_TO_OL_CHIKI: Dict[str, str] = {v: k for k, v in OL_CHIKI_TO_LATIN.items() if v}

def is_ol_chiki(text: str) -> bool:
    """Returns True if text contains characters within the Unicode Ol Chiki range (U+1C50 to U+1C7F)."""
    return any(0x1C50 <= ord(c) <= 0x1C7F for c in text)

def ol_chiki_to_latin(text: str) -> str:
    """Converts Santali Ol Chiki text into Latin Romanization."""
    result = []
    for char in text:
        result.append(OL_CHIKI_TO_LATIN.get(char, char))
    return "".join(result)

def ol_chiki_to_devanagari(text: str) -> str:
    """Converts Santali Ol Chiki text into phonetic Devanagari approximation."""
    result = []
    for char in text:
        result.append(OL_CHIKI_TO_DEVA.get(char, char))
    return "".join(result)

DEVA_TO_OL_CHIKI: Dict[str, str] = {
    # Independent vowels
    "अ": "ᱚ", "आ": "ᱟ", "इ": "ᱤ", "ई": "ᱤ",
    "उ": "ᱩ", "ऊ": "ᱩ", "ऋ": "ᱨᱤ",
    "ए": "ᱮ", "ऐ": "ᱮ", "ओ": "ᱳ", "औ": "ᱳ",
    
    # Dependent vowel matras
    "ा": "ᱟ", "ि": "ᱤ", "ी": "ᱤ",
    "ु": "ᱩ", "ू": "ᱩ", "ृ": "ᱨᱤ",
    "े": "ᱮ", "ै": "ᱮ", "ो": "ᱳ", "ौ": "ᱳ",
    
    # Consonants
    "क": "ᱠ", "ख": "ᱠᱷ", "ग": "ᱜ", "घ": "ᱜᱷ", "ङ": "ᱝ",
    "च": "ᱪ", "छ": "ᱪᱷ", "ज": "ᱡ", "झ": "ᱡᱷ", "ञ": "ᱧ",
    "ट": "ᱴ", "ठ": "ᱴᱷ", "ड": "ᱰ", "ढ": "ᱰᱷ", "ण": "ᱬ",
    "त": "ᱛ", "थ": "ᱛᱷ", "द": "ᱫ", "ध": "ᱫᱷ", "न": "ᱱ",
    "प": "ᱯ", "फ": "ᱯᱷ", "ब": "ᱵ", "भ": "ᱵᱷ", "म": "ᱢ",
    "य": "ᱭ", "र": "ᱨ", "ल": "ᱞ", "व": "ᱣ",
    "श": "ᱥ", "ष": "ᱥ", "स": "ᱥ", "ह": "ᱦ",
    "ड़": "ᱲ", "ढ़": "ᱲᱷ",
    
    # Signs & modifiers
    "ँ": "ᱸ", "ं": "ᱸ", "ः": "ᱦ", "्": "ᱽ",
    "।": "᱾", "॥": "᱿",
    
    # Numerals
    "०": "᱐", "१": "᱑", "२": "᱒", "३": "᱓", "४": "᱔",
    "५": "᱕", "६": "᱖", "७": "᱗", "८": "᱘", "९": "᱙"
}

def devanagari_to_ol_chiki(text: str) -> str:
    """Converts Devanagari text into Santali Ol Chiki script."""
    result = []
    i = 0
    while i < len(text):
        char = text[i]
        # Check two-character conjuncts like ड़, ढ़
        if i + 1 < len(text) and text[i:i+2] in DEVA_TO_OL_CHIKI:
            result.append(DEVA_TO_OL_CHIKI[text[i:i+2]])
            i += 2
            continue
        if char in DEVA_TO_OL_CHIKI:
            result.append(DEVA_TO_OL_CHIKI[char])
        else:
            result.append(char)
        i += 1
    return "".join(result)

def normalize_santali_script(text: str, target_script: str = "ol_chiki") -> str:
    """
    Normalizes Santali text into the desired script ('ol_chiki', 'latin', 'devanagari').
    If text is already in the target format or script is unspecified, returns input.
    """
    if not text:
        return text

    script = target_script.lower().strip()
    if script in ("latin", "latn", "roman"):
        return ol_chiki_to_latin(text)
    elif script in ("devanagari", "deva", "hindi"):
        return ol_chiki_to_devanagari(text)
    elif script in ("ol_chiki", "olck", "santali"):
        if not is_ol_chiki(text):
            return devanagari_to_ol_chiki(text)
    return text

