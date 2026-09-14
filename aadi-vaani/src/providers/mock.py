import asyncio
import time
import re
from typing import Optional, Dict, Any, List
from src.providers.base import BaseTranslationProvider, ProviderResult
from src.transliteration.ol_chiki import devanagari_to_ol_chiki, is_ol_chiki
from src.transliteration.warang_citi import devanagari_to_warang_citi, warang_citi_to_devanagari, is_warang_citi

# Canonical seed phrase pairs
MOCK_CORPUS = {
    # Hindi -> Santali (Ol Chiki)
    ("hin", "sat", "नमस्ते"): "ᱡᱚᱦᱟᱨ",
    ("hin", "sat", "हैलो"): "ᱡᱚᱦᱟᱨ",
    ("hin", "sat", "hello"): "ᱡᱚᱦᱟᱨ",
    ("hin", "sat", "Hello"): "ᱡᱚᱦᱟᱨ",
    ("hin", "sat", "hi"): "ᱡᱚᱦᱟᱨ",
    ("hin", "sat", "Hi"): "ᱡᱚᱦᱟᱨ",
    ("hin", "sat", "आप कैसे हैं?"): "ᱟᱢ ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ?",
    ("hin", "sat", "आप कैसे हैं"): "ᱟᱢ ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ?",
    ("hin", "sat", "धन्यवाद"): "ᱥᱟᱨᱦᱟᱣ",
    ("hin", "sat", "हम स्कूल जा रहे हैं"): "ᱟᱞᱮ ᱤᱥᱠᱩᱞ ᱞᱮ ᱥᱮᱱᱚᱜ ᱠᱟᱱᱟ",
    ("hin", "sat", "पानी"): "ᱫᱟᱜ",
    ("hin", "sat", "घर"): "ᱚᱲᱟᱜ",

    # Santali -> Hindi
    ("sat", "hin", "ᱡᱚᱦᱟᱨ"): "नमस्ते",
    ("sat", "hin", "ᱟᱢ ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ?"): "आप कैसे हैं?",
    ("sat", "hin", "ᱟᱢ ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ"): "आप कैसे हैं?",
    ("sat", "hin", "ᱥᱟᱨᱦᱟᱣ"): "धन्यवाद",
    ("sat", "hin", "ᱫᱟᱜ"): "पानी",
    ("sat", "hin", "ᱚᱲᱟᱜ"): "घर",

    # Hindi -> Mundari (Devanagari script)
    ("hin", "unr", "नमस्ते"): "जोहार",
    ("hin", "unr", "हैलो"): "जोहार",
    ("hin", "unr", "hello"): "जोहार",
    ("hin", "unr", "Hello"): "जोहार",
    ("hin", "unr", "hi"): "जोहार",
    ("hin", "unr", "Hi"): "जोहार",
    ("hin", "unr", "आप कैसे हैं?"): "अम चिलका मेनामा?",
    ("hin", "unr", "आप कैसे हैं"): "अम चिलका मेनामा?",
    ("hin", "unr", "धन्यवाद"): "दोन्यावाद / जोहार",
    ("hin", "unr", "हम स्कूल जा रहे हैं"): "अले इस्कुल सेन ताना",
    ("hin", "unr", "पानी"): "दाः",
    ("hin", "unr", "घर"): "ओड़ाः",

    # Mundari -> Hindi
    ("unr", "hin", "जोहार"): "नमस्ते",
    ("unr", "hin", "अम चिलका मेनामा?"): "आप कैसे हैं?",
    ("unr", "hin", "अले इस्कुल सेन ताना"): "हम स्कूल जा रहे हैं",
    ("unr", "hin", "दाः"): "पानी",
    ("unr", "hin", "ओड़ाः"): "घर",

    # Hindi -> Ho (Devanagari script)
    ("hin", "hoc", "नमस्ते"): "जोहार",
    ("hin", "hoc", "हैलो"): "जोहार",
    ("hin", "hoc", "हेलो"): "जोहार",
    ("hin", "hoc", "hello"): "जोहार",
    ("hin", "hoc", "Hello"): "जोहार",
    ("hin", "hoc", "hi"): "जोहार",
    ("hin", "hoc", "Hi"): "जोहार",
    ("hin", "hoc", "आप कैसे हैं?"): "अम चिलका मेनामा?",
    ("hin", "hoc", "आप कैसे हैं"): "अम चिलका मेनामा?",
    ("hin", "hoc", "धन्यवाद"): "दोन्यावाद / जोहार",
    ("hin", "hoc", "हम स्कूल जा रहे हैं"): "अले इस्कुल सेन तानाले",
    ("hin", "hoc", "पानी"): "दाः",
    ("hin", "hoc", "घर"): "ओड़ाः",

    # Ho -> Hindi
    ("hoc", "hin", "जोहार"): "नमस्ते",
    ("hoc", "hin", "अम चिलका मेनामा?"): "आप कैसे हैं?",
    ("hoc", "hin", "अले इस्कुल सेन तानाले"): "हम स्कूल जा रहे हैं",
    ("hoc", "hin", "दाः"): "पानी",
    ("hoc", "hin", "ओड़ाः"): "घर",

    # English -> Santali
    ("eng", "sat", "hello"): "ᱡᱚᱦᱟᱨ",
    ("eng", "sat", "Hello"): "ᱡᱚᱦᱟᱨ",
    ("eng", "sat", "how are you?"): "ᱟᱢ ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ?",
    ("eng", "sat", "how are you"): "ᱟᱢ ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ?",
    ("eng", "sat", "thank you"): "ᱥᱟᱨᱦᱟᱣ",
    ("eng", "sat", "water"): "ᱫᱟᱜ",
    ("eng", "sat", "home"): "ᱚᱲᱟᱜ",
    ("eng", "sat", "house"): "ᱚᱲᱟᱜ",

    # English -> Mundari
    ("eng", "unr", "hello"): "जोहार",
    ("eng", "unr", "Hello"): "जोहार",
    ("eng", "unr", "how are you?"): "अम चिलका मेनामा?",
    ("eng", "unr", "how are you"): "अम चिलका मेनामा?",
    ("eng", "unr", "thank you"): "दोन्यावाद / जोहार",
    ("eng", "unr", "water"): "दाः",
    ("eng", "unr", "home"): "ओड़ाः",
    ("eng", "unr", "house"): "ओड़ाः",

    # English -> Ho
    ("eng", "hoc", "hello"): "जोहार",
    ("eng", "hoc", "Hello"): "जोहार",
    ("eng", "hoc", "hi"): "जोहार",
    ("eng", "hoc", "Hi"): "जोहार",
    ("eng", "hoc", "how are you?"): "अम चिलका मेनामा?",
    ("eng", "hoc", "how are you"): "अम चिलका मेनामा?",
    ("eng", "hoc", "thank you"): "दोन्यावाद / जोहार",
    ("eng", "hoc", "water"): "दाः",
    ("eng", "hoc", "home"): "ओड़ाः",
    ("eng", "hoc", "house"): "ओड़ाः"
}

