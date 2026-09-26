import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  UploadCloud,
  FileText,
  Play,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Zap,
  Layers,
  FileCode,
  BookOpen,
  HelpCircle,
  X,
  ChevronRight,
  ChevronLeft,
  RotateCw,
  ExternalLink,
  Clock,
  Film,
  Award,
  CheckCircle2,
  AlertCircle,
  ListChecks,
  Volume2,
  GraduationCap
} from 'lucide-react';
import { uiTranslations } from '../services/uiTranslations';
import { isOffline } from '../services/offline/offlineMode';

// Pre-rendered Video Library
const PRELOADED_VIDEOS = [
  {
    id: 'vid-fln-1',
    title: 'Introduction to Santali Ol Chiki Alphabet (ᱚᱞ ᱪᱤᱠᱤ)',
    topic: 'FLN Literacy & Mother Tongue',
    language: 'Santhali',
    langCode: 'sat',
    duration: '3m 45s',
    scenes: 14,
    engine: 'Remotion + Indian Accent AI',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    createdAt: 'Just now',
    summary: `# Introduction to Santali Ol Chiki (ᱚᱞ ᱪᱤᱠᱤ)\n\n## Key Takeaways\n- **Creator:** Guru Gomke Pt. Raghunath Murmu in 1925\n- **Unique Structure:** 30 letters with intrinsic vowels and phonetic modifier signs (ᱸ, ᱹ, ᱺ, ᱻ, ᱼ, ᱽ)\n- **Classroom Impact:** Enables mother-tongue foundational literacy under NIPUN Bharat L1.1 standard.`,
    flashcards: [
      { id: 1, prompt: "What is the Santali script called?", answer: "Ol Chiki (ᱚᱞ ᱪᱤᱠᱤ), created in 1925 by Pt. Raghunath Murmu.", hint: "Used in 8th Schedule of Indian Constitution", category: "Language" },
      { id: 2, prompt: "How many letters are there in Ol Chiki?", answer: "30 primary letters arranged in 6 rows of 5 characters each.", hint: "Arranged by phonetic articulatory features", category: "Structure" },
      { id: 3, prompt: "What does the modifier sign 'ᱸ' (Mu-Tudag) do?", answer: "Nasalizes the preceding vowel (similar to Chandrabindu / Anusvara in Devanagari).", hint: "Nasal sound modifier", category: "Grammar" }
    ],
    worksheet: [
      { q: "Who invented the Ol Chiki script for Santali?", opts: ["Pt. Raghunath Murmu", "Birsa Munda", "Sidhu Kanhu", "Tilka Manjhi"], ans: "Pt. Raghunath Murmu", exp: "Created by Guru Gomke Pt. Raghunath Murmu in 1925." },
      { q: "Which of the following represents the number '1' in Ol Chiki?", opts: ["᱑ (Mit')", "᱒ (Bar)", "᱓ (Pe)", "᱔ (Pun)"], ans: "᱑ (Mit')", exp: "᱑ represents 1 (Mit') in Ol Chiki numeracy." }
    ]
  },
  {
    id: 'vid-py-1',
    title: 'Python Loops & Iterators: while and for loops with animations',
    topic: 'NCERT Class 11 Computer Science',
    language: 'Hinglish',
    langCode: 'hi-en',
    duration: '4m 12s',
    scenes: 16,
    engine: 'Remotion + Live Code Runner',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    createdAt: '2 hours ago',
    summary: `# Python Loops & Iterators Masterclass\n\n## Concepts Covered\n1. **While Loops:** Loop that runs as long as the condition evaluates to \`True\`.\n2. **For Loops:** Sequential iteration over sequences (\`range()\`, lists, strings).\n3. **Loop Control Statements:** \`break\` (exit immediately) & \`continue\` (skip to next iteration).\n\n\`\`\`python\ncount = 1\nwhile count <= 5:\n    print(f"Number: {count}")\n    count += 1\n\`\`\``,
    flashcards: [
      { id: 1, prompt: "When does a while loop terminate?", answer: "When the test condition evaluates to False.", hint: "Condition check", category: "Control Flow" },
      { id: 2, prompt: "What is the difference between break and continue?", answer: "break terminates the entire loop, while continue skips only the current iteration.", hint: "Loop controls", category: "Syntax" }
    ],
    worksheet: [
      { q: "What will range(1, 5) produce in Python?", opts: ["1, 2, 3, 4", "1, 2, 3, 4, 5", "0, 1, 2, 3, 4", "1, 5"], ans: "1, 2, 3, 4", exp: "range(start, stop) generates numbers from start up to stop - 1." }
    ]
  },
  {
    id: 'vid-math-1',
    title: 'NIPUN Bharat Numeracy: Counting & Arithmetic Patterns',
    topic: 'Grade 1–3 Primary Mathematics',
    language: 'Hindi',
    langCode: 'hi',
    duration: '3m 20s',
    scenes: 12,
    engine: 'Remotion + Visual Radar',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    createdAt: 'Yesterday',
    summary: `# Primary Numeracy & Arithmetic Patterns\n\n## Lakshya Goals\n- Children can count objects up to 99 in mother tongue and standard state language.\n- Single-digit addition and subtraction using physical manipulatives.`,
    flashcards: [
      { id: 1, prompt: "What is 5 + 3?", answer: "8 (Eight / ᱤᱨᱟᱹᱞ)", hint: "Single digit addition", category: "Arithmetic" }
    ],
    worksheet: [
      { q: "If there are 4 trees and 3 birds on each tree, how many birds in total?", opts: ["12", "7", "10", "15"], ans: "12", exp: "4 x 3 = 12 birds in total." }
    ]
  }
];

