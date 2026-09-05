import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import SantaliStudio from './components/SantaliStudio';
import WorksheetGenerator from './components/WorksheetGenerator';
import LivePhrasebook from './components/LivePhrasebook';
import AIMentorPage from './components/AIMentorPage';
import TeacherDashboard from './components/TeacherDashboard';
import NCERTSection from './components/NCERTSection';
import MyProjectsWorkspace from './components/MyProjectsWorkspace';
import { initOfflineStorage } from './services/offlineSync';

export default function App() {
  const [currentTab, setCurrentTab] = useState('landing');
  const [currentLang, setCurrentLang] = useState('sat'); // Default to Santhali (Ol Chiki)
  const [uiLang, setUiLangState] = useState(
    localStorage.getItem('palash_uilang') || 'en'
  );
  const [userRole, setUserRoleState] = useState(
    localStorage.getItem('palash_userrole') || localStorage.getItem('codeseekho_userrole') || 'teacher'
  );
  const [userName, setUserName] = useState(
    localStorage.getItem('palash_username') || localStorage.getItem('codeseekho_username') || ''
  );

  const setUiLang = (lang) => {
    setUiLangState(lang);
    localStorage.setItem('palash_uilang', lang);
  };

  useEffect(() => {
    initOfflineStorage();
  }, []);

  const setUserRole = (role) => {
    setUserRoleState(role);
    localStorage.setItem('palash_userrole', role);
  };

  const handleSetUserName = (name) => {
    setUserName(name);
    localStorage.setItem('palash_username', name);
  };

  const [selectedProject, setSelectedProject] = useState({
    id: 'calculator',
    title: 'Interactive Math & Logic Sandbox',
    emoji: '🧮',
    codeSnippet: `# Interactive Logic & Arithmetic Sandbox
total = 0
for count in range(1, 6):
    total += count
    print(f"Count {count} -> Running Sum = {total}")

print("Final Sum:", total)
`
  });

  const handleSetTab = (tab) => {
    const activeUser = userName || localStorage.getItem('palash_username') || localStorage.getItem('codeseekho_username');
    if (!activeUser && tab !== 'landing') {
      return;
    }
    setCurrentTab(tab);
    window.scrollTo(0, 0);
  };

  return (
    <div className="app-container">
      {/* Government Standard Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleSetTab}
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        uiLang={uiLang}
        setUiLang={setUiLang}
        userRole={userRole}
        setUserRole={setUserRole}
        userName={userName}
        setUserName={handleSetUserName}
      />

      {/* Main Content Body */}
      <main className="main-content">
        {currentTab === 'landing' && (
          <LandingPage
            setCurrentTab={handleSetTab}
            setUserRole={setUserRole}
            setUserName={handleSetUserName}
            uiLang={uiLang}
            currentLang={currentLang}
          />
        )}

        {/* FLN Lesson Translation & Scripting Studio */}
        {currentTab === 'santali-studio' && (
          <SantaliStudio
            setCurrentTab={handleSetTab}
            uiLang={uiLang}
            currentLang={currentLang}
            setCurrentLang={setCurrentLang}
          />
        )}

        {/* Real-time Voice Translation & Classroom Dialogue Module */}
        {currentTab === 'phrasebook' && (
          <LivePhrasebook 
            uiLang={uiLang}
            currentLang={currentLang}
            setCurrentLang={setCurrentLang}
          />
        )}

        {/* Auto-Generated NIPUN Bharat Worksheets & Flashcards */}
        {currentTab === 'worksheets' && (
          <WorksheetGenerator 
            uiLang={uiLang}
            currentLang={currentLang}
          />
        )}

        {/* PALASH Teacher Progress Dashboard */}
        {currentTab === 'teacher' && (
          <TeacherDashboard 
            uiLang={uiLang}
            currentLang={currentLang}
          />
        )}

        {/* Vernacular Pedagogy Assistant */}
        {currentTab === 'ai-mentor' && (
          <AIMentorPage
            currentLang={currentLang}
            userName={userName}
            uiLang={uiLang}
          />
        )}

        {/* Curriculum Hub with embedded Coding Lab entry */}
        {currentTab === 'ncert' && (
          <NCERTSection
            setCurrentTab={handleSetTab}
            setSelectedProject={setSelectedProject}
            uiLang={uiLang}
            currentLang={currentLang}
          />
        )}

        {/* Embedded Secondary Coding Sandbox (linked from NCERT Computer Science) */}
        {currentTab === 'coding-workspace' && (
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-medium)',
              borderRadius: '8px',
              padding: '10px 16px',
              marginBottom: '16px'
            }}>
              <div>
                <strong>Interactive Coding Sandbox</strong> · Sub-module of NCERT Computer Science (Secondary Education)
              </div>
              <button
                onClick={() => setCurrentTab('ncert')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ← Back to Curriculum Hub
              </button>
            </div>
            <MyProjectsWorkspace
              selectedProject={selectedProject}
              islMode={false}
              currentLang={currentLang}
              userName={userName}
            />
          </div>
        )}
      </main>

      {/* Official Government Footer */}
      <footer style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-medium)',
        padding: '18px 24px',
        textAlign: 'center',
        fontSize: '12px',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <strong>PALASH IRIS</strong> · AI-Powered Vernacular Pedagogy and Real-Time Translation Tool for Mother Tongue-Based Primary Education
          </div>
          <div style={{ display: 'flex', gap: '14px', fontSize: '11px' }}>
            <span>Govt. of Jharkhand (Problem Statement 26042)</span>
            <span>•</span>
            <span>Santhali · Ho · Mundari</span>
            <span>•</span>
            <span>NIPUN Bharat Aligned</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
