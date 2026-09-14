WEB_UI_HTML = """<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aadi Vaani (आदि वाणी) - Tribal Voice & Text Translation</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&family=Noto+Sans+Ol+Chiki:wght@500;700&family=Noto+Sans+Warang+Citi&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #1e3a8a;
            --primary-light: #3b82f6;
            --accent: #f59e0b;
            --bg: #0f172a;
            --surface: #1e293b;
            --surface-card: #243048;
            --border: #334155;
            --text: #f8fafc;
            --text-muted: #94a3b8;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Noto Sans', 'Noto Sans Ol Chiki', 'Noto Sans Warang Citi', 'Segoe UI', Tahoma, sans-serif;
        }

        body {
            background-color: var(--bg);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            border-bottom: 1px solid var(--border);
            padding: 1.25rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo-group {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .logo-icon {
            background: linear-gradient(135deg, #f59e0b, #ef4444);
            width: 42px;
            height: 42px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: bold;
        }

        .logo-text h1 {
            font-size: 1.35rem;
            font-weight: 700;
            letter-spacing: -0.02em;
        }

        .logo-text span {
            font-size: 0.8rem;
            color: var(--accent);
            font-weight: 600;
        }

        nav a {
            color: var(--text-muted);
            text-decoration: none;
            margin-left: 1.5rem;
            font-size: 0.9rem;
            transition: color 0.2s;
        }

        nav a:hover {
            color: var(--text);
        }

        .badge-nav {
            background: rgba(59, 130, 246, 0.2);
            color: var(--primary-light);
            padding: 0.25rem 0.6rem;
            border-radius: 20px;
            border: 1px solid rgba(59, 130, 246, 0.4);
            font-size: 0.75rem;
        }

        main {
            flex: 1;
            max-width: 1100px;
            width: 100%;
            margin: 2rem auto;
            padding: 0 1.5rem;
        }

        .hero {
            text-align: center;
            margin-bottom: 2rem;
        }

        .hero h2 {
            font-size: 1.85rem;
            margin-bottom: 0.5rem;
        }

        .hero p {
            color: var(--text-muted);
            font-size: 0.95rem;
        }

        .translator-container {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        }

        .controls-bar {
            background: #182234;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .lang-selector-group {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        select {
            background: var(--surface);
            color: var(--text);
            border: 1px solid var(--border);
            padding: 0.6rem 1rem;
            border-radius: 8px;
            font-size: 0.95rem;
            outline: none;
            cursor: pointer;
        }

        select:focus {
            border-color: var(--primary-light);
        }

        .swap-btn {
            background: transparent;
            border: 1px solid var(--border);
            color: var(--text);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .swap-btn:hover {
            background: var(--surface-card);
            border-color: var(--primary-light);
        }

        .translation-boxes {
            display: grid;
            grid-template-columns: 1fr 1fr;
            min-height: 280px;
        }

        @media (max-width: 768px) {
            .translation-boxes {
                grid-template-columns: 1fr;
            }
        }

        .box {
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .input-box {
            border-right: 1px solid var(--border);
        }

        @media (max-width: 768px) {
            .input-box {
                border-right: none;
                border-bottom: 1px solid var(--border);
            }
        }

        textarea {
            width: 100%;
            flex: 1;
            background: transparent;
            border: none;
            color: var(--text);
            font-size: 1.15rem;
            resize: none;
            outline: none;
            min-height: 180px;
            line-height: 1.6;
        }

        textarea::placeholder {
            color: #64748b;
        }

        .output-box {
            background: #1c273c;
            position: relative;
        }

        .output-text {
            font-size: 1.25rem;
            line-height: 1.6;
            color: #f1f5f9;
            flex: 1;
            min-height: 180px;
            white-space: pre-wrap;
            font-family: 'Noto Sans Warang Citi', 'Noto Sans Ol Chiki', 'Noto Sans', 'Segoe UI', Tahoma, sans-serif;
        }

        .warang-font {
            font-family: 'Noto Sans Warang Citi', sans-serif;
            font-size: 1.05em;
            letter-spacing: 0.04em;
        }

        .ol-chiki-font {
            font-family: 'Noto Sans Ol Chiki', sans-serif;
            font-size: 1.05em;
            letter-spacing: 0.02em;
        }

        .output-placeholder {
            color: #64748b;
            font-style: italic;
        }

        .meta-strip {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 1rem;
            border-top: 1px dashed var(--border);
            font-size: 0.8rem;
            color: var(--text-muted);
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .tags-group {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .tag {
            background: rgba(255, 255, 255, 0.07);
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
        }

        .tag.backend {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success);
            border: 1px solid rgba(16, 185, 129, 0.4);
        }

        .tag.cached {
            background: rgba(245, 158, 11, 0.2);
            color: var(--warning);
            border: 1px solid rgba(245, 158, 11, 0.4);
        }

        /* Voice Control Buttons & Live Meter */
        .audio-controls {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex-wrap: wrap;
        }

        .voice-btn {
            background: var(--surface-card);
            border: 1px solid var(--border);
            color: var(--text);
            padding: 0.5rem 0.9rem;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.45rem;
            transition: all 0.2s;
        }

        .voice-btn:hover {
            border-color: var(--primary-light);
            background: rgba(59, 130, 246, 0.15);
        }

        .voice-btn.recording {
            background: #dc2626;
            border-color: #ef4444;
            color: white;
            animation: pulse-red 1.2s infinite;
        }

        .speak-btn {
            background: rgba(16, 185, 129, 0.15);
            border: 1px solid rgba(16, 185, 129, 0.4);
            color: var(--success);
            padding: 0.45rem 0.9rem;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.4rem;
            transition: all 0.2s;
        }

        .speak-btn:hover {
            background: rgba(16, 185, 129, 0.3);
        }

        .speak-btn.playing {
            background: var(--success);
            color: #0f172a;
        }

        /* Live Audio Visualizer Waves */
        .live-audio-meter {
            display: none;
            align-items: center;
            gap: 3px;
            height: 22px;
            padding: 0 6px;
            background: rgba(0,0,0,0.3);
            border-radius: 6px;
        }

        .meter-bar {
            width: 4px;
            height: 4px;
            background: #ef4444;
            border-radius: 2px;
            transition: height 0.08s ease;
        }

        .rec-hint {
            color: #f87171;
            font-size: 0.8rem;
            display: none;
        }

        @keyframes pulse-red {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        .chips-container {
            margin-top: 1.5rem;
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            align-items: center;
        }

        .chip-label {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-right: 0.25rem;
        }

        .chip {
            background: var(--surface-card);
            border: 1px solid var(--border);
            color: var(--text);
            padding: 0.4rem 0.85rem;
            border-radius: 20px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s;
        }

        .chip:hover {
            background: var(--primary);
            border-color: var(--primary-light);
        }

        .actions-footer {
            padding: 1rem 1.5rem;
            background: #141c2c;
            border-top: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .translate-btn {
            background: linear-gradient(135deg, var(--primary-light), var(--primary));
            color: white;
            border: none;
            padding: 0.75rem 1.75rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            transition: all 0.2s;
        }

        .translate-btn:hover {
            opacity: 0.95;
            transform: translateY(-1px);
        }

        .alert-box {
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.4);
            color: #fca5a5;
            padding: 0.75rem 1.25rem;
            border-radius: 8px;
            margin-top: 1rem;
            font-size: 0.85rem;
            display: none;
        }

        .disclaimer-banner {
            background: rgba(245, 158, 11, 0.15);
            border: 1px solid rgba(245, 158, 11, 0.4);
            color: #fbbf24;
            padding: 0.75rem 1.25rem;
            border-radius: 8px;
            margin-top: 1rem;
            font-size: 0.85rem;
            display: none;
        }

        footer {
            text-align: center;
            padding: 2rem;
            color: var(--text-muted);
            font-size: 0.85rem;
            border-top: 1px solid var(--border);
            margin-top: 2rem;
        }
    </style>
</head>
<body>
    <header>
        <div class="logo-group">
            <div class="logo-icon">आ</div>
            <div class="logo-text">
                <h1>Aadi Vaani (आदि वाणी)</h1>
                <span>Tribal Voice & Text Translation Platform</span>
            </div>
        </div>
        <nav>
            <a href="/docs" target="_blank">API Docs <span class="badge-nav">Swagger</span></a>
            <a href="/health" target="_blank">Health</a>
            <a href="/languages" target="_blank">Languages</a>
        </nav>
    </header>

    <main>
        <div class="hero">
            <h2>भारतीय जनजातीय वाणी एवं भाषा अनुवाद मंच</h2>
            <p>Hindi / English ↔ Santali (संताली - <span class="ol-chiki-font">ᱥᱟᱱᱛᱟᱲᱤ</span>) &amp; Mundari (मुंडारी) &amp; Ho (हो - <span class="warang-font">𑢹𑣉𑣉 𑢱𑣁𑣋𑣁𑣜</span>) with Voice Input (ASR) &amp; Speech Synthesis (TTS)</p>
        </div>

        <div id="micAlert" class="alert-box">
            🎤 <strong>माइक्रोफोन सूचना:</strong> <span id="micAlertText">माइक्रोफोन को एक्सेस नहीं किया जा सका।</span>
        </div>

        <div class="translator-container">
            <div class="controls-bar">
                <div class="lang-selector-group">
                    <select id="srcLang">
                        <option value="hin" selected>हिन्दी (Hindi)</option>
                        <option value="eng">अंग्रेज़ी (English)</option>
                        <option value="sat">संताली (Santali)</option>
                        <option value="unr">मुंडारी (Mundari)</option>
                        <option value="hoc">हो (Ho)</option>
                    </select>

                    <button class="swap-btn" onclick="swapLanguages()" title="Swap Languages">⇄</button>

                    <select id="tgtLang">
                        <option value="sat" selected>संताली (Santali - Ol Chiki)</option>
                        <option value="unr">मुंडारी (Mundari)</option>
                        <option value="hoc">हो (Ho - Devanagari)</option>
                        <option value="hoc_warang">हो (Ho - वारंग क्षिति / Warang Citi)</option>
                        <option value="hin">हिन्दी (Hindi)</option>
                        <option value="eng">अंग्रेज़ी (English)</option>
                    </select>
                </div>

                <div style="display: flex; gap: 0.75rem; align-items: center;">
                    <button class="translate-btn" onclick="translateText()">अनुवाद करें (Translate)</button>
                </div>
            </div>

            <div class="translation-boxes">
                <!-- Input Box -->
                <div class="box input-box">
                    <textarea id="inputText" placeholder="यहाँ टेक्स्ट लिखें या नीचे माइक बटन दबाकर बोलें..." oninput="handleInput()"></textarea>
                    
                    <div class="meta-strip">
                        <div class="audio-controls">
                            <!-- Mic Button -->
                            <button id="micBtn" class="voice-btn" onclick="toggleVoiceInput()" title="माइक से बोलें">
                                <span id="micIcon">🎙️</span>
                                <span id="micLabel">बोलें (Speak)</span>
                            </button>

                            <!-- Live Voice Meter -->
                            <div id="liveMeter" class="live-audio-meter">
                                <div class="meter-bar" id="b1"></div>
                                <div class="meter-bar" id="b2"></div>
                                <div class="meter-bar" id="b3"></div>
                                <div class="meter-bar" id="b4"></div>
                                <div class="meter-bar" id="b5"></div>
                            </div>
                            <span id="recHint" class="rec-hint">सुन रहे हैं... बोलने के बाद लाल बटन दबाएं</span>

                            <!-- Audio File Upload -->
                            <input type="file" id="audioFileInput" accept="audio/*" style="display: none;" onchange="handleAudioUpload(this)">
                            <button class="voice-btn" onclick="document.getElementById('audioFileInput').click()" title="ऑडियो फाइल अपलोड">
                                📁 फाइल अपलोड
                            </button>
                        </div>

                        <span id="charCount">0 वर्ण</span>
                    </div>
                </div>

                <!-- Output Box -->
                <div class="box output-box">
                    <div id="outputText" class="output-text output-placeholder">अनुवाद यहाँ दिखाई देगा (Translation will appear here)...</div>
                    
                    <div class="meta-strip">
                        <div class="audio-controls">
                            <!-- Listen / TTS Button -->
                            <button id="speakerBtn" class="speak-btn" onclick="playTranslatedSpeech()" title="अनुवाद सुनें" style="display: none;">
                                🔊 <span>आवाज सुनें (Listen)</span>
                            </button>
                        </div>

                        <div class="tags-group">
                            <span id="backendTag" class="tag backend" style="display:none;"></span>
                            <span id="cachedTag" class="tag cached" style="display:none;">Cached</span>
                            <span id="latencyTag" class="tag" style="display:none;"></span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="actions-footer">
                <div class="chips-container">
                    <span class="chip-label">त्वरित वाक्य:</span>
                    <button class="chip" onclick="setPreset('नमस्ते')">नमस्ते (Johar / Greetings)</button>
                    <button class="chip" onclick="setPreset('Hello')">Hello (हैलो)</button>
                    <button class="chip" onclick="setPreset('आप कैसे हैं?')">आप कैसे हैं? (How are you?)</button>
                    <button class="chip" onclick="setPreset('हम स्कूल जा रहे हैं')">हम स्कूल जा रहे हैं</button>
                    <button class="chip" onclick="setPreset('पानी')">पानी (Water)</button>
                    <button class="chip" onclick="setPreset('घर')">घर (Home)</button>
                </div>
            </div>
        </div>

        <div id="disclaimerBanner" class="disclaimer-banner">
            ⚠️ <strong>सूचना:</strong> मुंडारी अनुवाद प्रारंभिक बीटा में है। मूल वक्ताओं (Native speakers) द्वारा समीक्षा अनुशंसित है।
        </div>
    </main>

    <footer>
        <p>Aadi Vaani Speech & Translation Router &bull; Speech-to-Text (ASR) &bull; Text-to-Speech (TTS) &bull; IndicTrans2 (MIT)</p>
    </footer>

    <script>
        let isRecording = false;
        let audioContext = null;
        let mediaStream = null;
        let scriptProcessor = null;
        let analyser = null;
        let pcmSamples = [];
        let animFrame = null;
        let speechRecognition = null;
        let currentAudioBase64 = null;

        function handleInput() {
            const val = document.getElementById('inputText').value;
            document.getElementById('charCount').innerText = val.length + ' वर्ण';
        }

        function setPreset(text) {
            document.getElementById('inputText').value = text;
            handleInput();
            translateText();
        }

        function swapLanguages() {
            const src = document.getElementById('srcLang');
            const tgt = document.getElementById('tgtLang');
            const temp = src.value;
            src.value = tgt.value;
            tgt.value = temp;

            const input = document.getElementById('inputText');
            const output = document.getElementById('outputText');
            if (output.innerText && !output.classList.contains('output-placeholder')) {
                input.value = output.innerText;
                handleInput();
                translateText();
            }
        }

        // Voice Input Toggle
        async function toggleVoiceInput() {
            if (isRecording) {
                await stopVoiceRecording(true);
            } else {
                await startVoiceRecording();
            }
        }

        // Start Voice Recording with AudioContext & Live Meter
        async function startVoiceRecording() {
            const micBtn = document.getElementById('micBtn');
            const micLabel = document.getElementById('micLabel');
            const micAlert = document.getElementById('micAlert');
            const recHint = document.getElementById('recHint');
            const liveMeter = document.getElementById('liveMeter');
            micAlert.style.display = 'none';

            try {
                // Request real microphone audio stream
                mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });

                audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
                const source = audioContext.createMediaStreamSource(mediaStream);

                // Setup Analyser for Live Sound Meter
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 64;
                source.connect(analyser);

                // Setup PCM Audio Buffer capture (for 16kHz WAV generation)
                scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
                pcmSamples = [];
                scriptProcessor.onaudioprocess = function(e) {
                    if (!isRecording) return;
                    const channelData = e.inputBuffer.getChannelData(0);
                    pcmSamples.push(new Float32Array(channelData));
                };
                source.connect(scriptProcessor);
                scriptProcessor.connect(audioContext.destination);

                isRecording = true;
                micBtn.classList.add('recording');
                micLabel.innerText = "रोकें और अनुवाद करें (Done)";
                recHint.style.display = 'inline';
                liveMeter.style.display = 'flex';

                // Animate Live Volume Meter
                updateLiveMeter();

                // Also run Web Speech Recognition for real-time text typing if supported
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (SpeechRecognition) {
                    speechRecognition = new SpeechRecognition();
                    const srcLang = document.getElementById('srcLang').value;
                    speechRecognition.lang = (srcLang === 'eng' ? 'en-IN' : 'hi-IN');
                    speechRecognition.interimResults = true;
                    speechRecognition.continuous = true;

                    speechRecognition.onresult = function(event) {
                        let text = "";
                        for (let i = 0; i < event.results.length; i++) {
                            text += event.results[i][0].transcript;
                        }
                        if (text.trim()) {
                            document.getElementById('inputText').value = text;
                            handleInput();
                        }
                    };

                    speechRecognition.onerror = function(e) {
                        console.log("Browser STT notice:", e.error);
                    };

                    try { speechRecognition.start(); } catch(e){}
                }

            } catch (err) {
                console.error("Mic access failed:", err);
                micAlert.style.display = 'block';
                document.getElementById('micAlertText').innerText = 
                    "माइक्रोफोन चालू नहीं हो सका। कृपया ब्राउज़र के URL बार में ताले/माइक आइकन पर क्लिक करके Microphone 'Allow' करें। (Error: " + err.message + ")";
                stopVoiceRecording(false);
            }
        }

        function updateLiveMeter() {
            if (!isRecording || !analyser) return;
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length; // 0 to 255

            // Adjust heights of bars dynamically with speech volume
            const bars = [document.getElementById('b1'), document.getElementById('b2'), document.getElementById('b3'), document.getElementById('b4'), document.getElementById('b5')];
            bars.forEach((bar, idx) => {
                if (bar) {
                    const factor = 1 + (idx % 3) * 0.4;
                    const h = Math.max(4, Math.min(22, (avg / 255) * 35 * factor));
                    bar.style.height = h + 'px';
                }
            });

            animFrame = requestAnimationFrame(updateLiveMeter);
        }

        async function stopVoiceRecording(processAudio) {
            isRecording = false;
            cancelAnimationFrame(animFrame);

            const micBtn = document.getElementById('micBtn');
            const micLabel = document.getElementById('micLabel');
            const recHint = document.getElementById('recHint');
            const liveMeter = document.getElementById('liveMeter');

            micBtn.classList.remove('recording');
            micLabel.innerText = "बोलें (Speak)";
            recHint.style.display = 'none';
            liveMeter.style.display = 'none';

            if (speechRecognition) {
                try { speechRecognition.stop(); } catch(e){}
                speechRecognition = null;
            }

            if (scriptProcessor) {
                try { scriptProcessor.disconnect(); } catch(e){}
                scriptProcessor = null;
            }

            if (mediaStream) {
                mediaStream.getTracks().forEach(t => t.stop());
                mediaStream = null;
            }

            if (audioContext) {
                try { audioContext.close(); } catch(e){}
                audioContext = null;
            }

            if (!processAudio) return;

            // Check if text is already recognized in input
            const recognizedText = document.getElementById('inputText').value.trim();
            if (recognizedText) {
                // If browser recognized speech in real time, translate immediately!
                translateText();
                return;
            }

            // Otherwise, encode recorded PCM into 16kHz WAV and send to backend ASR
            if (pcmSamples.length > 0) {
                const wavBlob = encodePCMToWav(pcmSamples, 16000);
                await sendAudioToTranslate(wavBlob, "voice_recording.wav");
            }
        }

        // Encode Float32Array PCM buffers into standard 16-bit Mono WAV Blob
        function encodePCMToWav(samplesList, sampleRate) {
            let totalLength = 0;
            for (let i = 0; i < samplesList.length; i++) totalLength += samplesList[i].length;
            const flatSamples = new Float32Array(totalLength);
            let offset = 0;
            for (let i = 0; i < samplesList.length; i++) {
                flatSamples.set(samplesList[i], offset);
                offset += samplesList[i].length;
            }

            const buffer = new ArrayBuffer(44 + flatSamples.length * 2);
            const view = new DataView(buffer);

            // RIFF header
            writeString(view, 0, 'RIFF');
            view.setUint32(4, 36 + flatSamples.length * 2, true);
            writeString(view, 8, 'WAVE');
            writeString(view, 12, 'fmt ');
            view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
            view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
            view.setUint16(22, 1, true); // NumChannels (1 mono)
            view.setUint32(24, sampleRate, true); // SampleRate
            view.setUint32(28, sampleRate * 2, true); // ByteRate
            view.setUint16(32, 2, true); // BlockAlign
            view.setUint16(34, 16, true); // BitsPerSample (16-bit)
            writeString(view, 36, 'data');
            view.setUint32(40, flatSamples.length * 2, true);

            // 16-bit PCM write
            let idx = 44;
            for (let i = 0; i < flatSamples.length; i++) {
                let s = Math.max(-1, Math.min(1, flatSamples[i]));
                view.setInt16(idx, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                idx += 2;
            }

            return new Blob([view], { type: 'audio/wav' });
        }

        function writeString(view, offset, string) {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        }

        // File Upload Translation
        async function handleAudioUpload(input) {
            if (input.files && input.files[0]) {
                const file = input.files[0];
                await sendAudioToTranslate(file, file.name);
            }
        }

        // Send Audio File/Blob to Backend
        async function sendAudioToTranslate(audioData, filename) {
            const outEl = document.getElementById('outputText');
            const inEl = document.getElementById('inputText');
            const speakerBtn = document.getElementById('speakerBtn');
            const backendTag = document.getElementById('backendTag');
            const latencyTag = document.getElementById('latencyTag');

            outEl.classList.add('output-placeholder');
            outEl.innerText = "ऑडियो को प्रोसेस और अनुवाद किया जा रहा है...";

            const srcLang = document.getElementById('srcLang').value;
            const tgtLang = document.getElementById('tgtLang').value;
            const effectiveTgt = (tgtLang === 'hoc_warang' ? 'hoc' : tgtLang);

            const formData = new FormData();
            formData.append('audio_file', audioData, filename || 'audio.wav');
            formData.append('source_lang', srcLang);
            formData.append('target_lang', effectiveTgt);
            formData.append('synthesize_audio', 'true');

            try {
                const res = await fetch('/speech/translate', {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.detail || 'Audio translation failed');
                }

                const data = await res.json();
                inEl.value = data.transcribed_text;
                handleInput();

                outEl.classList.remove('output-placeholder');
                outEl.innerText = data.translated_text;

                currentAudioBase64 = data.audio_base64;
                speakerBtn.style.display = 'inline-flex';

                backendTag.style.display = 'inline-block';
                backendTag.innerText = 'Backend: ' + data.backend_used;

                latencyTag.style.display = 'inline-block';
                latencyTag.innerText = data.latency_ms + ' ms';

                // Play synthesized speech
                if (currentAudioBase64) {
                    playAudioBase64(currentAudioBase64);
                }

            } catch (err) {
                outEl.classList.remove('output-placeholder');
                outEl.innerText = 'त्रुटि (Error): ' + err.message;
            }
        }

        // Standard Text Translation
        async function translateText() {
            const text = document.getElementById('inputText').value.trim();
            if (!text) return;

            const srcLang = document.getElementById('srcLang').value;
            const tgtLang = document.getElementById('tgtLang').value;

            const outEl = document.getElementById('outputText');
            const backendTag = document.getElementById('backendTag');
            const cachedTag = document.getElementById('cachedTag');
            const latencyTag = document.getElementById('latencyTag');
            const disclaimerBanner = document.getElementById('disclaimerBanner');
            const speakerBtn = document.getElementById('speakerBtn');

            outEl.classList.add('output-placeholder');
            outEl.innerText = "अनुवाद किया जा रहा है...";
            speakerBtn.style.display = 'none';
            currentAudioBase64 = null;

            let effectiveTgt = tgtLang;
            let scriptPref = null;
            if (tgtLang === 'hoc_warang') {
                effectiveTgt = 'hoc';
                scriptPref = 'warang_citi';
            } else if (tgtLang === 'sat') {
                scriptPref = 'ol_chiki';
            }

            try {
                const response = await fetch('/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: text,
                        source_lang: srcLang,
                        target_lang: effectiveTgt,
                        script_preference: scriptPref,
                        allow_fallback: true
                    })
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || 'Translation request failed');
                }

                const data = await response.json();
                outEl.classList.remove('output-placeholder');
                outEl.innerText = data.translated_text;

                speakerBtn.style.display = 'inline-flex';

                backendTag.style.display = 'inline-block';
                backendTag.innerText = 'Backend: ' + data.backend_used;

                latencyTag.style.display = 'inline-block';
                latencyTag.innerText = data.latency_ms + ' ms';

                if (data.cached) {
                    cachedTag.style.display = 'inline-block';
                } else {
                    cachedTag.style.display = 'none';
                }

                if (data.disclaimer) {
                    disclaimerBanner.style.display = 'block';
                    disclaimerBanner.innerHTML = '⚠️ <strong>सूचना:</strong> ' + data.disclaimer;
                } else {
                    disclaimerBanner.style.display = 'none';
                }

            } catch (err) {
                outEl.classList.remove('output-placeholder');
                outEl.innerText = 'त्रुटि (Error): ' + err.message;
                backendTag.style.display = 'none';
                cachedTag.style.display = 'none';
                latencyTag.style.display = 'none';
            }
        }

        // Text-to-Speech Playback
        function playTranslatedSpeech() {
            const outEl = document.getElementById('outputText');
            const text = outEl.innerText.trim();
            if (!text || outEl.classList.contains('output-placeholder')) return;

            const tgtLang = document.getElementById('tgtLang').value;
            const speakerBtn = document.getElementById('speakerBtn');

            if (currentAudioBase64) {
                playAudioBase64(currentAudioBase64);
                return;
            }

            speakerBtn.classList.add('playing');
            const synthLang = (tgtLang === 'hoc_warang' ? 'hoc' : tgtLang);
            const streamUrl = `/speech/synthesize/stream?text=${encodeURIComponent(text)}&language=${encodeURIComponent(synthLang)}`;
            const audio = new Audio(streamUrl);

            audio.onended = () => speakerBtn.classList.remove('playing');
            audio.onerror = () => {
                speakerBtn.classList.remove('playing');
                if (window.speechSynthesis) {
                    const utterance = new SpeechSynthesisUtterance(text);
                    window.speechSynthesis.speak(utterance);
                }
            };
            audio.play();
        }

        function playAudioBase64(base64Data) {
            const speakerBtn = document.getElementById('speakerBtn');
            speakerBtn.classList.add('playing');
            const audio = new Audio("data:audio/wav;base64," + base64Data);
            audio.onended = () => speakerBtn.classList.remove('playing');
            audio.onerror = () => speakerBtn.classList.remove('playing');
            audio.play();
        }
    </script>
</body>
</html>
"""