# Extensive Hindi to Santali (Ol Chiki) Dictionary
HINDI_TO_SANTALI_DICT = {
    # Multi-word verbal phrases (scanned first)
    "आप कैसे हैं": "ᱟᱢ ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ",
    "तुम कैसे हो": "ᱟᱢ ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ",
    "तू कैसा है": "ᱟᱢ ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ",
    "कैसे हो": "ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ",
    "कैसे हैं": "ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ",
    "कैसा है": "ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ",
    "स्कूल जा रहे हैं": "ᱤᱥᱠᱩᱞ ᱞᱮ ᱥᱮᱱᱚᱜ ᱠᱟᱱᱟ",
    "निकल जा रहा है": "ᱚᱰᱚᱠ ᱪᱟᱞᱟᱜ ᱠᱟᱱᱟ",
    "निकल रहा है": "ᱚᱰᱚᱠᱚᱜ ᱠᱟᱱᱟ",
    "जा रहा हूँ": "ᱪᱟᱞᱟᱜ ᱠᱟᱹᱱᱟᱹᱧ",
    "जा रहा है": "ᱪᱟᱞᱟᱜ ᱠᱟᱱᱟ",
    "जा रहे हैं": "ᱥᱮᱱᱚᱜ ᱠᱟᱱᱟ ᱞᱮ",
    "आ रहा है": "ᱦᱤᱡᱩᱜ ᱠᱟᱱᱟ",
    "खा रहा है": "ᱡᱚᱢᱮᱫᱟ",
    "पी रहा है": "ᱧᱩᱭᱮᱫᱟ",
    "देख रहा है": "ᱧᱮᱞᱮᱫᱟ",
    "बोल रहा है": "ᱨᱚᱲᱮᱫᱟ",
    "सुन रहा है": "ᱟᱧᱡᱚᱢᱮᱫᱟ",
    "कर रहा है": "ᱠᱟᱹᱢᱤ ᱠᱟᱱᱟ",

    # Pronouns
    "मैं": "ᱤᱧ", "मुझे": "ᱤᱧ", "मेरा": "ᱤᱧᱟᱜ", "मेरी": "ᱤᱧᱟᱜ", "मेरे": "ᱤᱧᱟᱜ",
    "तू": "ᱟᱢ", "तुझे": "ᱟᱢ", "तेरा": "ᱟᱢᱟᱜ", "तुम": "ᱟᱢ", "तुम्हें": "ᱟᱢ", "तुम्हारा": "ᱟᱢᱟᱜ",
    "आप": "ᱟᱢ", "आपको": "ᱟᱢ", "आपका": "ᱟᱢᱟᱜ",
    "हम": "ᱟᱞᱮ", "हमें": "ᱟᱞᱮ", "हमारा": "ᱟᱞᱮᱭᱟᱜ",
    "वह": "ᱩᱱᱤ", "उसे": "ᱩᱱᱤ", "उसका": "ᱩᱱᱤᱭᱟᱜ", "उसकी": "ᱩᱱᱤᱭᱟᱜ", "उसके": "ᱩᱱᱤᱭᱟᱜ",
    "वे": "ᱩᱱᱠᱩ", "उन्हें": "ᱩᱱᱠᱩ", "उनका": "ᱩᱱᱠᱩᱣᱟᱜ",
    "यह": "ᱱᱚᱣᱟ", "ये": "ᱱᱩᱠᱩ", "इस": "ᱱᱚᱣᱟ", "इन": "ᱱᱩᱠᱩ",

    # Prepositions & Conjunctions
    "में": "ᱨᱮ", "पर": "ᱪᱮᱛᱟᱱ ᱨᱮ", "से": "ᱠᱷᱚᱱ", "को": "ᱫᱚ",
    "का": "ᱨᱮᱭᱟᱜ", "के": "ᱨᱮᱭᱟᱜ", "की": "ᱨᱮᱭᱟᱜ",
    "और": "ᱟᱨ", "तथा": "ᱟᱨ", "या": "ᱥᱮ", "लेकिन": "ᱢᱮᱱᱠᱷᱟᱱ", "किंतु": "ᱢᱮᱱᱠᱷᱟᱱ",
    "भी": "ᱦᱚᱸ", "ही": "ᱜᱮ", "तक": "ᱦᱟᱹᱵᱤᱡ", "साथ": "ᱥᱟᱶ",

    # Common Nouns
    "घर": "ᱚᱲᱟᱜ", "मकान": "ᱚᱲᱟᱜ", "पानी": "ᱫᱟᱜ", "जल": "ᱫᱟᱜ",
    "खाना": "ᱡᱚᱢᱟᱜ", "भोजन": "ᱫᱟᱠᱟ", "रोटी": "ᱯᱤᱴᱷᱟᱹ", "चावल": "ᱫᱟᱠᱟ",
    "गाँव": "ᱟᱹᱛᱩ", "शहर": "ᱵᱟᱡᱟᱨ", "रास्ता": "ᱦᱚᱨ", "सड़क": "ᱰᱟᱦᱟᱨ",
    "लोग": "ᱦᱚᱲ", "आदमी": "ᱦᱚᱲ", "मनुष्य": "ᱢᱟᱹᱱᱢᱤ", "औरत": "ᱢᱟᱹᱭ", "महिला": "ᱛᱤᱨᱞᱟᱹ",
    "बच्चा": "ᱜᱤᱫᱽᱨᱟᱹ", "लड़का": "ᱠᱚᱲᱟ", "लड़की": "ᱠᱩᱲᱤ",
    "माता": "ᱟᱭᱳ", "माँ": "ᱟᱭᱳ", "पिता": "ᱵᱟᱵᱟ", "बाप": "ᱵᱟᱵᱟ", "भाई": "ᱵᱚᱭᱦᱟ", "बहन": "ᱢᱤᱥᱮᱨᱟ",
    "दोस्त": "ᱜᱟᱛᱮ", "मित्र": "ᱜᱟᱛᱮ", "नाम": "ᱧᱩᱛᱩᱢ", "काम": "ᱠᱟᱹᱢᱤ",
    "बात": "ᱠᱟᱛᱷᱟ", "भाषा": "ᱯᱟᱹᱨᱥᱤ", "बोली": "ᱨᱚᱲ", "किताब": "ᱯᱚᱛᱷᱤ",
    "पेड़": "ᱫᱟᱨᱮ", "वृक्ष": "ᱫᱟᱨᱮ", "फूल": "ᱵᱟᱦᱟ", "फल": "ᱡᱚ",
    "जंगल": "ᱵᱤᱨ", "वन": "ᱵᱤᱨ", "पहाड़": "ᱵᱩᱨᱩ", "नदी": "ᱜᱟᱰᱟ",
    "दिन": "ᱢᱟᱦᱟ", "रात": "ᱧᱤᱫᱟᱹ", "सुबह": "ᱥᱮᱛᱟᱜ", "शाम": "ᱟᱹᱭᱩᱵ",
    "सूरज": "ᱥᱤᱸᱜᱤ", "सूर्य": "ᱥᱤᱸᱜᱤ", "चाँद": "ᱪᱟᱸᱫᱚ", "तारा": "ᱤᱯᱤᱞ",
    "स्कूल": "ᱤᱥᱠᱩᱞ", "विद्यालय": "ᱤᱥᱠᱩᱞ", "दवा": "ᱨᱟᱱ",

    # Verbs
    "निकल": "ᱚᱰᱚᱠ", "निकलना": "ᱚᱰᱚᱠᱚᱜ",
    "जा": "ᱪᱟᱞᱟᱜ", "जाना": "ᱪᱟᱞᱟᱜ",
    "आ": "ᱦᱤᱡᱩᱜ", "आना": "ᱦᱤᱡᱩᱜ",
    "खा": "ᱡᱚᱢ", "पी": "ᱧᱩ", "पीना": "ᱧᱩ",
    "देख": "ᱧᱮᱞ", "देखना": "ᱧᱮᱞ",
    "बोल": "ᱨᱚᱲ", "बोलना": "ᱨᱚᱲ",
    "सुन": "ᱟᱧᱡᱚᱢ", "सुनना": "ᱟᱧᱡᱚᱢ",
    "कर": "ᱠᱚᱨᱟᱣ", "करना": "ᱠᱚᱨᱟᱣ",

    # Auxiliaries & Particles
    "है": "ᱠᱟᱱᱟ", "हूँ": "ᱠᱟᱹᱱᱟᱹᱧ", "हैं": "ᱠᱟᱱᱟ",
    "था": "ᱛᱟᱦᱮᱸ ᱠᱟᱱᱟ", "थी": "ᱛᱟᱦᱮᱸ ᱠᱟᱱᱟ", "थे": "ᱛᱟᱦᱮᱸ ᱠᱟᱱᱟ",
    "होगा": "ᱦᱩᱭᱩᱜᱼᱟ", "नहीं": "ᱵᱟᱝ", "मत": "ᱟᱞᱚ", "हाँ": "ᱦᱮᱸ",

    # Adjectives & Questions
    "अच्छा": "ᱵᱷᱟᱹᱜᱤ", "अच्छी": "ᱵᱷᱟᱹᱜᱤ", "अच्छे": "ᱵᱷᱟᱹᱜᱤ",
    "बुरा": "ᱵᱟᱹᱲᱤᱡ", "बड़ा": "ᱢᱟᱨᱟᱝ", "छोटा": "ᱦᱩᱰᱤᱧ",
    "बहुत": "ᱟᱹᱰᱤ", "ज्यादा": "ᱟᱹᱰᱤ", "कम": "ᱠᱚᱢ",
    "नया": "ᱱᱟᱣᱟ", "पुराना": "ᱢᱟᱨᱮ", "सुंदर": "ᱪᱚᱨᱚᱠ",
    "क्या": "ᱪᱮᱫ", "क्यों": "ᱪᱮᱫᱟᱜ", "कब": "ᱛᱤᱥ", "कहाँ": "ᱚᱠᱟᱨᱮ",
    "कैसे": "ᱪᱮᱫ ᱞᱮᱠᱟ", "कौन": "ᱚᱠᱚᱭ", "कितना": "ᱛᱤᱱᱟᱹᱜ",
    "नमस्ते": "ᱡᱚᱦᱟᱨ", "प्रणाम": "ᱡᱚᱦᱟᱨ", "धन्यवाद": "ᱥᱟᱨᱦᱟᱣ",
    "हैलो": "ᱡᱚᱦᱟᱨ", "हेलो": "ᱡᱚᱦᱟᱨ", "hello": "ᱡᱚᱦᱟᱨ", "Hello": "ᱡᱚᱦᱟᱨ", "hi": "ᱡᱚᱦᱟᱨ", "Hi": "ᱡᱚᱦᱟᱨ"
}

