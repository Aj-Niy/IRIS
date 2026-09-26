import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SubtitleBar } from './AvatarScene';

/**
 * FlowchartScene — ShikshaSetu Traveling Energy Flow & Step Pipeline
 * Features:
 * - Animated traveling emerald energy sparks between nodes
 * - Clean white pedagogical cards with Forest Green & Saffron states
 * - Algorithm step status in Ol Chiki and bilingual text
 * - Algorithm Execution Progress Timeline meter
 * - Full indigenous script font support ('Noto Sans Ol Chiki' for Santhali)
 */
export function FlowchartScene({
  steps = [],
  colors = [],
  audioDuration = 10,
  subtitleWords = [],
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalFrames = Math.max(Math.round(audioDuration * fps), 300);
  const defaultColors = ['#134E3F', '#EA580C', '#10B981', '#0284C7', '#D97706', '#059669'];

  // Identify active step index
  const activeStepIdx = Math.min(
    steps.length - 1,
    Math.max(0, Math.floor((frame / Math.max(1, totalFrames * 0.85)) * steps.length))
  );

  // Flow progression percentage
  const pipelineProgress = Math.min(100, Math.round(((activeStepIdx + 1) / Math.max(1, steps.length)) * 100));

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#F4F7F5',
        backgroundImage: `
          radial-gradient(ellipse at 50% 15%, rgba(19, 78, 63, 0.08) 0%, transparent 60%),
          radial-gradient(ellipse at 50% 85%, rgba(234, 88, 12, 0.06) 0%, transparent 60%)
        `,
        color: '#111827',
        padding: '35px 55px 85px 55px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '"Noto Sans Ol Chiki", "Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Pedagogical micro-grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(19,78,63,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(19,78,63,0.035) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header */}
      <div style={{ marginBottom: 26, textAlign: 'center', zIndex: 10 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 20px',
            background: '#EBF4F0',
            border: '1.5px solid #D1E3DA',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 1.5,
            color: '#134E3F',
            textTransform: 'uppercase',
            boxShadow: '0 2px 8px rgba(19, 78, 63, 0.06)',
          }}
        >
          🔄 STEP-BY-STEP PROCESS WORKFLOW
        </span>
      </div>

      {/* Steps Flow Chain */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: steps.length > 4 ? 'wrap' : 'nowrap',
          gap: '12px',
          maxWidth: 920,
          marginRight: 80,
          zIndex: 10,
        }}
      >
        {steps.map((step, i) => {
          const delay = i * 14;
          const pop = spring({
            frame: frame - delay,
            fps,
            config: { damping: 13, stiffness: 110, mass: 0.7 },
          });
          const opacity = interpolate(pop, [0, 1], [0, 1]);
          const scale = interpolate(pop, [0, 1], [0.6, 1]);

          const color = colors[i] || defaultColors[i % defaultColors.length];
          const isActive = i === activeStepIdx;
          const isPassed = i < activeStepIdx;

          // Animated particle traveling along connector
          const particleProgress = (frame * 1.5 + i * 20) % 50;

          return (
            <React.Fragment key={i}>
              {/* Step Card Node */}
              <div
                style={{
                  opacity,
                  transform: `scale(${scale * (isActive ? 1.06 : 1)})`,
                  background: isActive
                    ? '#FFFFFF'
                    : isPassed
                    ? '#F0FDF4'
                    : 'rgba(255, 255, 255, 0.92)',
                  border: `2px solid ${isActive ? '#EA580C' : isPassed ? '#134E3F' : '#D1E3DA'}`,
                  borderRadius: 20,
                  padding: '20px 22px',
                  minWidth: 165,
                  maxWidth: 220,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: isActive
                    ? '0 12px 35px rgba(234, 88, 12, 0.22)'
                    : '0 8px 24px rgba(19, 78, 63, 0.06)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {/* Step Status Chip */}
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: 1.2,
                    padding: '3px 10px',
                    borderRadius: 99,
                    background: isPassed
                      ? '#DCFCE7'
                      : isActive
                      ? '#FFF7ED'
                      : '#F1F5F9',
                    color: isPassed ? '#15803D' : isActive ? '#EA580C' : '#64748B',
                    border: `1px solid ${isPassed ? '#86EFAC' : isActive ? '#FDBA74' : '#E2E8F0'}`,
                  }}
                >
                  {isPassed ? '✓ ᱯᱩᱨᱟᱹᱣ (DONE)' : isActive ? '▶ ᱠᱟᱹᱢᱤ (ACTIVE)' : '⏳ ᱛᱟᱺᱜᱤ (WAIT)'}
                </div>

                {/* Step Number Badge */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: isActive ? '#EA580C' : isPassed ? '#134E3F' : '#E2ECE8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 900,
                    color: isActive || isPassed ? '#ffffff' : '#64748B',
                    boxShadow: isActive ? '0 4px 12px rgba(234, 88, 12, 0.35)' : 'none',
                  }}
                >
                  {i + 1}
                </div>

                {/* Step Description */}
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    lineHeight: 1.4,
                    color: isActive ? '#134E3F' : '#1F2937',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                  }}
                >
                  {step}
                </div>
              </div>

              {/* Animated Connector Arrow between steps */}
              {i < steps.length - 1 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    width: 44,
                    height: 16,
                  }}
                >
                  {/* Base Track Line */}
                  <div
                    style={{
                      width: '100%',
                      height: 3,
                      background: isPassed ? '#134E3F' : '#CBD5E1',
                      borderRadius: 2,
                    }}
                  />

                  {/* Traveling Emerald Energy Pulse Spark */}
                  {isPassed && (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${particleProgress}%`,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#10B981',
                        boxShadow: '0 0 10px #10B981',
                      }}
                    />
                  )}

                  {/* Right Arrow Pointer */}
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      width: 0,
                      height: 0,
                      borderTop: '5px solid transparent',
                      borderBottom: '5px solid transparent',
                      borderLeft: `7px solid ${isPassed ? '#134E3F' : '#CBD5E1'}`,
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Bottom Pipeline Progress HUD Meter */}
      <div
        style={{
          marginTop: 34,
          width: '60%',
          maxWidth: 680,
          background: '#FFFFFF',
          border: '1px solid #D1E3DA',
          borderRadius: 16,
          padding: '12px 20px',
          boxShadow: '0 8px 24px rgba(19, 78, 63, 0.06)',
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 11,
            fontWeight: 800,
            color: '#134E3F',
            letterSpacing: 1.2,
            marginBottom: 6,
          }}
        >
          <span>ALGORITHM EXECUTION TIMELINE</span>
          <span>{pipelineProgress}% COMPLETE</span>
        </div>
        <div
          style={{
            width: '100%',
            height: 7,
            borderRadius: 99,
            background: '#E2ECE8',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${pipelineProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #134E3F 0%, #10B981 100%)',
              borderRadius: 99,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Synchronized Subtitle Bar */}
      <SubtitleBar subtitleWords={subtitleWords} totalFrames={totalFrames} />
    </div>
  );
}

export default FlowchartScene;