import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SubtitleBar } from './AvatarScene';

/**
 * ComparisonScene — ShikshaSetu Comparative Concept Analysis
 * Features:
 * - Left: Forest Green themed pedagogical card
 * - Right: Saffron Orange themed pedagogical card
 * - Center: Saffron VS emblem with pulse ring
 * - Dynamic Feature Advantage Gauges
 * - Full indigenous script font support ('Noto Sans Ol Chiki' for Santhali)
 */
export function ComparisonScene({
  leftTitle = 'Option A',
  leftPoints = [],
  rightTitle = 'Option B',
  rightPoints = [],
  audioDuration = 10,
  subtitleWords = [],
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalFrames = Math.max(Math.round(audioDuration * fps), 300);

  // Card slide springs
  const slideLeft = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.8 },
  });
  const slideRight = spring({
    frame: frame - 6,
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.8 },
  });

  // VS Badge pop spring
  const popVs = spring({
    frame: frame - 14,
    fps,
    config: { damping: 10, stiffness: 130, mass: 0.6 },
  });

  // Metric fill animation
  const metricFill = interpolate(frame, [30, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#F4F7F5',
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(19, 78, 63, 0.08) 0%, transparent 60%),
          radial-gradient(circle at 80% 70%, rgba(234, 88, 12, 0.06) 0%, transparent 60%)
        `,
        color: '#111827',
        padding: '35px 55px 85px 55px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Noto Sans Ol Chiki", "Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Pedagogical micro-grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(19,78,63,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(19,78,63,0.035) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header Badge */}
      <div style={{ textAlign: 'left', marginBottom: 16, zIndex: 10, paddingLeft: 180 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 18px',
            background: '#EBF4F0',
            border: '1.5px solid #D1E3DA',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 1.5,
            color: '#134E3F',
            textTransform: 'uppercase',
          }}
        >
          ⚖️ COMPARATIVE CONCEPT ANALYSIS
        </span>
      </div>

      {/* Main Dual Cards Container (74% width leaves right 26% clear for PipTeacherCam) */}
      <div
        style={{
          display: 'flex',
          width: '74%',
          maxWidth: 930,
          position: 'relative',
          gap: 28,
          zIndex: 10,
          alignItems: 'stretch',
          flex: 1,
        }}
      >
        {/* Left Card: Option A (Forest Green Theme) */}
        <div
          style={{
            flex: 1,
            background: '#FFFFFF',
            borderRadius: 22,
            padding: '24px 28px',
            border: '2px solid #D1E3DA',
            borderTop: '6px solid #134E3F',
            boxShadow: '0 14px 40px rgba(19, 78, 63, 0.08)',
            opacity: interpolate(slideLeft, [0, 1], [0, 1]),
            transform: `translateX(${interpolate(slideLeft, [0, 1], [-60, 0])}px)`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              borderBottom: '1.5px solid #E2ECE8',
              paddingBottom: 14,
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 22, color: '#134E3F' }}>🟢</span>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: '#134E3F',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {leftTitle}
            </h2>
          </div>

          {/* Points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {leftPoints.map((pt, i) => {
              const ptProgress = spring({
                frame: frame - (18 + i * 10),
                fps,
                config: { damping: 14, stiffness: 100 },
              });
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: 18,
                    lineHeight: 1.45,
                    color: '#1F2937',
                    opacity: interpolate(ptProgress, [0, 1], [0, 1]),
                    transform: `translateY(${interpolate(ptProgress, [0, 1], [15, 0])}px)`,
                    background: '#F0FDF4',
                    padding: '10px 14px',
                    borderRadius: 10,
                    borderLeft: '4px solid #134E3F',
                  }}
                >
                  <span style={{ color: '#134E3F', fontWeight: 800 }}>✓</span>
                  <span>{pt}</span>
                </div>
              );
            })}
          </div>

          {/* Performance Meter */}
          <div style={{ marginTop: 'auto', background: '#F8FAF9', padding: '12px 16px', borderRadius: 12, border: '1px solid #E2ECE8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, color: '#134E3F', marginBottom: 5 }}>
              <span>CLASSROOM SUITABILITY</span>
              <span>88%</span>
            </div>
            <div style={{ width: '100%', height: 7, borderRadius: 99, background: '#E2ECE8', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${88 * metricFill}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #134E3F 0%, #10B981 100%)',
                  borderRadius: 99,
                }}
              />
            </div>
          </div>
        </div>

        {/* Center: Clean Saffron VS Emblem */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '42%',
            transform: `translate(-50%, -50%) scale(${interpolate(popVs, [0, 1], [0, 1])})`,
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 22,
              letterSpacing: 1,
              boxShadow: '0 8px 24px rgba(234, 88, 12, 0.45)',
              border: '3px solid #FFFFFF',
            }}
          >
            VS
          </div>
        </div>

        {/* Right Card: Option B (Saffron Orange Theme) */}
        <div
          style={{
            flex: 1,
            background: '#FFFFFF',
            borderRadius: 22,
            padding: '24px 28px',
            border: '2px solid #D1E3DA',
            borderTop: '6px solid #EA580C',
            boxShadow: '0 14px 40px rgba(234, 88, 12, 0.08)',
            opacity: interpolate(slideRight, [0, 1], [0, 1]),
            transform: `translateX(${interpolate(slideRight, [0, 1], [60, 0])}px)`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              borderBottom: '1.5px solid #E2ECE8',
              paddingBottom: 14,
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 22, color: '#EA580C' }}>🟠</span>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: '#EA580C',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {rightTitle}
            </h2>
          </div>

          {/* Points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {rightPoints.map((pt, i) => {
              const ptProgress = spring({
                frame: frame - (24 + i * 10),
                fps,
                config: { damping: 14, stiffness: 100 },
              });
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: 18,
                    lineHeight: 1.45,
                    color: '#1F2937',
                    opacity: interpolate(ptProgress, [0, 1], [0, 1]),
                    transform: `translateY(${interpolate(ptProgress, [0, 1], [15, 0])}px)`,
                    background: '#FFF7ED',
                    padding: '10px 14px',
                    borderRadius: 10,
                    borderLeft: '4px solid #EA580C',
                  }}
                >
                  <span style={{ color: '#EA580C', fontWeight: 800 }}>✦</span>
                  <span>{pt}</span>
                </div>
              );
            })}
          </div>

          {/* Performance Meter */}
          <div style={{ marginTop: 'auto', background: '#F8FAF9', padding: '12px 16px', borderRadius: 12, border: '1px solid #E2ECE8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, color: '#EA580C', marginBottom: 5 }}>
              <span>ALTERNATIVE SCORE</span>
              <span>75%</span>
            </div>
            <div style={{ width: '100%', height: 7, borderRadius: 99, background: '#E2ECE8', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${75 * metricFill}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #EA580C 0%, #F97316 100%)',
                  borderRadius: 99,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized Subtitle Bar */}
      <SubtitleBar subtitleWords={subtitleWords} totalFrames={totalFrames} />
    </div>
  );
}

export default ComparisonScene;