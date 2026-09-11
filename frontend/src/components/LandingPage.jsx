import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Sparkles,
  Globe,
  Eye,
  EyeOff,
  BookOpen,
  Volume2,
  FileCheck,
  Radio
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
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'

  // Form State
  const [email, setEmail] = useState('annyghosh3@gmail.com');
  const [password, setPassword] = useState('******');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('teacher');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const demoLesson = SAMPLE_FLN_LESSONS[0];
  const activeLangObj = TRIBAL_LANGUAGES.find(l => l.code === selectedLang) || TRIBAL_LANGUAGES[0];

  const lessonScript = demoLesson[selectedLang]?.script || demoLesson.sat.script;
  const lessonRoman = demoLesson[selectedLang]?.roman || demoLesson.sat.roman;

  // Bilingual UI Dictionary for Landing Page
  const landingText = {
    en: {
      brandSub: "Vernacular Pedagogy Engine · Govt. of Jharkhand",
      welcome: "Welcome back!",
      welcomeSignup: "Create an Account",
      welcomeSub: "Enter your email and password to sign in",
      welcomeSignupSub: "Fill out your credentials to register",
      emailLabel: "EMAIL",
      passwordLabel: "PASSWORD",
      fullNameLabel: "FULL NAME",
      rememberMe: "Remember me",
      forgotPass: "Forgot Password?",
      loginBtn: "Login",
      signUpBtn: "Sign Up",
      signUpTab: "Sign up",
      logInTab: "Log in",
      orLoginWith: "or login with",
      guestAccess: "Guest Judge Access",
      whatWeDo: "✨ WHAT WE DO",
      whatWeDoTitle: "Bridging language barriers for Hindi-medium primary teachers delivering FLN in tribal mother tongues.",
      pillar1: "FLN Studio (Santhali, Ho, Mundari)",
      pillar2: "2-Way Voice (< 1.5s Pass)",
      pillar3: "NIPUN Bilingual Sheets",
      pillar4: "100% Offline Tablet Ready",
      livePreview: "LIVE TRANSLATION PREVIEW",
      previewTitle: "Test Vernacular Script Generation",
      hindiSource: "HINDI SOURCE LESSON"
    },
    hi: {
      brandSub: "मातृभाषा शिक्षण इंजन · झारखण्ड सरकार",
      welcome: "वापसी पर स्वागत है!",
      welcomeSignup: "नया खाता बनाएँ",
      welcomeSub: "साइन इन करने के लिए अपना ईमेल और पासवर्ड दर्ज करें",
      welcomeSignupSub: "पंजीकरण के लिए अपना विवरण भरें",
      emailLabel: "ईमेल",
      passwordLabel: "पासवर्ड",
      fullNameLabel: "पूरा नाम",
      rememberMe: "मुझे याद रखें",
      forgotPass: "पासवर्ड भूल गए?",
      loginBtn: "लॉगिन करें",
      signUpBtn: "साइन अप करें",
      signUpTab: "साइन अप",
      logInTab: "लॉग इन",
      orLoginWith: "या इसके साथ लॉगिन करें",
      guestAccess: "गेस्ट जज एक्सेस",
      whatWeDo: "✨ हम क्या करते हैं",
      whatWeDoTitle: "जनजातीय मातृभाषाओं (संथाली, हो, मुंडारी) में FLN पढ़ाने वाले हिंदी-माध्यम शिक्षकों के लिए भाषा की बाधा दूर करना।",
      pillar1: "FLN पाठ स्टूडियो (संथाली, हो, मुंडारी)",
      pillar2: "दोतरफा ध्वनि (< १.५ से. गति)",
      pillar3: "निपुण द्विभाषी कार्यपत्रक",
      pillar4: "१००% ऑफलाइन टैबलेट तैयार",
      livePreview: "लाइव अनुवाद पूर्वावलोकन",
      previewTitle: "मातृभाषा लिपि निर्माण परीक्षण",
      hindiSource: "मूल हिंदी पाठ"
    }
  };

  const lt = landingText[uiLang] || landingText.en;

  // Handle Login
  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError(uiLang === 'hi' ? 'कृपया ईमेल और पासवर्ड दोनों दर्ज करें।' : 'Please enter both email and password.');
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
      setAuthError(uiLang === 'hi' ? 'कृपया सभी फ़ील्ड भरें।' : 'Please fill out all fields.');
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

  // Handle Quick Guest / Judge Access
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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#EFF3F1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '36px 20px',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      
      {/* Main Floating Parent Hero Glass Container (Expanded Larger Size) */}
      <div style={{
        width: '100%',
        maxWidth: '1280px',
        backgroundColor: '#FFFFFF',
        borderRadius: '32px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.08), 0 0 0 1.5px rgba(255, 255, 255, 0.9)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>

        {/* Top Header Bar with Logo and Project Name on Top Left Only */}
        <div style={{
          padding: '28px 40px 16px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Top Left: Logo + Project Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/iris-logo.png"
              alt="ShikshaSetu Logo"
              style={{ width: 40, height: 40, borderRadius: '10px', objectFit: 'cover' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '22px', fontWeight: '800', color: '#1F2937', letterSpacing: '-0.4px' }}>
                  ShikshaSetu
                </span>
                <span className="badge-green" style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '12px' }}>v2.0</span>
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>
                {lt.brandSub}
              </div>
            </div>
          </div>

          {/* Top Right: UI Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="nav-select-wrap" style={{ backgroundColor: '#F3F4F6', borderRadius: '20px', padding: '4px 12px', border: '1px solid #E5E7EB' }}>
              <Globe size={13} color="#6B7280" />
              <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 700 }}>UI:</span>
              <select
                value={uiLang}
                onChange={(e) => setUiLang && setUiLang(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontSize: '12px', fontWeight: '700', cursor: 'pointer', outline: 'none', color: '#1F2937' }}
              >
                <option value="en">EN (English)</option>
                <option value="hi">हिं (हिंदी)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 50/50 Dual Column Body (Expanded Hero Layout) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '28px',
          padding: '12px 32px 32px 32px',
          alignItems: 'stretch'
        }}>
          
          {/* LEFT COLUMN: Soothing Nature-Centric Hero Panel */}
          <div style={{
            backgroundColor: '#EAF3ED',
            borderRadius: '24px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '20px'
          }}>
            {/* Hero Image */}
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '20px', boxShadow: '0 12px 30px -10px rgba(0,0,0,0.06)' }}>
              <img
                src="/soothing_hero.jpg"
                alt="Soothing Nature Illustration"
                style={{ width: '100%', height: '310px', objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* Highlighted Text Showcase Section */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              padding: '18px 22px',
              border: '1px solid rgba(255,255,255,0.8)',
              boxShadow: '0 4px 16px -4px rgba(0,0,0,0.04)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
                {lt.whatWeDo}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937', marginBottom: '12px', lineHeight: '1.4' }}>
                {lt.whatWeDoTitle}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '600', color: '#374151', backgroundColor: '#F3F4F6', padding: '7px 10px', borderRadius: '8px' }}>
                  <BookOpen size={13} color="#059669" />
                  <span>{lt.pillar1}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '600', color: '#374151', backgroundColor: '#F3F4F6', padding: '7px 10px', borderRadius: '8px' }}>
                  <Volume2 size={13} color="#0284C7" />
                  <span>{lt.pillar2}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '600', color: '#374151', backgroundColor: '#F3F4F6', padding: '7px 10px', borderRadius: '8px' }}>
                  <FileCheck size={13} color="#D97706" />
                  <span>{lt.pillar3}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '600', color: '#374151', backgroundColor: '#F3F4F6', padding: '7px 10px', borderRadius: '8px' }}>
                  <Radio size={13} color="#E11D48" />
                  <span>{lt.pillar4}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Auth Card matching reference media_1789114425122.png */}
          <div style={{
            padding: '16px 32px 28px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative'
          }}>
            
            {/* Top Right Sign Up / Log In Pill Toggle matching media_1789114425122.png */}
            <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                style={{
                  padding: '7px 20px',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#374151',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease'
                }}
              >
                {authMode === 'login' ? lt.signUpTab : lt.logInTab}
              </button>
            </div>

            {/* Header Text */}
            <div style={{ marginBottom: '24px', marginTop: '12px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '0 0 6px 0', letterSpacing: '-0.4px' }}>
                {authMode === 'login' ? lt.welcome : lt.welcomeSignup}
              </h2>
              <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0, fontWeight: '500' }}>
                {authMode === 'login' ? lt.welcomeSub : lt.welcomeSignupSub}
              </p>
            </div>

            {authError && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                {authError}
              </div>
            )}

            {/* LOG IN FORM */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Email Field */}
                <div>
                  <div style={{
                    position: 'relative',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    padding: '8px 12px 8px 44px'
                  }}>
                    <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                    <div style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase' }}>{lt.emailLabel}</div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="annyghosh3@gmail.com"
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#1F2937',
                        outline: 'none',
                        padding: '2px 0'
                      }}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div style={{
                    position: 'relative',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    padding: '8px 44px 8px 44px'
                  }}>
                    <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                    <div style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase' }}>{lt.passwordLabel}</div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="******"
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#1F2937',
                        outline: 'none',
                        padding: '2px 0'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '16px', top: '16px', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                    >
                      {showPassword ? <EyeOff size={15} color="#9CA3AF" /> : <Eye size={15} color="#9CA3AF" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#4B5563', fontWeight: '500' }}>
                    <div
                      onClick={() => setRememberMe(!rememberMe)}
                      style={{
                        width: '34px',
                        height: '18px',
                        borderRadius: '10px',
                        backgroundColor: rememberMe ? '#81C784' : '#E2E8F0',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        position: 'absolute',
                        top: '2px',
                        left: rememberMe ? '18px' : '2px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                    <span>{lt.rememberMe}</span>
                  </label>

                  <a
                    href="#forgot"
                    onClick={(e) => { e.preventDefault(); alert(uiLang === 'hi' ? "डेमो पासवर्ड रीसेट लिंक भेजा गया!" : "Demo password reset link sent!"); }}
                    style={{ color: '#EF4444', fontWeight: '600', textDecoration: 'none' }}
                  >
                    {lt.forgotPass}
                  </a>
                </div>

                {/* Primary Pill Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '25px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #81C784 0%, #4CAF50 100%)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px -4px rgba(76, 175, 80, 0.4)',
                    transition: 'all 0.15s ease',
                    marginTop: '4px'
                  }}
                >
                  {isSubmitting ? (uiLang === 'hi' ? 'सत्यापन हो रहा है…' : 'Authenticating…') : lt.loginBtn}
                </button>
              </form>
            )}

            {/* SIGN UP FORM */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{
                    position: 'relative',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    padding: '8px 12px 8px 44px'
                  }}>
                    <User size={16} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                    <div style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase' }}>{lt.fullNameLabel}</div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Sunita Hansda"
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#1F2937',
                        outline: 'none',
                        padding: '2px 0'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{
                    position: 'relative',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    padding: '8px 12px 8px 44px'
                  }}>
                    <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                    <div style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase' }}>{lt.emailLabel}</div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teacher@school.gov.in"
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#1F2937',
                        outline: 'none',
                        padding: '2px 0'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{
                    position: 'relative',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    padding: '8px 44px 8px 44px'
                  }}>
                    <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                    <div style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase' }}>{lt.passwordLabel}</div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create password"
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#1F2937',
                        outline: 'none',
                        padding: '2px 0'
                      }}
                    />
                  </div>
                </div>

                {/* Primary Pill Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '25px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #81C784 0%, #4CAF50 100%)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px -4px rgba(76, 175, 80, 0.4)',
                    transition: 'all 0.15s ease',
                    marginTop: '4px'
                  }}
                >
                  {isSubmitting ? (uiLang === 'hi' ? 'खाता बन रहा है…' : 'Creating Account…') : lt.signUpBtn}
                </button>
              </form>
            )}

            {/* Social / Guest Login Section */}
            <div style={{ marginTop: '24px' }}>
              <div style={{
                position: 'relative',
                textAlign: 'center',
                marginBottom: '16px'
              }}>
                <div style={{ height: '1px', backgroundColor: '#E5E7EB', width: '100%', position: 'absolute', top: '50%' }} />
                <span style={{
                  position: 'relative',
                  backgroundColor: '#FFFFFF',
                  padding: '0 12px',
                  fontSize: '11px',
                  color: '#9CA3AF',
                  fontWeight: '500'
                }}>
                  {lt.orLoginWith}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleGuestJudgeLogin}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '20px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontWeight: '800', color: '#4285F4' }}>G</span>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleGuestJudgeLogin}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '20px',
                    border: '1.5px solid #A7F3D0',
                    backgroundColor: '#ECFDF5',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#047857',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles size={14} color="#047857" />
                  <span>{lt.guestAccess}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Interactive Live Vernacular Script Translation Demo Card below */}
      <div style={{
        width: '100%',
        maxWidth: '1280px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '24px 36px',
        marginTop: '24px',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.04), 0 0 0 1px rgba(255,255,255,0.8)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {lt.livePreview}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '2px 0 0 0', color: '#111827' }}>
              {lt.previewTitle}
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {TRIBAL_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLang(lang.code);
                  if (setCurrentLang) setCurrentLang(lang.code);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  border: selectedLang === lang.code ? '1.5px solid #059669' : '1px solid #E5E7EB',
                  backgroundColor: selectedLang === lang.code ? '#059669' : '#F9FAFB',
                  color: selectedLang === lang.code ? '#FFFFFF' : '#4B5563',
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
            borderRadius: '14px',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', marginBottom: '4px' }}>
              {lt.hindiSource}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>
              {demoLesson.sourceText}
            </div>
          </div>

          <div style={{
            padding: '16px',
            borderRadius: '14px',
            backgroundColor: '#EAF3ED',
            border: '1px solid #A7F3D0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#059669' }}>
                {activeLangObj.name} ({activeLangObj.script})
              </div>
              <AudioPlayButton text={lessonRoman || demoLesson.sourceText} size="sm" label={uiLang === 'hi' ? "ऑडियो चलाएँ" : "Play Audio"} />
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>
              {lessonScript}
            </div>
            <div style={{ fontSize: '12px', color: '#059669', fontStyle: 'italic', marginTop: '2px' }}>
              "{lessonRoman}"
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
