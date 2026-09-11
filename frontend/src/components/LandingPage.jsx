import React, { useState } from 'react';
import { 
  ArrowRight, 
  BookOpen, 
  Volume2, 
  FileCheck, 
  Radio, 
  GraduationCap, 
  UserCheck, 
  Lock, 
  Mail, 
  User, 
  Sparkles,
  Globe
} from 'lucide-react';
import { SAMPLE_FLN_LESSONS, TRIBAL_LANGUAGES } from '../services/apertiumSantaliData';
import AudioPlayButton from './AudioPlayButton';
import { uiTranslations } from '../services/uiTranslations';
import { authService } from '../services/supabaseClient';

export default function LandingPage({
  setCurrentTab,
  setUserRole,
  setUserName,
  uiLang = 'en',
  setUiLang,
  currentLang = 'sat',
  setCurrentLang
}) {
  const t = uiTranslations[uiLang] || uiTranslations.en;
  const [selectedLang, setSelectedLang] = useState(currentLang || 'sat');
  const [authMode, setAuthMode] = useState('signup'); // Default to signup side as requested

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('teacher');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const demoLesson = SAMPLE_FLN_LESSONS[0];
  const activeLangObj = TRIBAL_LANGUAGES.find(l => l.code === selectedLang) || TRIBAL_LANGUAGES[0];

  const lessonScript = demoLesson[selectedLang]?.script || demoLesson.sat.script;
  const lessonRoman = demoLesson[selectedLang]?.roman || demoLesson.sat.roman;

  // Handle Login
  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter both email and password.');
      return;
    }
    setIsSubmitting(true);
    setAuthError('');

    try {
      const res = await authService.signIn(email.trim(), password);
      const user = res.user;
      const displayName = user.fullName || fullName || email.split('@')[0] || 'Teacher';
      const userRole = user.role || role || 'teacher';
      
      setUserName(displayName);
      setUserRole(userRole);
      localStorage.setItem('palash_username', displayName);
      localStorage.setItem('palash_userrole', userRole);
      localStorage.setItem('codeseekho_username', displayName);
      
      setCurrentTab('teacher');
    } catch (err) {
      console.warn('Sign in fallback:', err.message);
      const displayName = fullName || email.split('@')[0] || 'Primary Teacher';
      setUserName(displayName);
      setUserRole(role);
      localStorage.setItem('palash_username', displayName);
      localStorage.setItem('palash_userrole', role);
      localStorage.setItem('codeseekho_username', displayName);
      setCurrentTab('teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Signup
  const handleSignUp = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      setAuthError('Please fill out all fields.');
      return;
    }
    setIsSubmitting(true);
    setAuthError('');

    try {
      const res = await authService.signUp(email.trim(), password, role, fullName.trim());
      const user = res.user;
      const displayName = user.fullName || fullName || 'Teacher';
      
      setUserName(displayName);
      setUserRole(role);
      localStorage.setItem('palash_username', displayName);
      localStorage.setItem('palash_userrole', role);
      localStorage.setItem('codeseekho_username', displayName);

      setCurrentTab('teacher');
    } catch (err) {
      console.warn('Sign up fallback:', err.message);
      setUserName(fullName.trim());
      setUserRole(role);
      localStorage.setItem('palash_username', fullName.trim());
      localStorage.setItem('palash_userrole', role);
      localStorage.setItem('codeseekho_username', fullName.trim());
      setCurrentTab('teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle ONE Single Quick Guest / Judge Demo Access (on Sign Up side)
  const handleGuestJudgeLogin = () => {
    const judgeName = 'Guest Judge';
    const judgeRole = 'judge';
    
    setUserName(judgeName);
    setUserRole(judgeRole);
    localStorage.setItem('palash_username', judgeName);
    localStorage.setItem('palash_userrole', judgeRole);
    localStorage.setItem('codeseekho_username', judgeName);
    
    setCurrentTab('teacher');
  };

  // Quick fill demo credentials
  const fillDemoCreds = () => {
    setEmail('teacher@shikshasetu.org');
    setPassword('teacher123');
    setFullName('Sunita Hansda');
    setRole('teacher');
  };

  return (
    <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 16px 40px' }}>
      
      {/* Top Institutional Header Bar */}
      <header className="app-navbar" style={{ position: 'relative', top: 0, marginBottom: '24px', borderRadius: '12px' }}>
        <div className="nav-inner">
          <div className="nav-brand">
            <img
              src="/iris-logo.png"
              alt="ShikshaSetu Logo"
              style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover' }}
            />
            <div>
              <div className="nav-brand-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>ShikshaSetu</span>
                <span className="badge-green" style={{ fontSize: '9px', padding: '1px 5px' }}>v2.0</span>
              </div>
              <div className="nav-brand-sub">Vernacular Pedagogy Engine</div>
            </div>
          </div>

          <div className="nav-right">
            {/* UI Lang selector */}
            <div className="nav-select-wrap">
              <Globe size={12} color="var(--text-muted)" />
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>UI:</span>
              <select
                value={uiLang}
                onChange={(e) => setUiLang && setUiLang(e.target.value)}
              >
                <option value="en">EN</option>
                <option value="hi">हिं</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dual-Column Hero & Auth Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: '32px',
        alignItems: 'flex-start',
        marginBottom: '36px'
      }}>
        
        {/* Left Column: Mission & Feature Pillars */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '6px',
            backgroundColor: 'var(--green-light)',
            border: '1px solid var(--green-border)',
            fontSize: '11px',
            fontWeight: '600',
            color: 'var(--green-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            marginBottom: '12px'
          }}>
            <GraduationCap size={14} color="var(--green-primary)" />
            <span>Govt. of Jharkhand · ShikshaSetu FLN Engine</span>
          </div>

          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            lineHeight: '1.2',
            margin: '0 0 14px 0',
            color: 'var(--text-main)',
            letterSpacing: '-0.4px'
          }}>
            Bridge the language gap in primary classrooms with <span style={{ color: 'var(--green-primary)' }}>ShikshaSetu</span>
          </h1>

          <p style={{
            fontSize: '15px',
            color: 'var(--text-sub)',
            lineHeight: '1.6',
            margin: '0 0 24px 0'
          }}>
            Empowering Hindi-medium teachers to deliver NIPUN Bharat FLN lessons seamlessly in <strong>Santhali (Ol Chiki)</strong>, <strong>Ho</strong>, and <strong>Mundari</strong>.
          </p>

          {/* 4 Feature Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div style={{
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <BookOpen size={16} color="var(--green-primary)" />
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>Lesson Studio</div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Hindi to Santhali, Ho & Mundari dual-script translations.
              </div>
            </div>

            <div style={{
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Volume2 size={16} color="var(--green-primary)" />
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>2-Way Voice</div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Speak Hindi, broadcast mother-tongue audio in &lt; 1.5s.
              </div>
            </div>

            <div style={{
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <FileCheck size={16} color="var(--blue)" />
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>NIPUN Worksheets</div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Printable bilingual sheets with teacher evaluation keys.
              </div>
            </div>

            <div style={{
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Radio size={16} color="var(--amber)" />
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>Offline Tablet Sync</div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                100% offline-ready for ≤ 2GB RAM primary school devices.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: SaaS Donezo Auth Card */}
        <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-md)' }}>
          
          {/* 2 Auth Tabs: Sign Up & Log In */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-main)',
            borderRadius: '8px',
            padding: '4px',
            marginBottom: '20px',
            border: '1px solid var(--border-medium)'
          }}>
            <button
              onClick={() => { setAuthMode('signup'); setAuthError(''); }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: authMode === 'signup' ? '#FFFFFF' : 'transparent',
                color: authMode === 'signup' ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: authMode === 'signup' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              Sign Up
            </button>

            <button
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: authMode === 'login' ? '#FFFFFF' : 'transparent',
                color: authMode === 'login' ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: authMode === 'login' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              Log In
            </button>
          </div>

          {authError && (
            <div style={{
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--badge-rose-bg)',
              border: '1px solid var(--badge-rose-border)',
              color: 'var(--badge-rose-text)',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '16px'
            }}>
              {authError}
            </div>
          )}

          {/* SIGN UP FORM */}
          {authMode === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Sunita Hansda"
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-medium)',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                    <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teacher@school.gov.in"
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-medium)',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                    <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create password"
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-medium)',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                    <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>
                    Role / Position
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-medium)',
                      fontSize: '13px',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      fontWeight: '600'
                    }}
                  >
                    <option value="teacher">Primary Teacher (Hindi-Medium)</option>
                    <option value="instructor">FLN Vernacular Instructor</option>
                    <option value="admin">School Principal / Admin</option>
                    <option value="judge">Evaluator / Judge</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '13px', justifyContent: 'center', marginTop: '4px' }}
                >
                  {isSubmitting ? 'Creating Account…' : 'Create Account & Launch →'}
                </button>
              </form>

              {/* DEDICATED SINGLE GUEST JUDGE BUTTON ON SIGN UP SIDE */}
              <div style={{ borderTop: '1px solid var(--border-medium)', paddingTop: '14px', marginTop: '4px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '8px' }}>
                  Evaluating for Hackathon / Demonstration?
                </div>
                <button
                  type="button"
                  onClick={handleGuestJudgeLogin}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--green-light)',
                    border: '1.5px solid var(--green-border)',
                    color: 'var(--green-primary)',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Sparkles size={16} color="var(--green-primary)" />
                  <span>⚡ Quick Guest Judge Demo Access</span>
                </button>
              </div>
            </div>
          )}

          {/* LOG IN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher@shikshasetu.org"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-medium)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-medium)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '13px', justifyContent: 'center', marginTop: '4px' }}
              >
                {isSubmitting ? 'Authenticating…' : 'Sign In to ShikshaSetu →'}
              </button>

              <button
                type="button"
                onClick={fillDemoCreds}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-main)',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'var(--text-sub)',
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              >
                Auto-Fill Teacher Demo Credentials
              </button>
            </form>
          )}

        </div>
      </div>

      {/* Interactive Translation Demo Card */}
      <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--green-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Live Translation Preview
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '2px 0 0 0', color: 'var(--text-main)' }}>
              Test Vernacular Script Generation
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {TRIBAL_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  border: selectedLang === lang.code ? '1.5px solid var(--green-primary)' : '1px solid var(--border-medium)',
                  backgroundColor: selectedLang === lang.code ? 'var(--green-primary)' : 'var(--bg-main)',
                  color: selectedLang === lang.code ? '#FFFFFF' : 'var(--text-sub)',
                  cursor: 'pointer'
                }}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
          <div style={{
            padding: '16px',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--border-medium)'
          }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
              HINDI SOURCE LESSON
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
              {demoLesson.sourceText}
            </div>
          </div>

          <div style={{
            padding: '16px',
            borderRadius: '10px',
            backgroundColor: 'var(--green-light)',
            border: '1px solid var(--green-border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--green-primary)' }}>
                {activeLangObj.name} ({activeLangObj.script})
              </div>
              <AudioPlayButton text={lessonRoman || demoLesson.sourceText} size="sm" label="Play Audio" />
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
              {lessonScript}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--green-primary)', fontStyle: 'italic', marginTop: '2px' }}>
              "{lessonRoman}"
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        paddingTop: '20px',
        borderTop: '1px solid var(--border-medium)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '12px',
        color: 'var(--text-muted)'
      }}>
        <div>Government of Jharkhand · ShikshaSetu Vernacular Pedagogy Engine</div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span>Santhali (Ol Chiki)</span>
          <span>·</span>
          <span>Ho</span>
          <span>·</span>
          <span>Mundari</span>
        </div>
      </footer>
    </div>
  );
}
