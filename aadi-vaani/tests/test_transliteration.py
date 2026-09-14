from src.transliteration.ol_chiki import (
    is_ol_chiki,
    ol_chiki_to_latin,
    ol_chiki_to_devanagari,
    normalize_santali_script
)

def test_is_ol_chiki():
    assert is_ol_chiki("ᱡᱚᱦᱟᱨ") is True
    assert is_ol_chiki("नमस्ते") is False
    assert is_ol_chiki("Johar") is False

def test_ol_chiki_to_latin():
    # ᱡᱚᱦᱟᱨ -> Johar
    res = ol_chiki_to_latin("ᱡᱚᱦᱟᱨ")
    assert res.lower() == "johar"

def test_ol_chiki_to_devanagari():
    # ᱡᱚᱦᱟᱨ -> ज् + ऑ + ह् + आ + र्
    res = ol_chiki_to_devanagari("ᱡᱚᱦᱟᱨ")
    assert len(res) > 0
    assert any(ord(c) >= 0x0900 for c in res)

def test_normalize_santali_script():
    # To Latin
    assert normalize_santali_script("ᱡᱚᱦᱟᱨ", "latin").lower() == "johar"
    # To Ol Chiki (leaves as is)
    assert normalize_santali_script("ᱡᱚᱦᱟᱨ", "ol_chiki") == "ᱡᱚᱦᱟᱨ"

from src.transliteration.warang_citi import (
    is_warang_citi,
    devanagari_to_warang_citi,
    warang_citi_to_devanagari,
    normalize_ho_script
)

def test_is_warang_citi():
    wc_word = devanagari_to_warang_citi("जोहार")
    assert is_warang_citi(wc_word) is True
    assert is_warang_citi("जोहार") is False
    assert is_warang_citi("Hello") is False

def test_devanagari_to_warang_citi():
    res = devanagari_to_warang_citi("जोहार")
    assert len(res) > 0
    assert is_warang_citi(res) is True

def test_warang_citi_to_devanagari():
    wc_word = devanagari_to_warang_citi("जोहार")
    deva_approx = warang_citi_to_devanagari(wc_word)
    assert len(deva_approx) > 0

def test_normalize_ho_script():
    assert is_warang_citi(normalize_ho_script("जोहार", "warang_citi")) is True
    assert normalize_ho_script("जोहार", "deva") == "जोहार"