# Extensive Hindi to Mundari (Devanagari) Dictionary
HINDI_TO_MUNDARI_DICT = {
    # Multi-word verbal phrases
    "आप कैसे हैं": "अम चिलका मेनामा",
    "तुम कैसे हो": "अम चिलका मेनामा",
    "तू कैसा है": "अम चिलका मेनामा",
    "कैसे हो": "चिलका मेनामा",
    "कैसे हैं": "चिलका मेनामा",
    "कैसा है": "चिलका मेनामा",
    "स्कूल जा रहे हैं": "इस्कुल सेन तानाले",
    "निकल जा रहा है": "ओडोंक सेन ताना",
    "निकल रहा है": "ओडोंक ताना",
    "जा रहा हूँ": "सेन तानींग",
    "जा रहा है": "सेन ताना",
    "जा रहे हैं": "सेन तानाले",
    "आ रहा है": "हिजूः ताना",
    "खा रहा है": "जोम ताना",
    "पी रहा है": "नूः ताना",
    "देख रहा है": "नेल ताना",
    "बोल रहा है": "काजी ताना",
    "सुन रहा है": "आयुम ताना",
    "कर रहा है": "बाई ताना",

    # Pronouns
    "मैं": "आईंग", "मुझे": "आईंग", "मेरा": "आईंयाः", "मेरी": "आईंयाः", "मेरे": "आईंयाः",
    "तू": "अम", "तुझे": "अम", "तेरा": "अमाः", "तुम": "अम", "तुम्हें": "अम", "तुम्हारा": "अमाः",
    "आप": "अम", "आपको": "अम", "आपका": "अमाः",
    "हम": "अले", "हमें": "अले", "हमारा": "अलेयाः",
    "वह": "एनी", "उसे": "एनी", "उसका": "ऐयाः", "उसकी": "ऐयाः", "उसके": "ऐयाः",
    "वे": "एनको", "उन्हें": "एनको", "उनका": "एनकोवाः",
    "यह": "नेनी", "ये": "नेनको", "इस": "नेनी",

    # Prepositions & Conjunctions
    "में": "रे", "पर": "चेतान रे", "से": "एते", "को": "के",
    "का": "आः", "के": "आः", "की": "आः",
    "और": "ओड़ोः", "तथा": "ओड़ोः", "या": "चाहे", "लेकिन": "मेनदो",
    "भी": "ओ", "ही": "गे", "साथ": "लोः",

    # Common Nouns
    "घर": "ओड़ाः", "मकान": "ओड़ाः", "पानी": "दाः", "जल": "दाः",
    "खाना": "मांडी", "भोजन": "मांडी", "रोटी": "लाद", "चावल": "मांडी",
    "गाँव": "हातु", "शहर": "बाजार", "रास्ता": "होरा", "सड़क": "सड़क",
    "लोग": "होड़ो", "आदमी": "होड़ो", "मनुष्य": "मानमी", "औरत": "कुड़ी",
    "बच्चा": "होन", "लड़का": "कोड़ा", "लड़की": "कुड़ी",
    "माता": "एंगा", "माँ": "एंगा", "पिता": "अपु", "बाप": "अपु", "भाई": "हागा", "बहन": "मिसि",
    "दोस्त": "गाती", "मित्र": "गाती", "नाम": "नुतुम", "काम": "कामी",
    "बात": "काजी", "भाषा": "जगर", "बोली": "जगर", "किताब": "पुथी",
    "पेड़": "दारू", "वृक्ष": "दारू", "फूल": "बा", "फल": "जो",
    "जंगल": "बीर", "वन": "बीर", "पहाड़": "बुरु", "नदी": "गड़ा",
    "दिन": "माः", "रात": "निदा", "सुबह": "सेताः", "शाम": "आयुब",
    "सूरज": "सिंगी", "चाँद": "चांदू", "तारा": "इपिल",
    "स्कूल": "इस्कुल", "दवा": "रान",

    # Verbs
    "निकल": "ओडोंक", "निकलना": "ओडोंक",
    "जा": "सेन", "जाना": "सेन",
    "आ": "हिजूः", "आना": "हिजूः",
    "खा": "जोम", "पी": "नूः", "पीना": "नूः",
    "देख": "नेल", "देखना": "नेल",
    "बोल": "काजी", "बोलना": "काजी",
    "सुन": "आयुम", "सुनना": "आयुम",
    "कर": "बाई", "करना": "बाई",

    # Auxiliaries
    "है": "ताना", "हूँ": "तानींग", "हैं": "तानाको",
    "था": "ताइकेना", "थी": "ताइकेना", "थे": "ताइकेनाको",
    "नहीं": "का", "हाँ": "हें",

    # Adjectives & Questions
    "अच्छा": "बुगी", "बुरा": "एतका", "बड़ा": "मरांग", "छोटा": "हुड़िंग",
    "बहुत": "पुरोः", "कम": "कम", "नया": "नावा", "पुराना": "मारे",
    "सुंदर": "सुगुन",
    "क्या": "चिनाः", "क्यों": "चिनाः लेकाते", "कब": "चिमतांग",
    "कहाँ": "ओकोताः", "कैसे": "चिलका", "कौन": "ओकोय",
    "नमस्ते": "जोहार", "धन्यवाद": "दोन्यावाद / जोहार",
    "हैलो": "जोहार", "हेलो": "जोहार", "hello": "जोहार", "Hello": "जोहार", "hi": "जोहार", "Hi": "जोहार"
}

