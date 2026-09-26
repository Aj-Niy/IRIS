import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

/**
 * IndexScene — Animated Table of Contents for LearnAI Studio
 * Displays all video topics with staggered entry animations
 * Gives viewers a clear roadmap of what they're about to learn
 */
export function IndexScene({ topics = [], title = 'Topics Covered' }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background ambient pulse
  const pulse = Math.sin(frame * 0.04) * 0.015;

  // Header entrance
  const headerSpring = spring({ frame, fps, config: { damping: 12, stiffness: 90, mass: 0.9 } });
  const headerY  = interpolate(headerSpring, [0, 1], [-30, 0]);
  const headerOp = interpolate(headerSpring, [0, 1], [0, 1]);

  // Scene type → icon + colour mapping
  const typeConfig = {
    intro:      { icon: '🚀', color: '#134E3F', bg: '#EBF4F0' },
    explainer:  { icon: '📘', color: '#0284C7', bg: '#EFF6FF' },
    comparison: { icon: '⚖️', color: '#7C3AED', bg: '#F5F3FF' },
    flowchart:  { icon: '🔄', color: '#EA580C', bg: '#FFF7ED' },
    code:       { icon: '💻', color: '#0F766E', bg: '#F0FDFA' },
    visual:     { icon: '✨', color: '#CA8A04', bg: '#FEFCE8' },
    quiz:       { icon: '🧠', color: '#DB2777', bg: '#FDF2F8' },
    default:    { icon: '📌', color: '#134E3F', bg: '#EBF4F0' },
  };

  // Visible topics: max 12 for a clean layout
  const displayTopics = topics.slice(0, 12);
  const cols = displayTopics.length > 6 ? 2 : 1;

  const leftCol  = displayTopics.filter((_, i) => cols === 1 || i % 2 === 0);
  const rightCol = displayTopics.filter((_, i) => cols === 2 && i % 2 !== 0);

  const renderTopic = (topic, globalIdx) => {
    const { label, type, duration } = topic;
    const { icon, color, bg } = typeConfig[type] || typeConfig.default;

    const delay = 12 + globalIdx * 8;
    const itemSpring = spring({
      frame: Math.max(0, frame - delay),
      fps,
      config: { damping: 14, stiffness: 110, mass: 0.7 },
    });
    const itemX  = interpolate(itemSpring, [0, 1], [-40, 0]);
    const itemOp = interpolate(itemSpring, [0, 1], [0, 1]);

    // Highlight currently-active item (cycles through topics over time)
    const cycleEvery = 40;
    const activeIdx  = Math.floor(frame / cycleEvery) % displayTopics.length;
    const isActive   = globalIdx === activeIdx;

    return (
      <div
        key={globalIdx}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          opacity: itemOp,
          transform: `translateX(${itemX}px)`,
          background: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.85)',
          border: `1.5px solid ${isActive ? color : '#D1E3DA'}`,
          borderLeft: `5px solid ${color}`,
          borderRadius: 14,
          padding: '11px 18px',
          boxShadow: isActive
            ? `0 8px 24px rgba(19,78,63,0.12), 0 2px 8px rgba(0,0,0,0.04)`
            : '0 2px 8px rgba(19,78,63,0.05)',
          transform: `translateX(${itemX}px) scale(${isActive ? 1.02 : 1})`,
          transition: 'all 0.12s ease',
        }}
      >
        {/* Number badge */}
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: isActive ? color : bg,
          border: `1.5px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 800,
          color: isActive ? '#FFFFFF' : color,
          flexShrink: 0,
        }}>
          {String(globalIdx + 1).padStart(2, '0')}
        </div>

        {/* Icon */}
        <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>

        {/* Label */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: cols === 2 ? 15 : 18,
            fontWeight: isActive ? 700 : 600,
            color: isActive ? color : '#1F2937',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {label}
          </div>
          {duration && (
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
              {icon} {type || 'lesson'}
            </div>
          )}
        </div>

        {/* Active indicator */}
        {isActive && (
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 8px ${color}`,
            flexShrink: 0,
          }} />
        )}
      </div>
    );
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#F4F7F5',
      backgroundImage: `
        radial-gradient(ellipse at 10% 15%, rgba(19, 78, 63, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 90% 85%, rgba(234, 88, 12, 0.05) 0%, transparent 50%),
        linear-gradient(rgba(19, 78, 63, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(19, 78, 63, 0.03) 1px, transparent 1px)
      `,
      backgroundSize: 'auto, auto, 44px 44px, 44px 44px',
      fontFamily: '"Noto Sans Ol Chiki", "Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      padding: '36px 52px 80px 52px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* Top Header */}
      <div style={{
        opacity: headerOp,
        transform: `translateY(${headerY}px)`,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          {/* Category Pill (offset to the right of global watermark) */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 16px',
            background: '#EBF4F0',
            border: '1.5px solid #D1E3DA',
            borderRadius: 999,
            marginBottom: 10,
            marginLeft: 175,
          }}>
            <span style={{ fontSize: 13, color: '#EA580C' }}>✦</span>
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              color: '#134E3F',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
            }}>VIDEO AGENDA &amp; TOPICS</span>
          </div>

          <h1 style={{
            margin: 0,
            fontSize: 40,
            fontWeight: 800,
            color: '#134E3F',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}>
            📋 {title}
          </h1>

          {/* Animated saffron underline */}
          <div style={{
            height: 4,
            width: interpolate(frame, [8, 35], [0, 120], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            background: 'linear-gradient(90deg, #EA580C 0%, #F97316 100%)',
            borderRadius: 4,
            marginTop: 10,
            boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)',
          }} />
        </div>

        {/* Topic count badge */}
        <div style={{
          background: '#FFFFFF',
          border: '2px solid #D1E3DA',
          borderRadius: 20,
          padding: '12px 24px',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(19,78,63,0.08)',
          opacity: headerOp,
        }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#134E3F', lineHeight: 1 }}>
            {displayTopics.length}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>
            Topics
          </div>
        </div>
      </div>

      {/* Topic Grid */}
      <div style={{
        display: 'flex',
        gap: 16,
        flex: 1,
        alignItems: 'flex-start',
      }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {leftCol.map((topic, i) => {
            const globalIdx = cols === 2 ? i * 2 : i;
            return renderTopic(topic, globalIdx);
          })}
        </div>

        {/* Right column (if 2-col layout) */}
        {cols === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {rightCol.map((topic, i) => renderTopic(topic, i * 2 + 1))}
          </div>
        )}
      </div>

      {/* Bottom "Let's Begin" bar */}
      <div style={{
        position: 'absolute',
        bottom: 24,
        left: 52,
        right: 52,
        background: 'linear-gradient(135deg, #134E3F 0%, #0E3F33 100%)',
        borderRadius: 14,
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 24px rgba(19,78,63,0.2)',
        opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 8px #10B981',
            animation: 'pulse 1.5s infinite',
          }} />
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '0.05em',
          }}>
            AI AVATAR LESSON STARTING NOW
          </span>
        </div>
        <span style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.7)',
        }}>
          🎤 Indian English Voice · Animated Explanations
        </span>
      </div>
    </div>
  );
}

export default IndexScene;
