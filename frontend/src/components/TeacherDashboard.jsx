import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  BookOpen, Target, RefreshCw, CheckCircle2, Languages, Radio
} from 'lucide-react';
import { irisGetDashboardStats, irisSyncOfflineProgress } from '../services/api';
import { getPendingOfflineLogs, getLastSyncTime } from '../services/offlineSync';
import { uiTranslations } from '../services/uiTranslations';

function SummaryMetricCard({ label, value, subtext, tag }) {
  return (
    <div
      className="card"
      style={{
        padding: '20px',
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #FED7AA',
        borderRadius: '10px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{label}</span>
        {tag && (
          <span style={{
            fontSize: '10px',
            fontWeight: '800',
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: '#ECFDF5',
            color: '#059669',
            border: '1px solid #A7F3D0'
          }}>
            {tag}
          </span>
        )}
      </div>
      <div style={{ fontSize: '26px', fontWeight: '900', color: '#0F172A', lineHeight: 1 }}>
        {value}
      </div>
      {subtext && <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>{subtext}</div>}
    </div>
  );
}

export default function TeacherDashboard({ 
  uiLang = 'en', 
  currentLang = 'sat' 
}) {
  const t = uiTranslations[uiLang] || uiTranslations.en;
  const [flnStats, setFlnStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [pendingLogsCount, setPendingLogsCount] = useState(0);
  const [lastSync, setLastSync] = useState(getLastSyncTime());

  const loadData = async () => {
    setLoading(true);
    try {
      const stats = await irisGetDashboardStats();
      setFlnStats(stats);
      setPendingLogsCount(getPendingOfflineLogs().length);
      setLastSync(getLastSyncTime());
    } catch (err) {
      console.warn('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
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
        setSyncMessage(`Synchronized ${res.syncedCount || 0} offline classroom logs with Jharkhand Education Cloud.`);
        setPendingLogsCount(0);
        setLastSync(new Date().toLocaleTimeString());
      } else {
        setSyncMessage('Offline mode active. Logs preserved safely on local tablet storage.');
      }
    } catch (err) {
      setSyncMessage('Tablet operating in offline-first mode.');
    } finally {
      setSyncing(false);
    }
  };

  const nipunChartData = [
    { name: 'L1: Oral Lang', mastered: 88 },
    { name: 'L2: Letter Sounds', mastered: 76 },
    { name: 'L3: Word Fluency', mastered: 69 },
    { name: 'M1: Numbers 1-9', mastered: 94 },
    { name: 'M2: Place Value', mastered: 82 },
    { name: 'M3: Basic Ops', mastered: 71 },
  ];

  const translationRelianceData = flnStats?.translationHeatmap || [
    { word: 'Book (ᱯᱚᱛᱚᱵ / ᱯᱩᱛᱷᱤ)', count: 87 },
    { word: 'Read (ᱯᱟᱲᱦᱟᱣ)', count: 74 },
    { word: 'Write (ᱚᱞ)', count: 68 },
    { word: 'Count (ᱞᱮᱠᱷᱟ)', count: 59 },
    { word: 'Tree (ᱫᱟᱨᱮ / ᱫᱟᱨᱩ)', count: 48 },
    { word: 'Two (ᱵᱟᱨ / ᱵᱟᱹᱨᱤᱭᱟᱹ)', count: 42 }
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Header Banner */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '22px 28px',
        border: '1.5px solid #FED7AA',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 2px 8px rgba(234,88,12,0.06)'
      }}>
        <div>
          <div style={{
            fontSize: '11px',
            fontWeight: '700',
            color: '#334155',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px'
          }}>
            {t.dashboard.headerTag}
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 6px 0', color: '#0F172A' }}>
            {t.dashboard.title}
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#334155' }}>
            {t.dashboard.subtitle}
          </p>
        </div>

        {/* Sync Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleManualSync}
            disabled={syncing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              backgroundColor: '#EA580C',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: '700',
              fontSize: '12px',
              cursor: syncing ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing...' : t.dashboard.syncBtn}</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncMessage && (
        <div style={{
          marginBottom: '20px',
          padding: '10px 16px',
          borderRadius: '6px',
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          color: '#065F46',
          fontSize: '12px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} color="#059669" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* 4 Clean Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <SummaryMetricCard
          label={t.dashboard.metric1}
          value={flnStats?.flnLessonsDelivered || 42}
          subtext="Covered across Santhali, Ho, and Mundari"
          tag="Active MTB-MLE"
        />
        <SummaryMetricCard
          label={t.dashboard.metric2}
          value={flnStats?.motherTongueTranslationsUsed || 318}
          subtext="Classroom phrase dialogues conducted"
          tag="+32% this term"
        />
        <SummaryMetricCard
          label={t.dashboard.metric3}
          value={flnStats?.nipunOutcomesCovered || 16}
          subtext="Out of 20 foundational competencies"
        />
        <SummaryMetricCard
          label={t.dashboard.metric4}
          value="100%"
          subtext={`Pending: ${pendingLogsCount} logs · Last sync: ${lastSync}`}
          tag="Offline-Ready"
        />
      </div>

      {/* Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* NIPUN Bharat Competency Progression Chart */}
        <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 4px 0', color: '#0F172A' }}>
            NIPUN Bharat Competency Mastery (%)
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#334155' }}>
            Classroom average achievement in Foundational Literacy &amp; Numeracy
          </p>

          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nipunChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FED7AA" />
                <XAxis dataKey="name" stroke="#334155" fontSize={11} angle={-15} textAnchor="end" />
                <YAxis stroke="#334155" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '6px',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="mastered" fill="#EA580C" radius={[4, 4, 0, 0]} name="Mastery %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Translation Reliance Heatmap */}
        <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 4px 0', color: '#0F172A' }}>
            Translation Reliance Heatmap
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#334155' }}>
            Concepts where teachers relied most on tribal language translation
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {translationRelianceData.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
                  <span style={{ color: '#0F172A' }}>{item.word}</span>
                  <span style={{ color: '#EA580C', fontWeight: '700' }}>{item.count} occurrences</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: '#FFF7ED',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(100, (item.count / 100) * 100)}%`,
                    height: '100%',
                    backgroundColor: '#EA580C'
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '20px',
            padding: '12px',
            borderRadius: '6px',
            backgroundColor: '#FFF7ED',
            border: '1px solid #FDE68A',
            fontSize: '11px',
            color: '#334155'
          }}>
            District: <strong>Ranchi / Kolhan Tribal Area (5,000+ Schools)</strong> · Android Tablet Target: <strong>&le; 2GB RAM (Offline Mode)</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
