"""
Warang Citi (Ho Language) Script Transliteration & Normalization Utility.
Supports bidirectional phonetic conversion between Warang Citi, Devanagari, and Latin scripts.
Unicode range for Warang Citi: U+118A0 to U+118FF.
"""

from typing import Dict, Optional

# Devanagari to Warang Citi Phonetic Character Map
DEVA_TO_WARANG_CITI: Dict[str, str] = {
    # Independent Vowels
    "अ": "\U000118A1", # A 𑢡
    "आ": "\U000118A1\U000118A1", # AA
    "इ": "\U000118A6", # II 𑢦
    "ई": "\U000118A6", # II 𑢦
    "उ": "\U000118A7", # UU 𑢧
    "ऊ": "\U000118A7", # UU 𑢧
    "ए": "\U000118A8", # E 𑢨
    "ऐ": "\U000118A8\U000118A6", # AI
    "ओ": "\U000118A9", # O 𑢩
    "औ": "\U000118A9\U000118A7", # AU
    
    # Dependent Vowel Matras
    "ा": "\U000118A1",
    "ि": "\U000118A6",
    "ी": "\U000118A6",
    "ु": "\U000118A7",
    "ू": "\U000118A7",
    "े": "\U000118A8",
    "ै": "\U000118A8\U000118A6",
    "ो": "\U000118A9",
    "ौ": "\U000118A9\U000118A7",

    # Consonants
    "क": "\U000118AC", # KO 𑢬
    "ख": "\U000118AC\U000118BC", # KHO (KO + HAR)
    "ग": "\U000118AB", # GA 𑢫
    "घ": "\U000118AB\U000118BC", # GHA
    "ङ": "\U000118A0", # NGAA 𑢠

    "च": "\U000118AF", # UC 𑢯
    "छ": "\U000118AF\U000118BC", # CHHA
    "ज": "\U000118AE", # YUJ 𑢮
    "झ": "\U000118AE\U000118BC", # JHA
    "ञ": "\U000118AD", # ENY 𑢭

    "ट": "\U000118B2", # TTE 𑢲
    "ठ": "\U000118B2\U000118BC", # TTHA
    "ड": "\U000118B1", # ODD 𑢱
    "ढ": "\U000118B1\U000118BC", # DDHA
    "ण": "\U000118B0", # ENN 𑢰

    "त": "\U000118B5", # AT 𑢵
    "थ": "\U000118B5\U000118BC", # THA
    "द": "\U000118B4", # DA 𑢴
    "ध": "\U000118B4\U000118BC", # DHA
    "न": "\U000118B3", # NUNG 𑢳

    "प": "\U000118B8", # PU 𑢸
    "फ": "\U000118B8\U000118BC", # PHA
    "ब": "\U000118B7", # BU 𑢷
    "भ": "\U000118B7\U000118BC", # BHA
    "म": "\U000118B6", # AM 𑢶

    "य": "\U000118A4", # YA 𑢤
    "र": "\U000118BC", # HAR 𑢼
    "ल": "\U000118BA", # HOLO 𑢺
    "व": "\U000118A2", # WI 𑢢
    "श": "\U000118BD", # SSUU 𑢽
    "ष": "\U000118BD", # SSUU
    "स": "\U000118BE", # SII 𑢾
    "ह": "\U000118B9", # HIYO 𑢹
    "ड़": "\U000118BB", # HORR 𑢻
    "ढ़": "\U000118BB\U000118BC",

    # Signs & Glottal Stop
    "ः": "\U000118B9", # HIYO / Glottal aspiration
    "ँ": "\U000118AA", # ANG
    "ं": "\U000118AA", # ANG
    "्": "", # Virama suppressed in alphabetic script

    # Numerals (0-9)
    "०": "\U000118E0",
    "१": "\U000118E1",
    "२": "\U000118E2",
    "३": "\U000118E3",
    "४": "\U000118E4",
    "५": "\U000118E5",
    "६": "\U000118E6",
    "७": "\U000118E7",
    "८": "\U000118E8",
    "९": "\U000118E9"
}

# Reverse mapping: Warang Citi to Devanagari
WARANG_CITI_TO_DEVA: Dict[str, str] = {
    "\U000118A0": "ङ",
    "\U000118A1": "अ",
    "\U000118A2": "व",
    "\U000118A3": "यु",
    "\U000118A4": "य",
    "\U000118A5": "यो",
    "\U000118A6": "इ",
    "\U000118A7": "उ",
    "\U000118A8": "ए",
    "\U000118A9": "ओ",
    "\U000118AA": "ं",
    "\U000118AB": "ग",
    "\U000118AC": "क",
    "\U000118AD": "ञ",
    "\U000118AE": "ज",
    "\U000118AF": "च",
    "\U000118B0": "ण",
    "\U000118B1": "ड",
    "\U000118B2": "ट",
    "\U000118B3": "न",
    "\U000118B4": "द",
    "\U000118B5": "त",
    "\U000118B6": "म",
    "\U000118B7": "ब",
    "\U000118B8": "प",
    "\U000118B9": "ह",
    "\U000118BA": "ल",
    "\U000118BB": "ड़",
    "\U000118BC": "र",
    "\U000118BD": "श",
    "\U000118BE": "स",
    "\U000118BF": "व",
    "\U000118E0": "०",
    "\U000118E1": "१",
    "\U000118E2": "२",
    "\U000118E3": "३",
    "\U000118E4": "४",
    "\U000118E5": "५",
    "\U000118E6": "६",
    "\U000118E7": "७",
    "\U000118E8": "८",
    "\U000118E9": "९",
}

def is_warang_citi(text: str) -> bool:
    """Returns True if text contains characters within the Unicode Warang Citi range (U+118A0 to U+118FF)."""
    return any(0x118A0 <= ord(c) <= 0x118FF for c in text)

def devanagari_to_warang_citi(text: str) -> str:
    """
    Converts Devanagari-written Ho text into the authentic Warang Citi script.
    """
    result = []
    i = 0
    n = len(text)
    while i < n:
        # Check two-character combinations like ड़, ढ़
        if i + 1 < n and text[i:i+2] in DEVA_TO_WARANG_CITI:
            result.append(DEVA_TO_WARANG_CITI[text[i:i+2]])
            i += 2
            continue

        char = text[i]
        if char in DEVA_TO_WARANG_CITI:
            result.append(DEVA_TO_WARANG_CITI[char])
        else:
            result.append(char)
        i += 1

    return "".join(result)

def warang_citi_to_devanagari(text: str) -> str:
    """
    Converts Warang Citi script characters into phonetic Devanagari approximation.
    """
    result = []
    for char in text:
        result.append(WARANG_CITI_TO_DEVA.get(char, char))
    return "".join(result)

def normalize_ho_script(text: str, target_script: str = "deva") -> str:
    """
    Normalizes Ho language text into the desired script ('deva' / 'devanagari', or 'warang' / 'warang_citi').
    """
    if not text:
        return text

    script = target_script.lower().strip()
    if script in ("warang", "warang_citi", "warc", "ho"):
        if not is_warang_citi(text):
            return devanagari_to_warang_citi(text)
        return text
    elif script in ("deva", "devanagari", "hindi"):
        if is_warang_citi(text):
            return warang_citi_to_devanagari(text)
        return text
    return text
