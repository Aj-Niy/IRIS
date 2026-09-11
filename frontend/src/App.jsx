import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
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
  const [currentTab, setCurrentTab] = useState(
    localStorage.getItem('palash_username') ? 'teacher' : 'landing'
  );
  const [currentLang, setCurrentLang] = useState('sat');
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

  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    setCurrentTab(tab);
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  };

  if (currentTab === 'landing') {
    return (
      <LandingPage
        setCurrentTab={handleSetTab}
        setUserRole={setUserRole}
        setUserName={handleSetUserName}
        uiLang={uiLang}
        currentLang={currentLang}
      />
    );
  }

  return (
    <div className="app-layout">
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={handleSetTab}
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        uiLang={uiLang}
        setUiLang={setUiLang}
        userName={userName}
        setUserName={handleSetUserName}
        userRole={userRole}
        setUserRole={setUserRole}
        open={sidebarOpen}
      />

      <div className="app-workspace">
        <TopHeader
          currentTab={currentTab}
          setCurrentTab={handleSetTab}
          uiLang={uiLang}
          currentLang={currentLang}
          userName={userName}
          onMenu={() => setSidebarOpen(true)}
        />

        <main className="main-content">
          {currentTab === 'teacher' && (
            <TeacherDashboard
              uiLang={uiLang}
              currentLang={currentLang}
              setCurrentTab={handleSetTab}
            />
          )}

          {currentTab === 'santali-studio' && (
            <SantaliStudio
              setCurrentTab={handleSetTab}
              uiLang={uiLang}
              currentLang={currentLang}
              setCurrentLang={setCurrentLang}
            />
          )}

          {currentTab === 'phrasebook' && (
            <LivePhrasebook
              uiLang={uiLang}
              currentLang={currentLang}
              setCurrentLang={setCurrentLang}
            />
          )}

          {currentTab === 'worksheets' && (
            <WorksheetGenerator
              uiLang={uiLang}
              currentLang={currentLang}
            />
          )}

          {currentTab === 'ai-mentor' && (
            <AIMentorPage
              currentLang={currentLang}
              userName={userName}
              uiLang={uiLang}
            />
          )}

          {currentTab === 'ncert' && (
            <NCERTSection
              setCurrentTab={handleSetTab}
              setSelectedProject={setSelectedProject}
              uiLang={uiLang}
              currentLang={currentLang}
            />
          )}

          {currentTab === 'coding-workspace' && (
            <div>
              <div className="page-head">
                <div>
                  <h1>Coding sandbox</h1>
                  <p>NCERT Computer Science practice environment.</p>
                </div>
                <button className="btn-secondary" onClick={() => setCurrentTab('ncert')}>
                  Back to curriculum
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
      </div>
    </div>
  );
}
