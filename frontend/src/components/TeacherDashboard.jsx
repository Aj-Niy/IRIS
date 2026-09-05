import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  BookOpen, Target, RefreshCw, CheckCircle2, Languages, Radio
} from 'lucide-react';
import { irisGetDashboardStats, irisSyncOfflineProgress } from '../services/api';
import { getPendingOfflineLogs, getLastSyncTime } from '../services/offlineSync';

function SummaryMetricCard({ label, value, subtext, tag }) {
  return (
    <div
      className="card"
      style={{
        padding: '20px',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-medium)',
        borderRadius: '10px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{label}</span>
        {tag && (
          <span style={{
            fontSize: '10px',
            fontWeight: '700',
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: '#F0FDF4',
            color: '#166534',
            border: '1px solid #BBF7D0'
          }}>
            {tag}
          </span>
        )}
      </div>
      <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>
        {value}
      </div>
      {subtext && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{subtext}</div>}
    </div>
  );
}

export default function TeacherDashboard() {
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
        border: '1px solid var(--border-medium)',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{
            fontSize: '11px',
            fontWeight: '700',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px'
          }}>
            Jharkhand PALASH MTB-MLE Programme · School Implementation Monitoring
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-main)' }}>
            Teacher Instruction & FLN Progress Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
            Monitors tribal language lesson delivery, mother-tongue translation reliance heatmaps, NIPUN Bharat competency progress, and tablet synchronization across 5,000+ tribal primary schools.
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
              backgroundColor: 'var(--accent)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: '700',
              fontSize: '12px',
              cursor: syncing ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync Tablet Logs'}</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncMessage && (
        <div style={{
          marginBottom: '20px',
          padding: '10px 16px',
          borderRadius: '6px',
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          color: '#166534',
          fontSize: '12px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} color="#16A34A" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* 4 Clean Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <SummaryMetricCard
          label="FLN Lessons Delivered"
          value={flnStats?.flnLessonsDelivered || 42}
          subtext="Covered across Santhali, Ho, and Mundari"
          tag="Active MTB-MLE"
        />
        <SummaryMetricCard
          label="Mother-Tongue Translations Used"
          value={flnStats?.motherTongueTranslationsUsed || 318}
          subtext="Classroom phrase dialogues conducted"
          tag="+32% this term"
        />
        <SummaryMetricCard
          label="NIPUN Outcomes Covered"
          value={flnStats?.nipunOutcomesCovered || 16}
          subtext="Out of 20 foundational competencies"
        />
        <SummaryMetricCard
          label="Tablet Offline Sync Status"
          value="100%"
          subtext={`Pending: ${pendingLogsCount} logs · Last sync: ${lastSync}`}
          tag="Offline-Ready"
        />
      </div>

      {/* Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* NIPUN Bharat Competency Progression Chart */}
        <div className="card" style={{ padding: '24px', backgroundColor: 'var(--bg-card)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 4px 0', color: 'var(--text-main)' }}>
            NIPUN Bharat Competency Mastery (%)
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Classroom average achievement in Foundational Literacy & Numeracy
          </p>

          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nipunChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} angle={-15} textAnchor="end" />
                <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '6px',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="mastered" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Mastery %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Translation Reliance Heatmap */}
        <div className="card" style={{ padding: '24px', backgroundColor: 'var(--bg-card)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 4px 0', color: 'var(--text-main)' }}>
            Translation Reliance Heatmap
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Concepts where teachers relied most on tribal language translation
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {translationRelianceData.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
                  <span style={{ color: 'var(--text-main)' }}>{item.word}</span>
                  <span style={{ color: 'var(--accent)', fontWeight: '700' }}>{item.count} occurrences</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: 'var(--bg-subtle)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(100, (item.count / 100) * 100)}%`,
                    height: '100%',
                    backgroundColor: 'var(--accent)'
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '20px',
            padding: '12px',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-light)',
            fontSize: '11px',
            color: 'var(--text-muted)'
          }}>
            District: <strong>Ranchi / Kolhan Tribal Area (5,000+ Schools)</strong> · Android Tablet Target: <strong>&le; 2GB RAM (Offline Mode)</strong>
          </div>
        </div>
      </div>
    </div>
  );
}