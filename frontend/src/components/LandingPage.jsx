import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { SAMPLE_FLN_LESSONS, TRIBAL_LANGUAGES } from '../services/apertiumSantaliData';
import AudioPlayButton from './AudioPlayButton';
import { uiTranslations } from '../services/uiTranslations';

export default function LandingPage({
  setCurrentTab,
  setUserRole,
  setUserName,
  uiLang = 'en',
  currentLang = 'sat'
}) {
  const t = uiTranslations[uiLang] || uiTranslations.en;
  const [selectedLang, setSelectedLang] = useState(currentLang || 'sat');
  const demoLesson = SAMPLE_FLN_LESSONS[0];
  const activeLangObj = TRIBAL_LANGUAGES.find(l => l.code === selectedLang) || TRIBAL_LANGUAGES[0];

  const handleLaunch = (tab = 'teacher') => {
    if (setUserName) setUserName('Primary Teacher');
    if (setUserRole) setUserRole('teacher');
    localStorage.setItem('palash_username', 'Primary Teacher');
    localStorage.setItem('palash_userrole', 'teacher');
    setCurrentTab(tab);
  };

  const lessonScript = demoLesson[selectedLang]?.script || demoLesson.sat.script;
  const lessonRoman = demoLesson[selectedLang]?.roman || demoLesson.sat.roman;

  const tools = [
    { id: 'santali-studio', title: t.nav.flnStudio, desc: t.landing.pillar1Desc },
    { id: 'phrasebook', title: t.nav.voiceEngine, desc: t.landing.pillar2Desc },
    { id: 'worksheets', title: t.nav.worksheets, desc: t.landing.pillar3Desc },
    { id: 'ncert', title: t.nav.curriculumHub, desc: t.landing.pillar4Desc }
  ];

  return (
    <div className="portal">
      <header className="portal-bar">
        <div className="sidebar-header" style={{ padding: 0 }}>
          <img src="/iris-logo.png" alt="PALASH IRIS" className="sidebar-logo" />
          <div>
            <div className="sidebar-brand">PALASH <span>IRIS</span></div>
            <div className="quiet">PALASH schools · FLN</div>
          </div>
        </div>
        <button className="btn-primary" onClick={() => handleLaunch('teacher')}>
          {t.common.teacherLogin}
          <ArrowRight size={15} />
        </button>
      </header>

      <div className="portal-body">
        <div className="page-head">
          <div>
            <h1>{t.landing.title}</h1>
            <p>{t.landing.subtitle}</p>
          </div>
          <div className="seg">
            {TRIBAL_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                className={selectedLang === lang.code ? 'active' : ''}
                onClick={() => setSelectedLang(lang.code)}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        <div className="stats-grid portal-tools">
          {tools.map(tool => (
            <button key={tool.id} className="stat-card-white tool-tile" onClick={() => handleLaunch(tool.id)}>
              <div className="tool-tile-title">{tool.title}</div>
              <p>{tool.desc}</p>
            </button>
          ))}
        </div>

        <div className="dash-row a">
          <div className="card">
            <div className="quiet" style={{ marginBottom: 8 }}>{demoLesson.grade} · {demoLesson.subject}</div>
            <h2 className="card-title">{demoLesson.title}</h2>
            <div className="script-block" style={{ marginTop: 16 }}>
              <div className="quiet">Hindi</div>
              <p className="body-copy">{demoLesson.sourceText}</p>
            </div>
            <div className="script-block script-block-plain" style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div className="quiet">{activeLangObj.name}</div>
                <AudioPlayButton text={lessonRoman || demoLesson.sourceText} size="sm" label={t.fln.pronounce} showStop={false} />
              </div>
              <div className="script-native">{lessonScript}</div>
              <div className="script-roman">{lessonRoman}</div>
            </div>
          </div>

          <div className="card portal-side">
            <h2 className="card-title">Classroom</h2>
            <p className="body-copy" style={{ margin: '8px 0 20px' }}>
              Built for Hindi-medium teachers in PALASH primary schools. Open the workspace to plan, speak, and print.
            </p>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => handleLaunch('teacher')}>
              {t.landing.launchBtn}
            </button>
          </div>
        </div>
      </div>

      <footer className="portal-foot">
        <span>Government of Jharkhand · PALASH IRIS</span>
        <span>Santhali · Ho · Mundari</span>
      </footer>
    </div>
  );
}
