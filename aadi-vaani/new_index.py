# -*- coding: utf-8 -*-
"""
Aadi Vaani (आदि वाणी) - Tribal Voice & Text Translation Service Entrypoint
Runs the FastAPI translation router with bilingual & multi-script capabilities.
"""
import sys
import os
from pathlib import Path
import uvicorn

CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from src.router.api import app

def main():
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Starting Aadi Vaani Tribal Translation Engine on http://{host}:{port}")
    uvicorn.run("src.router.api:app", host=host, port=port, reload=False)

if __name__ == "__main__":
    main()