# Extensive Hindi to Ho (Austroasiatic / Kolhan) Dictionary
HINDI_TO_HO_DICT = {
    # Multi-word verbal & conversational phrases
    "आप कैसे हैं": "अम चिलका मेनामा",
    "तुम कैसे हो": "अम चिलका मेनामा",
    "तू कैसा है": "अम चिलका मेनामा",
    "कैसे हो": "चिलका मेनामा",
    "कैसे हैं": "चिलका मेनामा",
    "कैसा है": "चिलका मेनामा",
    "स्कूल जा रहे हैं": "इस्कुल सेन तानाले",
    "निकल जा रहा है": "ओडोंक सेन ताना",
    "निकल रहा है": "ओडोंक ताना",
    "जा रहा हूँ": "सेन तानींग",
    "जा रहा है": "सेन ताना",
    "जा रहे हैं": "सेन तानाले",
    "आ रहा है": "हिजूः ताना",
    "खा रहा है": "जोम ताना",
    "पी रहा है": "नूः ताना",
    "देख रहा है": "नेल ताना",
    "बोल रहा है": "काजी ताना",
    "सुन रहा है": "आयुम ताना",
    "कर रहा है": "बाई ताना",

    # Pronouns
    "मैं": "आईंग", "मुझे": "आईंग", "मेरा": "आईंयाः", "मेरी": "आईंयाः", "मेरे": "आईंयाः",
    "तू": "अम", "तुझे": "अम", "तेरा": "अमाः", "तुम": "अम", "तुम्हें": "अम", "तुम्हारा": "अमाः",
    "आप": "अम", "आपको": "अम", "आपका": "अमाः",
    "हम": "अले", "हमें": "अले", "हमारा": "अलेयाः",
    "वह": "एनी", "उसे": "एनी", "उसका": "ऐयाः", "उसकी": "ऐयाः", "उसके": "ऐयाः",
    "वे": "एनको", "उन्हें": "एनको", "उनका": "एनकोवाः",
    "यह": "नेनी", "ये": "नेनको", "इस": "नेनी",

    # Prepositions & Conjunctions
    "में": "रे", "पर": "चेतान रे", "से": "एते", "को": "के",
    "का": "आः", "के": "आः", "की": "आः",
    "और": "ओड़ोः", "तथा": "ओड़ोः", "या": "चाहे", "लेकिन": "मेनदो",
    "भी": "ओ", "ही": "गे", "साथ": "लोः",

    # Common Nouns
    "घर": "ओड़ाः", "मकान": "ओड़ाः", "पानी": "दाः", "जल": "दाः",
    "खाना": "मांडी", "भोजन": "मांडी", "रोटी": "लाद", "चावल": "मांडी",
    "गाँव": "हातु", "शहर": "बाजार", "रास्ता": "होरा", "सड़क": "सड़क",
    "लोग": "होड़ो", "आदमी": "होड़ो", "मनुष्य": "मानमी", "औरत": "कुड़ी",
    "बच्चा": "होन", "लड़का": "कोड़ा", "लड़की": "कुड़ी",
    "माता": "एंगा", "माँ": "एंगा", "पिता": "अपु", "बाप": "अपु", "भाई": "हागा", "बहन": "मिसि",
    "दोस्त": "गाती", "मित्र": "गाती", "नाम": "नुतुम", "काम": "कामी",
    "बात": "काजी", "भाषा": "जगर", "बोली": "जगर", "किताब": "पुथी",
    "पेड़": "दारू", "वृक्ष": "दारू", "फूल": "बा", "फल": "जो",
    "जंगल": "बीर", "वन": "बीर", "पहाड़": "बुरु", "नदी": "गड़ा",
    "दिन": "माः", "रात": "निदा", "सुबह": "सेताः", "शाम": "आयुब",
    "सूरज": "सिंगी", "चाँद": "चांदू", "तारा": "इपिल",
    "स्कूल": "इस्कुल", "दवा": "रान",

    # Verbs
    "निकल": "ओडोंक", "निकलना": "ओडोंक",
    "जा": "सेन", "जाना": "सेन",
    "आ": "हिजूः", "आना": "हिजूः",
    "खा": "जोम", "पी": "नूः", "पीना": "नूः",
    "देख": "नेल", "देखना": "नेल",
    "बोल": "काजी", "बोलना": "काजी",
    "सुन": "आयुम", "सुनना": "आयुम",
    "कर": "बाई", "करना": "बाई",

    # Auxiliaries
    "है": "ताना", "हूँ": "तानींग", "हैं": "तानाको",
    "था": "ताइकेना", "थी": "ताइकेना", "थे": "ताइकेनाको",
    "नहीं": "का", "हाँ": "हें",

    # Adjectives & Questions
    "अच्छा": "बुगी", "बुरा": "एतका", "बड़ा": "मरांग", "छोटा": "हुड़िंग",
    "बहुत": "पुरोः", "कम": "कम", "नया": "नावा", "पुराना": "मारे",
    "सुंदर": "सुगुन",
    "क्या": "चिनाः", "क्यों": "चिनाः लेकाते", "कब": "चिमतांग",
    "कहाँ": "ओकोताः", "कैसे": "चिलका", "कौन": "ओकोय",
    "नमस्ते": "जोहार", "धन्यवाद": "दोन्यावाद / जोहार",
    "हैलो": "जोहार", "हेलो": "जोहार", "hello": "जोहार", "Hello": "जोहार", "hi": "जोहार", "Hi": "जोहार"
}


