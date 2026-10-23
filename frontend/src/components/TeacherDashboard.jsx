import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  RefreshCw, Plus, CheckCircle2, ArrowUpRight, Play,
  Eye, EyeOff, Trash2, ChevronDown, ChevronUp, TrendingUp, X
} from 'lucide-react';
import { irisGetDashboardStats, irisSyncOfflineProgress } from '../services/api';
import { getPendingOfflineLogs, getLastSyncTime } from '../services/offlineSync';
import { uiTranslations } from '../services/uiTranslations';
import { getVocabStats, getVocabEntries, removeVocabEntry } from '../services/vocabMemory';

export default function TeacherDashboard({
  uiLang = 'en',
  currentLang = 'sat',
  setCurrentTab
}) {
  const t = uiTranslations[uiLang] || uiTranslations.en;
  const [flnStats, setFlnStats] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [pendingLogsCount, setPendingLogsCount] = useState(0);
  const [lastSync, setLastSync] = useState(getLastSyncTime());
  const [vocabStats, setVocabStats] = useState(null);
  const [vocabEntries, setVocabEntries] = useState([]);
  const [showVocabHub, setShowVocabHub] = useState(() => {
    return localStorage.getItem('iris_hide_vocab_hub') !== 'true';
  });
  const [expandedVocab, setExpandedVocab] = useState(false);

  const loadData = async () => {
    try {
      const stats = await irisGetDashboardStats();
      setFlnStats(stats);
      setPendingLogsCount(getPendingOfflineLogs().length);
      setLastSync(getLastSyncTime());
    } catch (err) {
      console.warn('Dashboard data fetch error:', err);
    }
    // Always load vocab from localStorage (offline-first, no network required)
    setVocabStats(getVocabStats());
    setVocabEntries(getVocabEntries());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const res = await irisSyncOfflineProgress('teacher-demo-01', 'JH-RANCHI-042');
      if (res.success) {
        setSyncMessage(`Synced ${res.syncedCount || 0} classroom logs.`);
        setPendingLogsCount(0);
        setLastSync(new Date().toLocaleTimeString());
      } else {
        setSyncMessage('Offline. Logs are stored on this tablet.');
      }
    } catch (err) {
      setSyncMessage('Offline-first mode is on.');
    } finally {
      setSyncing(false);
    }
  };

  const nipunChartData = [
    { name: 'S', mastered: 65 },
    { name: 'M', mastered: 88 },
    { name: 'T', mastered: 74 },
    { name: 'W', mastered: 92 },
    { name: 'T2', mastered: 68 },
    { name: 'F', mastered: 85 },
    { name: 'S2', mastered: 71 },
  ];

  const SOURCE_PILL = {
    lesson:      { className: 'pill info', label: 'Lesson' },
    voice:       { className: 'pill ok',   label: 'Voice' },
    translation: { className: 'pill warn', label: 'Translation' }
  };

  const handleToggleHubVocab = (show) => {
    setShowVocabHub(show);
    if (show) {
      localStorage.removeItem('iris_hide_vocab_hub');
    } else {
      localStorage.setItem('iris_hide_vocab_hub', 'true');
    }
  };

  const handleRemoveWord = (id) => {
    removeVocabEntry(id);
    setVocabEntries(getVocabEntries());
    setVocabStats(getVocabStats());
  };

  const formatWordContext = (context) => {
    if (!context) return '';
    let clean = context.replace(/Classroom voice phrase/gi, '').replace(/[·•]/g, '').trim();
    if (clean.length > 26) {
      clean = clean.substring(0, 24) + '…';
    }
    return clean;
  };

  const formatTranslation = (hindi) => {
    if (!hindi) return '—';
    if (hindi.length > 34) {
      return hindi.substring(0, 32) + '…';
    }
    return hindi;
  };

  const displayedWords = expandedVocab ? vocabEntries : vocabEntries.slice(0, 4);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{t.dashboard.title}</h1>
          <p>{t.dashboard.subtitle}</p>
        </div>
        <div className="actions">
          {!showVocabHub && (
            <button
              className="btn-secondary"
              onClick={() => handleToggleHubVocab(true)}
              title="Restore Words in use to display hub"
            >
              <Eye size={14} /> Words in use
            </button>
          )}
          <button className="btn-primary" onClick={() => setCurrentTab && setCurrentTab('santali-studio')}>
            <Plus size={16} /> New lesson
          </button>
          <button className="btn-secondary" onClick={handleManualSync} disabled={syncing}>
            <RefreshCw size={14} />
            {syncing ? 'Syncing…' : 'Sync'}
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px' }}>
          <CheckCircle2 size={16} color="var(--green-accent)" />
          <span style={{ fontSize: 13 }}>{syncMessage}</span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card-featured">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, opacity: 0.9 }}>{t.dashboard.metric1}</span>
            <div className="stat-icon-circle" style={{ background: '#fff', border: 'none' }}>
              <ArrowUpRight size={16} color="var(--green-primary)" />
            </div>
          </div>
          <div className="metric">{flnStats?.flnLessonsDelivered || 24}</div>
          <span className="pill" style={{ background: 'rgba(255,255,255,0.16)', color: '#fff' }}>This month</span>
        </div>

        <div className="stat-card-white">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 650 }}>{t.dashboard.metric2}</span>
            <div className="stat-icon-circle"><ArrowUpRight size={16} /></div>
          </div>
          <div className="metric">{flnStats?.totalSpokenPhrases || 10}</div>
          <span className="pill ok">Phrases used</span>
        </div>

        <div className="stat-card-white">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 650 }}>{t.dashboard.metric3}</span>
            <div className="stat-icon-circle"><ArrowUpRight size={16} /></div>
          </div>
          <div className="metric">{flnStats?.averageApertiumLatency ? `${flnStats.averageApertiumLatency}` : '12'}</div>
          <span className="pill info">Lakshyas</span>
        </div>

        <div className="stat-card-white">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 650 }}>{t.dashboard.metric4}</span>
            <div className="stat-icon-circle"><ArrowUpRight size={16} /></div>
          </div>
          <div className="metric">{pendingLogsCount || flnStats?.activeStudentsCount || 2}</div>
          <span className="pill warn">{pendingLogsCount ? 'Pending sync' : 'Up to date'}</span>
        </div>
      </div>

      <div className="dash-row a">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 750 }}>NIPUN progress</h2>
            <span className="pill ok">74%</span>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nipunChartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-medium)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border-medium)', fontSize: 12 }} />
                <Bar dataKey="mastered" fill="var(--green-primary)" radius={[10, 10, 10, 10]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="quiet" style={{ marginBottom: 10, fontWeight: 700, letterSpacing: '0.08em' }}>TODAY</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-primary)', marginBottom: 6 }}>
              Grade 2 oral reading circle
            </h3>
            <p className="quiet">09:30 – 10:15 · Mother tongue: {currentLang === 'hoc' ? 'Ho' : currentLang === 'unr' ? 'Mundari' : 'Santhali'}</p>
          </div>
          <button className="btn-primary" onClick={() => setCurrentTab && setCurrentTab('phrasebook')}>
            <Play size={14} fill="#fff" /> Open voice
          </button>
        </div>
      </div>

      {!showVocabHub && (
        <div style={{
          marginBottom: 16,
          padding: '10px 16px',
          background: 'var(--bg-subtle)',
          border: '1px dashed var(--border-medium)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 13
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-sub)' }}>
            <EyeOff size={15} />
            <span>Words in use widget is hidden from your display hub.</span>
          </div>
          <button
            className="btn-secondary"
            onClick={() => handleToggleHubVocab(true)}
            style={{ padding: '4px 12px', fontSize: 12, height: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            <Eye size={13} /> Restore to Hub
          </button>
        </div>
      )}

      <div className={`dash-row b ${!showVocabHub ? 'no-vocab' : ''}`}>
        {/* Words in Use — real vocab memory data */}
        {showVocabHub && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <h2 style={{ fontSize: 16, fontWeight: 750, margin: 0 }}>Words in use</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="pill info" style={{ fontWeight: 700, fontSize: 11 }}>
                    {vocabStats?.total ?? 0} {vocabStats?.total === 1 ? 'Word' : 'Words'} Saved
                  </span>
                  <button
                    onClick={() => handleToggleHubVocab(false)}
                    title="Remove Words in use from display hub"
                    aria-label="Remove from display hub"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: 6,
                      color: 'var(--text-muted)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.background = 'var(--bg-subtle)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
              <div className="quiet" style={{ fontSize: 12, marginBottom: 12 }}>Saved from lessons and classroom voice</div>

              {vocabEntries.length === 0 ? (
                <div style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  background: 'var(--bg-subtle)',
                  borderRadius: 14,
                  border: '1px dashed var(--border-medium)'
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 10px', display: 'block' }}>
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                    <line x1="12" y1="7" x2="12" y2="13"/>
                    <line x1="9" y1="10" x2="15" y2="10"/>
                  </svg>
                  <div style={{ fontSize: 13, fontWeight: 650, color: 'var(--text-sub)', marginBottom: 6 }}>
                    No words saved yet
                  </div>
                  <div className="quiet" style={{ fontSize: 12, lineHeight: 1.5 }}>
                    Open <strong>Lesson Studio</strong> or <strong>Classroom Voice</strong> and tap{' '}
                    <strong>Save</strong> next to any translated word or phrase.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {displayedWords.map((entry) => {
                    const pill = SOURCE_PILL[entry.source] || SOURCE_PILL.lesson;
                    const contextSnippet = formatWordContext(entry.context);
                    return (
                      <div
                        className="vocab-row"
                        key={entry.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          padding: '7px 8px',
                          borderRadius: 8,
                          borderBottom: '1px solid var(--border-light)'
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '170px'
                              }}
                              title={entry.text}
                            >
                              {entry.text}
                            </span>
                            {entry.roman && (
                              <span
                                className="quiet"
                                style={{
                                  fontSize: 11.5,
                                  fontWeight: 500,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: '110px'
                                }}
                                title={entry.roman}
                              >
                                · {entry.roman}
                              </span>
                            )}
                          </div>
                          <div
                            className="quiet"
                            style={{
                              fontSize: 11.5,
                              marginTop: 1,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            title={`${entry.hindi || ''}${entry.context ? ' · ' + entry.context : ''}`}
                          >
                            {formatTranslation(entry.hindi)}
                            {contextSnippet ? ` · ${contextSnippet}` : ''}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <span
                            className={pill.className}
                            style={{ fontSize: 9.5, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}
                          >
                            {pill.label}
                          </span>
                          <button
                            onClick={() => handleRemoveWord(entry.id)}
                            title="Remove word from saved list"
                            className="word-del-btn"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              padding: '3px 4px',
                              borderRadius: 4,
                              color: 'var(--text-muted)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {vocabEntries.length > 4 && (
              <button
                onClick={() => setExpandedVocab(!expandedVocab)}
                style={{
                  width: '100%',
                  marginTop: 10,
                  padding: '6px 10px',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-subtle)',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 650,
                  color: 'var(--text-sub)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  transition: 'background 0.15s ease'
                }}
              >
                {expandedVocab ? (
                  <>
                    <ChevronUp size={14} /> Show less
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} /> +{vocabEntries.length - 4} more saved words
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Revamped Middle Card — This Week */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={16} color="var(--green-primary)" />
                <h2 style={{ fontSize: 16, fontWeight: 750, margin: 0 }}>This week</h2>
              </div>
              <span className="pill ok" style={{ fontSize: 11, fontWeight: 700 }}>
                41% NIPUN
              </span>
            </div>

            {/* Circular Ring */}
            <div className="ring" style={{ margin: '10px auto 12px' }}>
              <div className="ring-inner">
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>41%</div>
                  <div className="quiet" style={{ fontSize: 11, fontWeight: 600 }}>NIPUN</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, fontSize: 11.5, color: 'var(--text-sub)', marginBottom: 14 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0F4C3A' }}></span>
                Completed
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }}></span>
                Practising
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#9CA3AF' }}></span>
                Next
              </span>
            </div>

            {/* Dynamic Metric Rows that expand & fit proportionally */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 12px', background: 'var(--bg-subtle)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span className="quiet">Active Classroom Lessons</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>14 sessions</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span className="quiet">Oral Mother Tongue Recitation</span>
                <span style={{ fontWeight: 700, color: 'var(--green-primary)' }}>88% mastered</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span className="quiet">Target Weekly Competencies</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>4 / 6 achieved</span>
              </div>
            </div>
          </div>

          {/* Bottom Streak / Highlight that stays anchored at the bottom */}
          <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="quiet" style={{ fontSize: 11, fontWeight: 600 }}>Active Days</span>
              <div style={{ display: 'flex', gap: 5 }}>
                {['M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <span
                    key={idx}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: idx < 4 ? 'var(--green-primary)' : 'var(--border-medium)',
                      color: idx < 4 ? '#fff' : 'var(--text-muted)'
                    }}
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Revamped Right Card — FLN Target */}
        <div className="dark-widget" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="quiet" style={{ color: '#A7F3D0', fontWeight: 650, fontSize: 12, letterSpacing: '0.04em' }}>
                FLN TARGET (GRADE 1–3)
              </span>
              <span style={{ fontSize: 10.5, fontWeight: 700, background: 'rgba(255,255,255,0.15)', color: '#D1FAE5', padding: '2px 8px', borderRadius: 12 }}>
                NIPUN BHARAT
              </span>
            </div>

            <div style={{ fontSize: 26, fontWeight: 800, margin: '4px 0 2px 0', letterSpacing: '-0.5px' }}>
              84% Achieved
            </div>
            <p style={{ fontSize: 12, color: '#D1FAE5', margin: '0 0 12px 0', lineHeight: '1.4' }}>
              12 of 15 NIPUN competencies mastered.
            </p>

            {/* Glowing Progress Bar */}
            <div style={{ width: '100%', height: 7, background: 'rgba(255,255,255,0.2)', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ width: '84%', height: '100%', background: 'linear-gradient(90deg, #34D399, #10B981)', borderRadius: 10 }}></div>
            </div>

            {/* Dynamic Competency Cards that gracefully expand */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11.5 }}>
                <span style={{ color: '#E6FFFA', fontWeight: 550 }}>Oral Mother Tongue</span>
                <span style={{ color: '#34D399', fontWeight: 700 }}>5/5 · 100%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11.5 }}>
                <span style={{ color: '#E6FFFA', fontWeight: 550 }}>Vocabulary Recall</span>
                <span style={{ color: '#6EE7B7', fontWeight: 700 }}>4/5 · 80%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11.5 }}>
                <span style={{ color: '#E6FFFA', fontWeight: 550 }}>Number Sense</span>
                <span style={{ color: '#A7F3D0', fontWeight: 700 }}>3/5 · 60%</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 10 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#FFFFFF' }}>
              <span>✓ Live Tablet Sync Active</span>
            </div>
            <span style={{ fontSize: 11, color: '#A7F3D0', opacity: 0.85 }}>{lastSync ? `Synced ${lastSync}` : 'Offline cache'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
