import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SubtitleBar } from './AvatarScene';

/**
 * ExplainerScene — LearnAI Studio Concept Explainer
 * Features:
 * - Left: Staggered white pedagogical cards with saffron keyword highlights
 * - Right: Animated Concept Radar with concentric rings & orbiting nodes
 * - Full multilingual font support ('Noto Sans Ol Chiki' for Santhali)
 */
export function ExplainerScene({
  heading = 'Concept Overview',
  bullets = [],
  highlights = [],
  audioDuration = 10,
  subtitleWords = [],
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalFrames = Math.max(Math.round(audioDuration * fps), 300);

  // Gentle camera zoom
  const dollyScale = interpolate(frame, [0, totalFrames], [1, 1.02], {
    extrapolateRight: 'clamp',
  });

  // Heading entrance spring
  const headingSpring = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 100, mass: 0.8 },
  });
  const headingOpacity = interpolate(headingSpring, [0, 1], [0, 1]);
  const headingY = interpolate(headingSpring, [0, 1], [-20, 0]);

  // Underline animation
  const underlineWidth = interpolate(frame, [8, 32], [0, 140], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });


  // Active concept tracking based on frame progression
  const activeBulletIdx = Math.min(
    bullets.length - 1,
    Math.max(0, Math.floor((frame / Math.max(1, totalFrames * 0.85)) * bullets.length))
  );

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#F4F7F5',
        backgroundImage: `
          radial-gradient(ellipse at 15% 20%, rgba(19, 78, 63, 0.08) 0%, transparent 55%),
          radial-gradient(ellipse at 85% 75%, rgba(234, 88, 12, 0.06) 0%, transparent 55%)
        `,
        color: '#111827',
        padding: '38px 60px 85px 60px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Noto Sans Ol Chiki", "Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        transform: `scale(${dollyScale})`,
      }}
    >
      {/* Background pedagogical grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(19, 78, 63, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(19, 78, 63, 0.035) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header Section */}
      <div
        style={{
          opacity: headingOpacity,
          transform: `translateY(${headingY}px)`,
          marginBottom: '20px',
          zIndex: 10,
        }}
      >
        {/* Category Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 16px',
            background: '#EBF4F0',
            border: '1.5px solid #D1E3DA',
            borderRadius: 999,
            marginBottom: 10,
            marginLeft: 175,
          }}
        >
          <span style={{ fontSize: 13, color: '#EA580C' }}>✦</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1.5,
              color: '#134E3F',
              textTransform: 'uppercase',
            }}
          >
            CONCEPT EXPLAINER
          </span>
        </div>

        {/* Main Heading */}
        <h1
          style={{
            fontSize: '40px',
            fontWeight: 800,
            margin: '0 0 8px 0',
            letterSpacing: '-0.01em',
            color: '#134E3F',
            lineHeight: 1.25,
          }}
        >
          {heading}
        </h1>

        {/* Animated Saffron Underline */}
        <div
          style={{
            height: 4,
            width: underlineWidth,
            borderRadius: 4,
            background: 'linear-gradient(90deg, #EA580C 0%, #F97316 100%)',
            boxShadow: '0 2px 8px rgba(234, 88, 12, 0.35)',
          }}
        />
      </div>

      {/* Main Body: Left Bullets (72%) + Right Teacher & Topic Meta Dock (28%) */}
      <div style={{ display: 'flex', gap: 36, flex: 1, zIndex: 10, alignItems: 'flex-start' }}>
        {/* Left Bullet Points */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            width: '71%',
            maxWidth: 820,
          }}
        >
          {bullets.map((bullet, i) => {
            const delay = 10 + i * 14;
            const slideProgress = spring({
              frame: frame - delay,
              fps,
              config: { damping: 14, stiffness: 100, mass: 0.7 },
            });
            const slideX = interpolate(slideProgress, [0, 1], [-30, 0]);
            const slideOpacity = interpolate(slideProgress, [0, 1], [0, 1]);

            // Highlight terms replacement
            let processedHtml = bullet;
            if (Array.isArray(highlights) && highlights.length > 0) {
              highlights.forEach((hl) => {
                if (!hl || typeof hl !== 'string') return;
                try {
                  const escaped = hl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  const regex = new RegExp(`(${escaped})`, 'gi');
                  processedHtml = processedHtml.replace(
                    regex,
                    '<span style="color:#C2410C; background:#FFF7ED; padding:2px 8px; border-radius:6px; font-weight:800; border:1px solid #FDBA74;">$1</span>'
                  );
                } catch (_) {}
              });
            }

            const isCurrent = i === activeBulletIdx;
            const borderAccent = isCurrent ? '#EA580C' : '#134E3F';

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  opacity: slideOpacity,
                  transform: `translateX(${slideX}px) scale(${isCurrent ? 1.015 : 1})`,
                  background: isCurrent ? '#FFFFFF' : 'rgba(255, 255, 255, 0.94)',
                  padding: '14px 22px',
                  borderRadius: '16px',
                  border: `1.5px solid ${isCurrent ? '#EA580C' : '#D1E3DA'}`,
                  borderLeft: `5px solid ${borderAccent}`,
                  boxShadow: isCurrent
                    ? '0 10px 28px rgba(19, 78, 63, 0.12), 0 2px 6px rgba(0,0,0,0.04)'
                    : '0 4px 14px rgba(19, 78, 63, 0.05)',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Numeric Pill */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: isCurrent ? '#EA580C' : '#134E3F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#FFFFFF',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(19, 78, 63, 0.15)',
                  }}
                >
                  0{i + 1}
                </div>

                {/* Bullet text */}
                <div
                  style={{
                    fontSize: '20px',
                    lineHeight: 1.45,
                    color: '#1F2937',
                    fontWeight: isCurrent ? 600 : 500,
                  }}
                  dangerouslySetInnerHTML={{ __html: processedHtml }}
                />
              </div>
            );
          })}
        </div>

        {/* Right Side: Calm Lesson Meta Card (Above PipTeacherCam dock) */}
        <div
          style={{
            width: '27%',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            paddingTop: 4,
          }}
        >
          {/* Active Concept Card */}
          <div
            style={{
              background: '#FFFFFF',
              border: '2px solid #D1E3DA',
              borderRadius: 20,
              padding: '18px 20px',
              boxShadow: '0 8px 24px rgba(19, 78, 63, 0.07)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#134E3F', letterSpacing: 1.2 }}>
                LESSON PROGRESS
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#EA580C',
                  background: '#FFF7ED',
                  border: '1px solid #FDBA74',
                  borderRadius: 99,
                  padding: '2px 8px',
                }}
              >
                {activeBulletIdx + 1} / {bullets.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: 6, borderRadius: 99, background: '#E2ECE8', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${((activeBulletIdx + 1) / Math.max(1, bullets.length)) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #134E3F 0%, #10B981 100%)',
                  borderRadius: 99,
                  transition: 'width 0.25s ease',
                }}
              />
            </div>

            <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.4 }}>
              Active topic focus with live AI tutor explanation.
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized Subtitle Bar */}
      <SubtitleBar subtitleWords={subtitleWords} totalFrames={totalFrames} />
    </div>
  );
}

export default ExplainerScene;