PUNCT_CHARS = set("।॥?!,.:;\"'()[]{}—–-")

def split_word_punct(token: str):
    lead = 0
    while lead < len(token) and token[lead] in PUNCT_CHARS:
        lead += 1
    trail = len(token)
    while trail > lead and token[trail - 1] in PUNCT_CHARS:
        trail -= 1
    return token[:lead], token[lead:trail], token[trail:]

def translate_hindi_to_santali(text: str) -> str:
    """Translates Hindi text to Santali in authentic Ol Chiki script."""
    # First, handle multi-word phrases
    translated = text
    for phrase, replacement in sorted(HINDI_TO_SANTALI_DICT.items(), key=lambda x: len(x[0]), reverse=True):
        if " " in phrase and phrase in translated:
            translated = translated.replace(phrase, replacement)

    # Whitespace split preserves Unicode combining marks
    tokens = translated.split()
    result = []

    for token in tokens:
        lead, word, trail = split_word_punct(token)
        lead_trans = "".join("᱾" if c == "।" else ("᱿" if c == "॥" else c) for c in lead)
        trail_trans = "".join("᱾" if c == "।" else ("᱿" if c == "॥" else c) for c in trail)

        if not word:
            result.append(lead_trans + trail_trans)
            continue

        if is_ol_chiki(word):
            translated_word = word
        elif word in HINDI_TO_SANTALI_DICT:
            translated_word = HINDI_TO_SANTALI_DICT[word]
        else:
            # Phonetic transliteration into authentic Ol Chiki script
            translated_word = devanagari_to_ol_chiki(word)

        result.append(lead_trans + translated_word + trail_trans)

    return " ".join(result)