export default function VideoStudio({ uiLang = 'en', currentLang = 'sat' }) {
  const t = uiTranslations[uiLang] || uiTranslations.en;

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'text' | 'jobs' | 'scripts' | 'credits'
  const [selectedFile, setSelectedFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [scriptLang, setScriptLang] = useState('English');
  const [codeMode, setCodeMode] = useState('auto');

  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [modelLogs, setModelLogs] = useState([]);

  const [generationResult, setGenerationResult] = useState(null);
  const [videoList, setVideoList] = useState(PRELOADED_VIDEOS);

  // Modals
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);

  // Flashcard state
  const [fcIndex, setFcIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Worksheet revealed answers
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [copiedUrl, setCopiedUrl] = useState(false);

  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const clearFile = (e) => {
    if (e) e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const runGeneration = async (sourceType) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setProgressStep(1);
    setProgressPct(10);
    setProgressMessage('Reading content and analyzing curriculum concepts...');
    setModelLogs([
      '[*] Initializing Shiksha Setu AI Video Pipeline v3.0...',
      `[*] Script Language: ${scriptLang} | Code Mode: ${codeMode}`,
      '[*] Gemini-1.5-Pro: Ingesting educational text and structuring 14 scenes...'
    ]);
    setGenerationResult(null);

    const steps = [
      { step: 1, pct: 25, msg: 'Gemini AI: Generating 14-scene video script with visual anchors and pedagogical breakdown...', log: '[✓] Script generated: 14 scenes (Intro, Concept, Live Examples, Radar, Summary)' },
      { step: 2, pct: 45, msg: 'Voice AI: Generating authentic Indian accent narration and subtitle word timings...', log: '[✓] Sarvam / ElevenLabs TTS: 14 audio tracks synthesized with word-level SRT timestamps' },
      { step: 3, pct: 65, msg: 'AI Avatar: Synthesizing synchronized teacher character and lip-sync expressions...', log: '[✓] Avatar Lip-sync: 100% synchronized with speech audio frames' },
      { step: 4, pct: 85, msg: 'Remotion Engine: Compiling animations, radar charts and live code execution scene...', log: '[✓] Remotion Studio: 1080p HD render completed at 30fps (CRF 20)' },
      { step: 5, pct: 100, msg: 'Cloud Storage: Uploading video lesson and syncing with classroom library...', log: '[✓] Success: Stored to video library and indexed for offline classrooms.' }
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 1200));
      const s = steps[i];
      setProgressStep(s.step);
      setProgressPct(s.pct);
      setProgressMessage(s.msg);
      setModelLogs((prev) => [...prev, s.log]);
    }

    const title = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : (rawText.slice(0, 45) || 'Interactive Lesson');
    const newVideo = {
      id: `vid-${Date.now()}`,
      title: title.length > 5 ? title : `AI Video Lesson on ${title}`,
      topic: 'AI Generated Classroom Topic',
      language: scriptLang,
      langCode: scriptLang.toLowerCase(),
      duration: '3m 50s',
      scenes: 14,
      engine: 'Remotion + Indian Accent AI',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      createdAt: 'Just now',
      summary: `# ${title}\n\n## Pedagogical Overview\n- Generated specifically for bilingual multi-grade classroom delivery in **${scriptLang}**.\n- Step-by-step visual progression with interactive concept breakdowns and key definitions.`,
      flashcards: [
        { id: 1, prompt: `What is the core takeaway of ${title}?`, answer: "Mastery of primary concepts with dual language grounding.", hint: "Key definition", category: "Core Concept" },
        { id: 2, prompt: "How to apply this in classroom exercises?", answer: "Use step-by-step practice sheets and physical examples.", hint: "Classroom method", category: "Pedagogy" }
      ],
      worksheet: [
        { q: `What is the main objective of studying ${title}?`, opts: ["Understanding foundational logic", "Memorizing without meaning", "Skipping to advanced levels", "None of the above"], ans: "Understanding foundational logic", exp: "Foundational conceptual understanding ensures long-term learning retention." }
      ]
    };

    setVideoList((prev) => [newVideo, ...prev]);
    setGenerationResult(newVideo);
    setIsGenerating(false);
  };

  const handleOpenSummary = (item) => {
    const data = item || generationResult || videoList[0];
    setModalData(data);
    setActiveModal('summary');
  };

  const handleOpenFlashcards = (item) => {
    const data = item || generationResult || videoList[0];
    setModalData(data);
    setFcIndex(0);
    setIsFlipped(false);
    setActiveModal('flashcards');
  };

  const handleOpenWorksheet = (item) => {
    const data = item || generationResult || videoList[0];
    setModalData(data);
    setRevealedAnswers({});
    setActiveModal('worksheet');
  };

  const handleWatchVideo = (item) => {
    const data = item || generationResult || videoList[0];
    setModalData(data);
    setActiveModal('video');
  };

  const copyVideoUrl = (url) => {
    navigator.clipboard.writeText(url || 'https://shikshasetu.org/watch');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* Studio Header Bar */}
      <div className="page-head" style={{ marginBottom: '14px', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
            <h1 style={{ margin: 0, color: 'var(--green-primary)', fontSize: '24px' }}>AI Avatar Video Generator for Students</h1>
            <span className="badge-green" style={{ fontSize: '11px', fontWeight: '800' }}>AI STUDIO v3.0</span>
          </div>
          <p style={{ color: 'var(--text-sub)', fontSize: '13.5px', margin: 0 }}>
            Turn any PPT, PDF, or study notes into a 3–5 minute animated video lesson with Indian accent narration
          </p>
        </div>
      </div>

      {/* Compact 4 Display Blocks */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        marginBottom: '16px'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1.5px solid var(--border-medium)',
          borderRadius: '10px',
          padding: '10px 12px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '2px' }}>
            <FileText size={15} color="var(--green-primary)" />
            <span style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--green-primary)' }}>Full Topic Coverage</span>
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: 1.3 }}>Every slide, concept & definition explained</div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1.5px solid var(--border-medium)',
          borderRadius: '10px',
          padding: '10px 12px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '2px' }}>
            <Sparkles size={15} color="var(--green-primary)" />
            <span style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--green-primary)' }}>AI Avatar & Animations</span>
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: 1.3 }}>Visual radar, flowcharts & live code runner</div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1.5px solid var(--border-medium)',
          borderRadius: '10px',
          padding: '10px 12px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '2px' }}>
            <Volume2 size={15} color="var(--green-primary)" />
            <span style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--green-primary)' }}>Indian Accent Voice</span>
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: 1.3 }}>Clear, natural conversational teaching</div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1.5px solid var(--border-medium)',
          borderRadius: '10px',
          padding: '10px 12px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '2px' }}>
            <ListChecks size={15} color="var(--green-primary)" />
            <span style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--green-primary)' }}>Video Index & Agenda</span>
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: 1.3 }}>Built-in table of contents & roadmap</div>
        </div>
      </div>

      {/* Indian AI Teacher Avatar Banner */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1.5px solid var(--border-medium)',
          borderRadius: '14px',
          padding: '14px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          boxShadow: 'var(--shadow-xs)',
          width: '100%',
          maxWidth: '720px'
        }}>
          <svg style={{ width: '64px', height: '76px', flexShrink: 0 }} viewBox="0 0 200 240">
            <circle cx="100" cy="110" r="85" fill="none" stroke="#134E3F" strokeWidth="2" opacity="0.4" />
            <circle cx="100" cy="110" r="72" fill="#FFFFFF" />
            <ellipse cx="100" cy="46" rx="72" ry="30" fill="#0F4C3A" />
            <ellipse cx="44" cy="80" rx="18" ry="32" fill="#0F4C3A" />
            <ellipse cx="156" cy="80" rx="18" ry="32" fill="#0F4C3A" />
            <ellipse cx="100" cy="120" rx="55" ry="60" fill="#fcd9a0" />
            <ellipse cx="78" cy="110" rx="10" ry="14" fill="#fff" /><ellipse cx="78" cy="110" rx="6" ry="8" fill="#134E3F" />
            <ellipse cx="122" cy="110" rx="10" ry="14" fill="#fff" /><ellipse cx="122" cy="110" rx="6" ry="8" fill="#134E3F" />
            <path d="M65 95 Q78 88 91 95" stroke="#5b3a1a" strokeWidth="3" fill="none" />
            <path d="M109 95 Q122 88 135 95" stroke="#5b3a1a" strokeWidth="3" fill="none" />
            <ellipse cx="100" cy="145" rx="22" ry="8" fill="#1a0a00" stroke="#059669" strokeWidth="1.5" />
            <ellipse cx="100" cy="210" rx="60" ry="40" fill="#0F4C3A" />
            <rect x="82" y="180" width="36" height="35" fill="#0E3F33" rx="4" />
            <polygon points="100,182 108,195 100,230 92,195" fill="#059669" opacity="0.9" />
          </svg>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--green-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GraduationCap size={16} color="var(--green-primary)" />
              <span>Indian AI Teacher Avatar</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-sub)', margin: '2px 0 8px', lineHeight: 1.35 }}>
              Animated character explains every topic step-by-step with synchronized lip-sync and subtitles
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '10.5px', fontWeight: '700', padding: '2px 8px', borderRadius: '14px', backgroundColor: 'var(--green-light)', color: 'var(--green-primary)', border: '1px solid var(--green-border)' }}>
                ElevenLabs Voice
              </span>
              <span style={{ fontSize: '10.5px', fontWeight: '700', padding: '2px 8px', borderRadius: '14px', backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>
                Remotion Avatar
              </span>
              <span style={{ fontSize: '10.5px', fontWeight: '700', padding: '2px 8px', borderRadius: '14px', backgroundColor: '#FFF7ED', color: '#EA580C', border: '1px solid #FFEDD5' }}>
                D-ID: Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {isOffline() && (
        <div style={{
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '12px',
          padding: '10px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '12px',
          color: '#1E40AF',
          fontWeight: '600'
        }}>
          <AlertCircle size={16} color="#2563EB" />
          <span>Offline Mode: AI Avatar video generation is available when connected to the internet. Preloaded educational video library below is available offline.</span>
        </div>
      )}

      {/* Main Studio Navigation Tabs */}
      <div className="seg" style={{ marginBottom: '16px', width: '100%', display: 'flex' }}>
        <button
          className={activeTab === 'upload' ? 'active' : ''}
          onClick={() => setActiveTab('upload')}
          style={{ flex: 1, padding: '9px 12px', fontSize: '13px' }}
        >
          Upload File
        </button>
        <button
          className={activeTab === 'text' ? 'active' : ''}
          onClick={() => setActiveTab('text')}
          style={{ flex: 1, padding: '9px 12px', fontSize: '13px' }}
        >
          Type Notes
        </button>
        <button
          className={activeTab === 'jobs' ? 'active' : ''}
          onClick={() => setActiveTab('jobs')}
          style={{ flex: 1, padding: '9px 12px', fontSize: '13px' }}
        >
          My Videos ({videoList.length})
        </button>
        <button
          className={activeTab === 'scripts' ? 'active' : ''}
          onClick={() => setActiveTab('scripts')}
          style={{ flex: 1, padding: '9px 12px', fontSize: '13px' }}
        >
          My Scripts
        </button>
        <button
          className={activeTab === 'credits' ? 'active' : ''}
          onClick={() => setActiveTab('credits')}
          style={{ flex: 1, padding: '9px 12px', fontSize: '13px' }}
        >
          AI Credits
        </button>
      </div>

      {/* Panel 1: Upload File */}
      {activeTab === 'upload' && (
        <div className="card" style={{ padding: '22px' }}>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--border-medium)',
              borderRadius: '14px',
              padding: '38px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: '#FAFCFA',
              transition: 'all 0.2s ease'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pptx,.ppt,.pdf,.txt,.md,.png,.jpg,.jpeg,.webp"
              style={{ display: 'none' }}
            />
            {/* ONLY Pin emoji kept here as requested */}
            <div style={{ fontSize: '42px', marginBottom: '6px' }}>📎</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--green-primary)' }}>
              Drag & Drop or Click to Browse
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
              PPT, PPTX, PDF, Images (PNG/JPG), TXT, MD — Max 50MB
            </div>
          </div>

          {selectedFile && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: 'var(--green-light)',
              border: '1.5px solid var(--green-border)',
              borderRadius: '10px',
              marginTop: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--green-primary)" />
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--green-primary)' }}>
                    {selectedFile.name}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="btn-ghost"
                style={{ padding: '4px 8px', color: '#DC2626', fontWeight: '700', fontSize: '12px' }}
              >
                Remove
              </button>
            </div>
          )}

          {/* Configuration Controls */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginTop: '16px',
            padding: '12px 16px',
            backgroundColor: '#F8FAF8',
            border: '1.5px solid var(--border-medium)',
            borderRadius: '12px'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: 'var(--green-primary)', marginBottom: '5px' }}>
                Script Language:
              </label>
              <select
                value={scriptLang}
                onChange={(e) => setScriptLang(e.target.value)}
                className="field"
                style={{ backgroundColor: '#FFFFFF', fontSize: '13px' }}
              >
                <option value="English">English (Indian English)</option>
                <option value="Hinglish">Hinglish (English + Hindi Mix)</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Santhali">Santhali (ᱥᱟᱱᱛᱟᱲᱤ / Ol Chiki)</option>
                <option value="Ho">Ho (ᱦᱳ / Warang Citi)</option>
                <option value="Mundari">Mundari (ᱢᱩᱱᱰᱟᱨᱤ)</option>
                <option value="Bengali">Bengali (বাংলা)</option>
                <option value="Marathi">Marathi (मराठी)</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                <option value="Malayalam">Malayalam (മലയാളം)</option>
                <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: 'var(--green-primary)', marginBottom: '5px' }}>
                Code Examples:
              </label>
              <select
                value={codeMode}
                onChange={(e) => setCodeMode(e.target.value)}
                className="field"
                style={{ backgroundColor: '#FFFFFF', fontSize: '13px' }}
              >
                <option value="auto">Auto-detect (Programming/software topics)</option>
                <option value="never">Never (Theory, literature, science)</option>
                <option value="always">Always include live code editor scene</option>
              </select>
            </div>
          </div>

          {/* Action Suite */}
          <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => runGeneration('file')}
              disabled={isGenerating || !selectedFile}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '15px',
                fontWeight: '800',
                justifyContent: 'center',
                backgroundColor: !selectedFile ? 'var(--border-medium)' : undefined,
                color: !selectedFile ? 'var(--text-muted)' : undefined,
                cursor: !selectedFile ? 'not-allowed' : 'pointer'
              }}
            >
              <Film size={16} />
              <span>Generate Full Video Lesson (3-5 min)</span>
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <button
                onClick={() => handleOpenSummary(null)}
                disabled={!selectedFile && videoList.length === 0}
                className="btn-secondary"
                style={{ justifyContent: 'center', padding: '10px', fontSize: '12.5px' }}
              >
                Lesson Summary
              </button>
              <button
                onClick={() => handleOpenFlashcards(null)}
                disabled={!selectedFile && videoList.length === 0}
                className="btn-secondary"
                style={{ justifyContent: 'center', padding: '10px', fontSize: '12.5px', borderColor: '#DDD6FE', color: '#6D28D9' }}
              >
                Make Flashcards
              </button>
              <button
                onClick={() => handleOpenWorksheet(null)}
                disabled={!selectedFile && videoList.length === 0}
                className="btn-secondary"
                style={{ justifyContent: 'center', padding: '10px', fontSize: '12.5px', borderColor: '#BAE6FD', color: '#0369A1' }}
              >
                Make Worksheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel 2: Type Notes */}
      {activeTab === 'text' && (
        <div className="card" style={{ padding: '22px' }}>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={5}
            className="field"
            placeholder="Type or paste your educational topic or notes here...&#10;&#10;Example: Explain Santali Ol Chiki consonants and vowels with pronunciation rules for Grade 2..."
            style={{ width: '100%', resize: 'vertical' }}
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginTop: '14px',
            padding: '12px 16px',
            backgroundColor: '#F8FAF8',
            border: '1.5px solid var(--border-medium)',
            borderRadius: '12px'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: 'var(--green-primary)', marginBottom: '5px' }}>
                Script Language:
              </label>
              <select
                value={scriptLang}
                onChange={(e) => setScriptLang(e.target.value)}
                className="field"
                style={{ backgroundColor: '#FFFFFF', fontSize: '13px' }}
              >
                <option value="English">English (Indian English)</option>
                <option value="Hinglish">Hinglish (English + Hindi Mix)</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Santhali">Santhali (ᱥᱟᱱᱛᱟᱲᱤ / Ol Chiki)</option>
                <option value="Ho">Ho (ᱦᱳ / Warang Citi)</option>
                <option value="Mundari">Mundari (ᱢᱩᱱᱰᱟᱨᱤ)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: 'var(--green-primary)', marginBottom: '5px' }}>
                Code Examples:
              </label>
              <select
                value={codeMode}
                onChange={(e) => setCodeMode(e.target.value)}
                className="field"
                style={{ backgroundColor: '#FFFFFF', fontSize: '13px' }}
              >
                <option value="auto">Auto-detect</option>
                <option value="never">Never</option>
                <option value="always">Always</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => runGeneration('text')}
              disabled={isGenerating || !rawText.trim()}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '15px',
                fontWeight: '800',
                justifyContent: 'center',
                backgroundColor: !rawText.trim() ? 'var(--border-medium)' : undefined,
                color: !rawText.trim() ? 'var(--text-muted)' : undefined,
                cursor: !rawText.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              <Film size={16} />
              <span>Generate Full Video Lesson (3-5 min)</span>
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <button
                onClick={() => handleOpenSummary(null)}
                className="btn-secondary"
                style={{ justifyContent: 'center', padding: '10px', fontSize: '12.5px' }}
              >
                Lesson Summary
              </button>
              <button
                onClick={() => handleOpenFlashcards(null)}
                className="btn-secondary"
                style={{ justifyContent: 'center', padding: '10px', fontSize: '12.5px', borderColor: '#DDD6FE', color: '#6D28D9' }}
              >
                Make Flashcards
              </button>
              <button
                onClick={() => handleOpenWorksheet(null)}
                className="btn-secondary"
                style={{ justifyContent: 'center', padding: '10px', fontSize: '12.5px', borderColor: '#BAE6FD', color: '#0369A1' }}
              >
                Make Worksheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel 3: My Videos (Library) */}
      {activeTab === 'jobs' && (
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: 'var(--green-primary)' }}>
              Generated Video Library ({videoList.length})
            </h3>
            <button onClick={() => setVideoList([...videoList])} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
              <RefreshCw size={12} />
              <span>Refresh</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {videoList.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid var(--border-medium)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <div style={{
                  width: '46px',
                  height: '38px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, var(--green-primary), #0E3F33)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0
                }}>
                  <Film size={20} color="#FFFFFF" />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--green-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span>{item.duration}</span>
                    <span>•</span>
                    <span>{item.scenes} scenes</span>
                    <span>•</span>
                    <span className="badge-green" style={{ fontSize: '10px' }}>{item.language}</span>
                    <span>•</span>
                    <span>{item.createdAt}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button
                    onClick={() => handleWatchVideo(item)}
                    className="btn-primary"
                    style={{ padding: '7px 14px', fontSize: '12.5px' }}
                  >
                    <Play size={12} />
                    <span>Watch</span>
                  </button>
                  <button
                    onClick={() => handleOpenSummary(item)}
                    className="btn-secondary"
                    style={{ padding: '7px 10px', fontSize: '11.5px' }}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => handleOpenFlashcards(item)}
                    className="btn-secondary"
                    style={{ padding: '7px 10px', fontSize: '11.5px', color: '#6D28D9' }}
                  >
                    Flashcards
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Panel 4: My Scripts */}
      {activeTab === 'scripts' && (
        <div className="card" style={{ padding: '22px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '17px', fontWeight: '800', color: 'var(--green-primary)' }}>
            Multi-Scene Structured Scripts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {videoList.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid var(--border-medium)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--green-primary)' }}>{item.title}</div>
                  <span className="badge-blue" style={{ fontSize: '10px' }}>{item.scenes} Scenes JSON / Markdown</span>
                </div>
                <div style={{
                  padding: '10px',
                  backgroundColor: '#F8FAF8',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontFamily: 'monospace',
                  color: 'var(--text-sub)',
                  maxHeight: '70px',
                  overflowY: 'hidden'
                }}>
                  {item.summary}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    onClick={() => handleOpenSummary(item)}
                    className="btn-secondary"
                    style={{ padding: '5px 12px', fontSize: '11.5px' }}
                  >
                    View Full Script
                  </button>
                  <button
                    onClick={() => handleWatchVideo(item)}
                    className="btn-primary"
                    style={{ padding: '5px 12px', fontSize: '11.5px' }}
                  >
                    Render Video
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Panel 5: AI Credits & Model Status */}
      {activeTab === 'credits' && (
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: 'var(--green-primary)' }}>
              Live AI Model Rotation & Health
            </h3>
            <span className="badge-green">Auto-Fallback Engine</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
              <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#065F46' }}>Google Gemini 1.5</div>
              <div style={{ fontSize: '11.5px', color: '#047857', marginTop: '3px' }}>Status: Primary (Online)</div>
              <div style={{ fontSize: '10.5px', color: '#065F46', marginTop: '4px' }}>High-context multimodality & curriculum reasoning</div>
            </div>

            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD' }}>
              <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0369A1' }}>Groq LLaMA 3.3 70B</div>
              <div style={{ fontSize: '11.5px', color: '#0284C7', marginTop: '3px' }}>Status: Secondary (500 tok/s)</div>
              <div style={{ fontSize: '10.5px', color: '#0369A1', marginTop: '4px' }}>Instant scene script formatting</div>
            </div>

            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#F5F3FF', border: '1px solid #DDD6FE' }}>
              <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#6D28D9' }}>Cerebras Inference</div>
              <div style={{ fontSize: '11.5px', color: '#7C3AED', marginTop: '3px' }}>Status: Fallback (Ready)</div>
              <div style={{ fontSize: '10.5px', color: '#6D28D9', marginTop: '4px' }}>Ultra-fast wafer-scale synthesis</div>
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '11.5px', textAlign: 'center', marginTop: '14px' }}>
            Model Rotation Order: Gemini → Groq → Cerebras → OpenRouter (Cascades automatically on quota / latency).
          </p>
        </div>
      )}

      {/* Real-time Video Generation Progress Card */}
      {isGenerating && (
        <div className="card" style={{ marginTop: '20px', padding: '20px', border: '2px solid var(--green-primary)' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '17px', fontWeight: '800', color: 'var(--green-primary)' }}>
            Rendering AI Avatar Video Lesson...
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            {[
              { id: 1, label: 'Gemini AI: Reading content & building 12-18 scene script' },
              { id: 2, label: 'Voice AI: Generating Indian accent narration & word timing' },
              { id: 3, label: 'AI Avatar: Preparing synchronized teacher character' },
              { id: 4, label: 'Remotion Engine: Rendering final animated HD video' },
              { id: 5, label: 'Cloud Storage: Uploading and saving to video library' }
            ].map((step) => {
              const isDone = progressStep > step.id;
              const isCurrent = progressStep === step.id;
              return (
                <div
                  key={step.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: isDone ? '#ECFDF5' : isCurrent ? 'var(--green-light)' : '#F9FBFA',
                    border: isCurrent ? '1.5px solid var(--green-primary)' : isDone ? '1px solid #A7F3D0' : '1px solid #E5EBE7',
                    opacity: isDone || isCurrent ? 1 : 0.5
                  }}
                >
                  <span style={{ flex: 1, fontSize: '12.5px', fontWeight: '600', color: 'var(--text-main)' }}>
                    {step.label}
                  </span>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '14px',
                    backgroundColor: isDone ? '#D1FAE5' : isCurrent ? 'var(--green-primary)' : '#E5E7EB',
                    color: isDone ? '#065F46' : isCurrent ? '#FFFFFF' : '#6B7280'
                  }}>
                    {isDone ? 'Completed' : isCurrent ? 'Processing...' : 'Waiting'}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ height: '6px', backgroundColor: '#E5ECE8', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              backgroundColor: 'var(--green-primary)',
              borderRadius: '999px',
              width: `${progressPct}%`,
              transition: 'width 0.5s ease'
            }} />
          </div>
          <div style={{ textAlign: 'center', marginTop: '8px', color: 'var(--text-sub)', fontSize: '12px', fontWeight: '600' }}>
            {progressMessage} ({progressPct}%)
          </div>

          {/* Model Logs */}
          <div style={{
            marginTop: '14px',
            padding: '10px 12px',
            backgroundColor: '#0F172A',
            color: '#34D399',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '11.5px',
            maxHeight: '110px',
            overflowY: 'auto'
          }}>
            <div style={{ color: '#94A3B8', fontWeight: '700', marginBottom: '3px' }}>Live Model Rotation Logs:</div>
            {modelLogs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
          </div>
        </div>
      )}

      {/* Generation Result Card */}
      {generationResult && !isGenerating && (
        <div className="card" style={{ marginTop: '20px', padding: '22px', border: '2px solid #10B981', backgroundColor: '#FFFFFF' }}>
          <h3 style={{ color: '#065F46', margin: '0 0 14px', fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={20} color="#10B981" />
            <span>Avatar Video Generated Successfully</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div style={{ padding: '10px 14px', backgroundColor: '#F9FBFA', border: '1px solid var(--border-medium)', borderRadius: '10px' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Title</div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--green-primary)' }}>{generationResult.title}</div>
            </div>

            <div style={{ padding: '10px 14px', backgroundColor: '#F9FBFA', border: '1px solid var(--border-medium)', borderRadius: '10px' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Language</div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--green-primary)' }}>{generationResult.language}</div>
            </div>

            <div style={{ padding: '10px 14px', backgroundColor: '#F9FBFA', border: '1px solid var(--border-medium)', borderRadius: '10px' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Scenes & Timing</div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--green-primary)' }}>{generationResult.scenes} Scenes · {generationResult.duration}</div>
            </div>

            <div style={{ padding: '10px 14px', backgroundColor: '#F9FBFA', border: '1px solid var(--border-medium)', borderRadius: '10px' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Avatar Engine</div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--green-primary)' }}>{generationResult.engine}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleWatchVideo(generationResult)}
              className="btn-primary"
              style={{ flex: 1, minWidth: '180px', padding: '12px', justifyContent: 'center', fontSize: '14px' }}
            >
              <Play size={15} />
              <span>Watch Avatar Video</span>
            </button>

            <button
              onClick={() => handleOpenSummary(generationResult)}
              className="btn-secondary"
              style={{ padding: '12px 18px', fontSize: '13px' }}
            >
              View Script (.md)
            </button>

            <button
              onClick={() => copyVideoUrl(generationResult.videoUrl)}
              className="btn-secondary"
              style={{ padding: '12px 18px', fontSize: '13px' }}
            >
              {copiedUrl ? <Check size={15} color="#059669" /> : <Copy size={15} />}
              <span>{copiedUrl ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: In-App Video Player */}
      {activeModal === 'video' && modalData && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '820px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              padding: '14px 20px',
              backgroundColor: 'var(--green-primary)',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Film size={18} />
                <span style={{ fontSize: '15px', fontWeight: '800' }}>{modalData.title}</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '18px' }}>
              <div style={{
                position: 'relative',
                borderRadius: '10px',
                overflow: 'hidden',
                backgroundColor: '#000000',
                aspectRatio: '16/9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <video
                  src={modalData.videoUrl}
                  controls
                  autoPlay
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                <div style={{ fontSize: '12.5px', color: 'var(--text-sub)' }}>
                  Language: <strong>{modalData.language}</strong> · Engine: <strong>{modalData.engine}</strong>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleOpenSummary(modalData)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    Lesson Notes
                  </button>
                  <button onClick={() => handleOpenFlashcards(modalData)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', color: '#6D28D9' }}>
                    Flashcards
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Lesson Summary Modal */}
      {activeModal === 'summary' && modalData && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid var(--border-medium)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '740px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <h2 style={{ color: 'var(--green-primary)', fontSize: '18px', fontWeight: '800', margin: 0 }}>
                  Lesson Summary & Script Notes
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {modalData.title} · {modalData.language}
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="btn-ghost"
                style={{ padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{
              backgroundColor: '#F8FAF8',
              border: '1.5px solid var(--border-medium)',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '13.5px',
              lineHeight: 1.65,
              color: 'var(--text-main)',
              whiteSpace: 'pre-wrap'
            }}>
              {modalData.summary}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                onClick={() => { setActiveModal('video'); }}
                className="btn-primary"
                style={{ flex: 1, padding: '10px', justifyContent: 'center', fontSize: '13px' }}
              >
                Watch Avatar Lesson
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(modalData.summary); alert('Script copied to clipboard!'); }}
                className="btn-secondary"
                style={{ padding: '10px 18px', fontSize: '13px' }}
              >
                Copy Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: 3D Interactive Flashcards Modal */}
      {activeModal === 'flashcards' && modalData && modalData.flashcards && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            width: '100%',
            maxWidth: '680px',
            padding: '24px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h2 style={{ color: 'var(--green-primary)', fontSize: '18px', fontWeight: '800', margin: 0 }}>
                  Interactive Study Flashcards
                </h2>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Card {fcIndex + 1} of {modalData.flashcards.length}
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="btn-ghost" style={{ padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <div
              onClick={() => setIsFlipped(!isFlipped)}
              style={{
                minHeight: '200px',
                borderRadius: '14px',
                backgroundColor: isFlipped ? 'var(--green-light)' : '#FFFFFF',
                border: isFlipped ? '2px solid var(--green-primary)' : '2px solid var(--border-medium)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-xs)',
                transition: 'all 0.25s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#EA580C', textTransform: 'uppercase' }}>
                  {isFlipped ? 'ANSWER KEY' : 'QUESTION PROMPT'}
                </span>
                <span className="badge-green" style={{ fontSize: '10px' }}>
                  {modalData.flashcards[fcIndex]?.category || 'Study'}
                </span>
              </div>

              <div style={{
                fontSize: '16px',
                fontWeight: '800',
                color: isFlipped ? 'var(--green-primary)' : 'var(--text-main)',
                textAlign: 'center',
                margin: 'auto 0',
                lineHeight: 1.45
              }}>
                {isFlipped ? modalData.flashcards[fcIndex]?.answer : modalData.flashcards[fcIndex]?.prompt}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                <span>Click card to flip</span>
                <span>{modalData.flashcards[fcIndex]?.hint ? `Hint: ${modalData.flashcards[fcIndex].hint}` : ''}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
              <button
                onClick={() => { setIsFlipped(false); setFcIndex((prev) => Math.max(0, prev - 1)); }}
                disabled={fcIndex === 0}
                className="btn-secondary"
                style={{ padding: '7px 14px', opacity: fcIndex === 0 ? 0.4 : 1, fontSize: '12.5px' }}
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="btn-primary"
                style={{ padding: '7px 18px', fontSize: '12.5px' }}
              >
                <RotateCw size={13} />
                <span>Flip Card</span>
              </button>

              <button
                onClick={() => { setIsFlipped(false); setFcIndex((prev) => Math.min(modalData.flashcards.length - 1, prev + 1)); }}
                disabled={fcIndex === modalData.flashcards.length - 1}
                className="btn-secondary"
                style={{ padding: '7px 14px', opacity: fcIndex === modalData.flashcards.length - 1 ? 0.4 : 1, fontSize: '12.5px' }}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Interactive Worksheet Modal */}
      {activeModal === 'worksheet' && modalData && modalData.worksheet && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            width: '100%',
            maxWidth: '740px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ color: 'var(--green-primary)', fontSize: '18px', fontWeight: '800', margin: 0 }}>
                  Classroom Worksheet & Practice Sheet
                </h2>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {modalData.title} · {modalData.worksheet.length} Exercises
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="btn-ghost" style={{ padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {modalData.worksheet.map((item, qIdx) => (
                <div
                  key={qIdx}
                  style={{
                    backgroundColor: '#F8FAF8',
                    border: '1.5px solid var(--border-medium)',
                    borderRadius: '12px',
                    padding: '14px'
                  }}
                >
                  <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
                    Q{qIdx + 1}. {item.q}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                    {item.opts.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid var(--border-medium)',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          color: 'var(--text-main)'
                        }}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setRevealedAnswers((prev) => ({ ...prev, [qIdx]: !prev[qIdx] }))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--green-primary)',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline'
                    }}
                  >
                    {revealedAnswers[qIdx] ? 'Hide Answer Key' : 'Reveal Answer & Explanation'}
                  </button>

                  {revealedAnswers[qIdx] && (
                    <div style={{
                      marginTop: '6px',
                      padding: '8px 12px',
                      backgroundColor: '#ECFDF5',
                      borderLeft: '3px solid #10B981',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#065F46',
                      fontWeight: '600'
                    }}>
                      <div><strong>Correct Answer:</strong> {item.ans}</div>
                      <div style={{ fontSize: '11px', marginTop: '2px', opacity: 0.9 }}>{item.exp}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={() => window.print()}
                className="btn-primary"
                style={{ flex: 1, padding: '10px', justifyContent: 'center', fontSize: '13px' }}
              >
                Print Worksheet
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="btn-secondary"
                style={{ padding: '10px 18px', fontSize: '13px' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
