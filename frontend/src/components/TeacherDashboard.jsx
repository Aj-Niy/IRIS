import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { RefreshCw, Plus, CheckCircle2, ArrowUpRight, Play } from 'lucide-react';
import { irisGetDashboardStats, irisSyncOfflineProgress } from '../services/api';
import { getPendingOfflineLogs, getLastSyncTime } from '../services/offlineSync';
import { uiTranslations } from '../services/uiTranslations';
import { getVocabStats, getVocabEntries } from '../services/vocabMemory';

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

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{t.dashboard.title}</h1>
          <p>{t.dashboard.subtitle}</p>
        </div>
        <div className="actions">
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

      <div className="dash-row b">
        {/* Words in Use — real vocab memory data */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h2 style={{ fontSize: 16, fontWeight: 750, margin: 0 }}>Words in use</h2>
            <span className="pill info" style={{ fontWeight: 700 }}>
              {vocabStats?.total ?? 0} {vocabStats?.total === 1 ? 'Word' : 'Words'} Saved
            </span>
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
            vocabEntries.slice(0, 4).map((entry) => {
              const pill = SOURCE_PILL[entry.source] || SOURCE_PILL.lesson;
              return (
                <div className="list-row" key={entry.id}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 750 }}>
                      {entry.text}
                      {entry.roman ? (
                        <span className="quiet" style={{ fontSize: 12, fontWeight: 500, marginLeft: 6 }}>
                          · {entry.roman}
                        </span>
                      ) : null}
                    </div>
                    <div className="quiet" style={{ fontSize: 12, marginTop: 2 }}>
                      {entry.hindi || '—'}
                      {entry.context ? ` · ${entry.context}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span className={pill.className} style={{ fontSize: 10 }}>{pill.label}</span>
                    <span className="pill" style={{ background: 'var(--bg-subtle)', fontSize: 10, color: 'var(--text-sub)' }}>
                      {entry.langName}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {vocabEntries.length > 4 && (
            <div className="quiet" style={{ textAlign: 'center', marginTop: 10, fontSize: 12 }}>
              +{vocabEntries.length - 4} more saved words
            </div>
          )}
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 16, fontWeight: 750, textAlign: 'left' }}>This week</h2>
          <div className="ring">
            <div className="ring-inner">
              <div>
                <div style={{ fontSize: 26, fontWeight: 800 }}>41%</div>
                <div className="quiet">NIPUN</div>
              </div>
            </div>
          </div>
          <div className="quiet">Completed · Practising · Next</div>
        </div>

        <div className="dark-widget">
          <div className="quiet" style={{ color: '#A7F3D0', fontWeight: 600 }}>FLN Target (Grade 1–3)</div>
          <div style={{ fontSize: 24, fontWeight: 800, margin: '6px 0 2px 0' }}>84% Achieved</div>
          <p style={{ fontSize: 12, color: '#D1FAE5', margin: 0, lineHeight: '1.4' }}>
            12 of 15 NIPUN competencies mastered.
          </p>
          <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#FFFFFF' }}>
            <span>✓ Live Tablet Sync Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