def translate_hindi_to_mundari(text: str) -> str:
    """Translates Hindi text to Mundari in Devanagari script."""
    translated = text
    for phrase, replacement in sorted(HINDI_TO_MUNDARI_DICT.items(), key=lambda x: len(x[0]), reverse=True):
        if " " in phrase and phrase in translated:
            translated = translated.replace(phrase, replacement)

    tokens = translated.split()
    result = []

    for token in tokens:
        lead, word, trail = split_word_punct(token)
        if not word:
            result.append(lead + trail)
            continue

        if word in HINDI_TO_MUNDARI_DICT:
            translated_word = HINDI_TO_MUNDARI_DICT[word]
        else:
            translated_word = word

        result.append(lead + translated_word + trail)

    return " ".join(result)

def translate_hindi_to_ho(text: str, script_preference: Optional[str] = None) -> str:
    """Translates Hindi text to Ho in Devanagari or Warang Citi script."""
    translated = text
    for phrase, replacement in sorted(HINDI_TO_HO_DICT.items(), key=lambda x: len(x[0]), reverse=True):
        if " " in phrase and phrase in translated:
            translated = translated.replace(phrase, replacement)

    tokens = translated.split()
    result = []

    for token in tokens:
        lead, word, trail = split_word_punct(token)
        if not word:
            result.append(lead + trail)
            continue

        if is_warang_citi(word):
            translated_word = word
        elif word in HINDI_TO_HO_DICT:
            translated_word = HINDI_TO_HO_DICT[word]
        else:
            translated_word = word

        result.append(lead + translated_word + trail)

    deva_text = " ".join(result)
    if script_preference in ("warang", "warang_citi", "warc"):
        return devanagari_to_warang_citi(deva_text)
    return deva_text


