import pytest
from src.providers.mock import MockTranslationProvider
from src.providers.bhashini import BhashiniProvider, ISO_TO_BHASHINI
from src.providers.indictrans2 import IndicTrans2Provider, ISO_TO_INDICTRANS2
from src.providers.custom_mundari import CustomMundariProvider

@pytest.mark.asyncio
async def test_mock_provider_supports_pairs():
    provider = MockTranslationProvider()
    assert provider.supports_pair("hin", "sat") is True
    assert provider.supports_pair("sat", "hin") is True
    assert provider.supports_pair("hin", "unr") is True
    assert provider.supports_pair("unr", "hin") is True
    assert provider.supports_pair("fra", "deu") is False

@pytest.mark.asyncio
async def test_bhashini_tag_mapping():
    assert ISO_TO_BHASHINI["hin"] == "hi"
    assert ISO_TO_BHASHINI["sat"] == "sat"
    
    bhashini = BhashiniProvider()
    assert bhashini.supports_pair("hin", "sat") is True
    assert bhashini.supports_pair("sat", "hin") is True
    # Mundari is not a standard Bhashini pair
    assert bhashini.supports_pair("hin", "unr") is False

@pytest.mark.asyncio
async def test_indictrans2_tag_mapping():
    assert ISO_TO_INDICTRANS2["hin"] == "hin_Deva"
    assert ISO_TO_INDICTRANS2["sat"] == "sat_Olck"

    indic = IndicTrans2Provider()
    assert indic.supports_pair("hin", "sat") is True
    assert indic.supports_pair("sat", "hin") is True
    assert indic.supports_pair("hin", "unr") is False

@pytest.mark.asyncio
async def test_custom_mundari_provider_support():
    mundari = CustomMundariProvider()
    assert mundari.supports_pair("hin", "unr") is True
    assert mundari.supports_pair("unr", "hin") is True
    assert mundari.supports_pair("hin", "sat") is False