# Extensive English/Latin to Hindi Dictionary for multilingual bridging
ENGLISH_TO_HINDI_DICT = {
    # Conversational & Greetings
    "how are you": "आप कैसे हैं",
    "how do you do": "आप कैसे हैं",
    "what is your name": "आपका नाम क्या है",
    "where are you going": "आप कहाँ जा रहे हैं",
    "where are you": "आप कहाँ हैं",
    "good morning": "नमस्ते",
    "good evening": "नमस्ते",
    "good night": "नमस्ते",
    "thank you": "धन्यवाद",
    "thanks": "धन्यवाद",
    "welcome": "स्वागत",
    "hello": "नमस्ते",
    "hi": "नमस्ते",
    "hey": "नमस्ते",
    "greetings": "नमस्ते",
    "namaste": "नमस्ते",
    "johar": "जोहार",
    "we are going to school": "हम स्कूल जा रहे हैं",
    "i am going to school": "मैं स्कूल जा रहा हूँ",
    "i am going": "जा रहा हूँ",
    "going to school": "स्कूल जा रहे हैं",

    # Pronouns
    "i": "मैं", "me": "मुझे", "my": "मेरा", "mine": "मेरा",
    "you": "आप", "your": "आपका", "yours": "आपका",
    "we": "हम", "us": "हमें", "our": "हमारा", "ours": "हमारा",
    "he": "वह", "him": "उसे", "his": "उसका",
    "she": "वह", "her": "उसका",
    "they": "वे", "them": "उन्हें", "their": "उनका",
    "this": "यह", "that": "वह", "these": "ये", "those": "वे",

    # Common Nouns
    "water": "पानी", "food": "खाना", "rice": "चावल", "bread": "रोटी",
    "house": "घर", "home": "घर", "village": "गाँव", "city": "शहर",
    "road": "रास्ता", "way": "रास्ता", "people": "लोग", "person": "व्यक्ति",
    "man": "आदमी", "men": "आदमी", "woman": "औरत", "women": "औरतें",
    "child": "बच्चा", "children": "बच्चे", "boy": "लड़का", "girl": "लड़की",
    "mother": "माँ", "father": "पिता", "brother": "भाई", "sister": "बहन",
    "friend": "दोस्त", "name": "नाम", "work": "काम", "job": "काम",
    "language": "भाषा", "voice": "वाणी", "book": "किताब",
    "tree": "पेड़", "flower": "फूल", "fruit": "फल",
    "forest": "जंगल", "mountain": "पहाड़", "hill": "बुरु", "river": "नदी",
    "day": "दिन", "night": "रात", "morning": "सुबह", "evening": "शाम",
    "sun": "सूरज", "moon": "चाँद", "star": "तारा",
    "school": "स्कूल", "medicine": "दवा",

    # Verbs
    "go": "जाना", "going": "जा रहे", "went": "गया",
    "come": "आना", "coming": "आ रहे", "came": "आया",
    "eat": "खाना", "eating": "खा रहे", "ate": "खाया",
    "drink": "पीना", "drinking": "पी रहे",
    "see": "देखना", "look": "देखना", "watch": "देखना",
    "speak": "बोलना", "talk": "बात", "say": "कहना",
    "hear": "सुनना", "listen": "सुनना",
    "do": "करना", "make": "बनाना",

    # Auxiliaries & Connectors
    "is": "है", "are": "हैं", "am": "हूँ", "was": "था", "were": "थे",
    "and": "और", "or": "या", "but": "लेकिन",
    "in": "में", "on": "पर", "from": "से", "to": "को", "with": "साथ",
    "yes": "हाँ", "no": "नहीं", "not": "नहीं",

    # Adjectives & Questions
    "good": "अच्छा", "bad": "बुरा", "big": "बड़ा", "small": "छोटा",
    "new": "नया", "old": "पुराना", "beautiful": "सुंदर",
    "much": "बहुत", "many": "बहुत", "very": "बहुत",
    "what": "क्या", "why": "क्यों", "when": "कब", "where": "कहाँ",
    "how": "कैसे", "who": "कौन"
}

def translate_english_to_hindi(text: str) -> str:
    """Translates English/Latin text to Hindi using phrase and token dictionary mapping."""
    translated = text.lower()
    for phrase, replacement in sorted(ENGLISH_TO_HINDI_DICT.items(), key=lambda x: len(x[0]), reverse=True):
        if " " in phrase and phrase in translated:
            translated = translated.replace(phrase, replacement)

    tokens = translated.split()
    result = []
    for token in tokens:
        lead, word, trail = split_word_punct(token)
        if not word:
            result.append(lead + trail)
            continue
        tw = ENGLISH_TO_HINDI_DICT.get(word, word)
        result.append(lead + tw + trail)

    return " ".join(result)


class MockTranslationProvider(BaseTranslationProvider):
    """
    Intelligent indigenous translation engine with full vocabulary mapping and Ol Chiki rendering.
    """
    def __init__(
        self,
        name: str = "mock",
        enabled: bool = True,
        simulated_latency_ms: float = 20.0,
        config: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            name=name,
            provider_type="mock",
            enabled=enabled,
            timeout_seconds=2.0,
            config=config or {"simulated_latency_ms": simulated_latency_ms}
        )
        self.simulated_latency_ms = simulated_latency_ms

    def supports_pair(self, source_lang: str, target_lang: str) -> bool:
        src = source_lang.lower().strip()
        tgt = target_lang.lower().strip()
        if src == tgt:
            return True
        supported = {
            ("hin", "sat"), ("sat", "hin"),
            ("hin", "unr"), ("unr", "hin"),
            ("hin", "hoc"), ("hoc", "hin"),
            ("eng", "sat"), ("sat", "eng"),
            ("eng", "unr"), ("unr", "eng"),
            ("eng", "hoc"), ("hoc", "eng"),
            ("eng", "hin"), ("hin", "eng"),
            ("sat", "hoc"), ("hoc", "sat"),
            ("unr", "hoc"), ("hoc", "unr"),
            ("sat", "unr"), ("unr", "sat")
        }
        return (src, tgt) in supported

    async def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str,
        **kwargs
    ) -> ProviderResult:
        start_time = time.perf_counter()
        
        latency_sec = self.simulated_latency_ms / 1000.0
        await asyncio.sleep(latency_sec)

        src = source_lang.lower().strip()
        tgt = target_lang.lower().strip()
        normalized_text = text.strip()
        script_pref = kwargs.get("script_preference")

        # Step 1: Check canonical seed dictionary
        lookup_key = (src, tgt, normalized_text)
        if lookup_key in MOCK_CORPUS:
            translated = MOCK_CORPUS[lookup_key]
            if tgt == "hoc" and script_pref in ("warang", "warang_citi", "warc"):
                translated = devanagari_to_warang_citi(translated)
            confidence = 0.98
        elif src in ("eng", "en") or (
            bool(re.search(r"[a-zA-Z]", normalized_text)) and not any(
                0x0900 <= ord(c) <= 0x097F or 0x1C50 <= ord(c) <= 0x1C7F or 0x118A0 <= ord(c) <= 0x118FF for c in normalized_text
            )
        ):
            # Input is in English or typed with Latin letters: bridge via Hindi
            hindi_bridge = translate_english_to_hindi(normalized_text)
            if tgt == "sat":
                translated = translate_hindi_to_santali(hindi_bridge)
                confidence = 0.90
            elif tgt == "unr":
                translated = translate_hindi_to_mundari(hindi_bridge)
                confidence = 0.88
            elif tgt == "hoc":
                translated = translate_hindi_to_ho(hindi_bridge, script_preference=script_pref)
                confidence = 0.88
            elif tgt in ("hin", "hi"):
                translated = hindi_bridge
                confidence = 0.92
            elif tgt in ("eng", "en"):
                translated = normalized_text
                confidence = 0.95
            else:
                translated = hindi_bridge
                confidence = 0.80
        elif tgt in ("eng", "en"):
            # Target is English: get Hindi representation, then reverse map
            if src == "sat":
                bridge_res = await self.translate(normalized_text, "sat", "hin")
                h_text = bridge_res.translated_text
            elif src == "unr":
                bridge_res = await self.translate(normalized_text, "unr", "hin")
                h_text = bridge_res.translated_text
            elif src == "hoc":
                bridge_res = await self.translate(normalized_text, "hoc", "hin")
                h_text = bridge_res.translated_text
            else:
                h_text = normalized_text
            rev_en = {v: k for k, v in ENGLISH_TO_HINDI_DICT.items() if len(v) > 1}
            tokens = h_text.split()
            res = []
            for token in tokens:
                lead, word, trail = split_word_punct(token)
                tw = rev_en.get(word, word)
                res.append(lead + tw + trail)
            translated = " ".join(res)
            confidence = 0.85
        elif src in ("hin", "hi") and tgt == "sat":
            translated = translate_hindi_to_santali(normalized_text)
            confidence = 0.92
        elif src in ("hin", "hi") and tgt == "unr":
            translated = translate_hindi_to_mundari(normalized_text)
            confidence = 0.88
        elif src in ("hin", "hi") and tgt == "hoc":
            translated = translate_hindi_to_ho(normalized_text, script_preference=script_pref)
            confidence = 0.88
        elif src == "sat" and tgt in ("hin", "hi"):
            # Reverse Santali dictionary lookup
            reverse_dict = {v: k for k, v in HINDI_TO_SANTALI_DICT.items() if len(k) > 1}
            tokens = normalized_text.split()
            res = []
            for token in tokens:
                lead, word, trail = split_word_punct(token)
                lead_trans = "".join("।" if c == "᱾" else ("॥" if c == "᱿" else c) for c in lead)
                trail_trans = "".join("।" if c == "᱾" else ("᱿" if c == "॥" else c) for c in trail)
                if not word:
                    res.append(lead_trans + trail_trans)
                    continue
                tw = reverse_dict.get(word, word)
                res.append(lead_trans + tw + trail_trans)
            translated = " ".join(res)
            confidence = 0.85
        elif src == "unr" and tgt in ("hin", "hi"):
            reverse_dict = {v: k for k, v in HINDI_TO_MUNDARI_DICT.items() if len(k) > 1}
            tokens = normalized_text.split()
            res = []
            for token in tokens:
                lead, word, trail = split_word_punct(token)
                if not word:
                    res.append(lead + trail)
                    continue
                tw = reverse_dict.get(word, word)
                res.append(lead + tw + trail)
            translated = " ".join(res)
            confidence = 0.85
        elif src == "hoc" and tgt in ("hin", "hi"):
            reverse_dict = {v: k for k, v in HINDI_TO_HO_DICT.items() if len(k) > 1}
            norm_ho = warang_citi_to_devanagari(normalized_text) if is_warang_citi(normalized_text) else normalized_text
            tokens = norm_ho.split()
            res = []
            for token in tokens:
                lead, word, trail = split_word_punct(token)
                if not word:
                    res.append(lead + trail)
                    continue
                tw = reverse_dict.get(word, word)
                res.append(lead + tw + trail)
            translated = " ".join(res)
            confidence = 0.85
        elif src in ("sat", "unr") and tgt == "hoc":
            # Bridge translation: tribal source -> Hindi -> Ho
            bridge_hi = await self.translate(normalized_text, src, "hin")
            translated = translate_hindi_to_ho(bridge_hi.translated_text, script_preference=script_pref)
            confidence = 0.82
        elif src == "hoc" and tgt in ("sat", "unr"):
            # Bridge translation: Ho -> Hindi -> tribal target
            bridge_hi = await self.translate(normalized_text, "hoc", "hin")
            if tgt == "sat":
                translated = translate_hindi_to_santali(bridge_hi.translated_text)
            else:
                translated = translate_hindi_to_mundari(bridge_hi.translated_text)
        elif src == tgt:
            # Same language: pass-through or script transliteration if requested
            if tgt == "hoc" and script_pref in ("warang", "warang_citi", "warc") and not is_warang_citi(normalized_text):
                translated = devanagari_to_warang_citi(normalized_text)
            elif tgt == "hoc" and script_pref in ("devanagari", "deva") and is_warang_citi(normalized_text):
                translated = warang_citi_to_devanagari(normalized_text)
            elif tgt == "sat" and script_pref in ("ol_chiki", "olck") and not is_ol_chiki(normalized_text):
                translated = devanagari_to_ol_chiki(normalized_text)
            else:
                translated = normalized_text
            confidence = 1.0
        else:
            translated = devanagari_to_ol_chiki(normalized_text) if tgt == "sat" else normalized_text
            confidence = 0.80

        duration_ms = (time.perf_counter() - start_time) * 1000.0
        self.circuit_breaker.record_success()

        script_name = "devanagari"
        if tgt == "sat" or is_ol_chiki(translated):
            script_name = "ol_chiki"
        elif tgt == "hoc" and is_warang_citi(translated):
            script_name = "warang_citi"

        return ProviderResult(
            translated_text=translated,
            backend_name=self.name,
            latency_ms=round(duration_ms, 2),
            confidence_score=confidence,
            model_identifier="indigenous-lexicon-multi-tribal-v3",
            metadata={"source_length": len(text), "script": script_name}
        )
