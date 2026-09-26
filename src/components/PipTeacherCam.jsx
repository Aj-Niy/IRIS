import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate, Video, staticFile } from 'remotion';
import { ShikshaSetuAvatar } from './ShikshaSetuAvatar';

/**
 * PipTeacherCam — ShikshaSetu Picture-in-Picture Teacher Camera
 * Renders on all content scenes giving continuous teacher presence
 * styled with the clean, bright ShikshaSetu studio dock.
 */
export function PipTeacherCam({
  audioDuration = 10,
  subtitleWords = [],
  avatarVideoPath = null,
  position = 'bottom-right'
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animation
  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 110,
      mass: 0.8,
    },
  });

  const scale = interpolate(entrance, [0, 1], [0.5, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  // Audio speech timing
  const audioFrames = Math.round(audioDuration * fps);
  const isSpeaking = frame > 6 && frame < audioFrames;
  const isSpeakingWord = subtitleWords.length > 0
    ? subtitleWords.some((w) => frame >= w.startFrame && frame < w.endFrame)
    : isSpeaking;

  // Gentle breathing float
  const floatY = Math.sin(frame * 0.06) * 2.5;

  // Positioning styles
  const posStyle = position === 'top-right'
    ? { top: 28, right: 32 }
    : { bottom: 36, right: 36 };

  return (
    <div
      style={{
        position: 'absolute',
        ...posStyle,
        zIndex: 60,
        opacity,
        transform: `scale(${scale}) translateY(${floatY}px)`,
        transformOrigin: 'bottom right',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Outer ShikshaSetu Dock Card */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
          border: '2px solid #D1E3DA',
          borderRadius: 22,
          padding: '10px 14px 12px 14px',
          boxShadow:
            '0 14px 38px rgba(19, 78, 63, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {/* Top Status Bar: Live Dot + Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '2px 4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: isSpeaking ? '#10B981' : '#134E3F',
                boxShadow: isSpeaking
                  ? '0 0 8px #10B981, 0 0 12px #10B981'
                  : 'none',
              }}
            />
            <span
              style={{
                fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1.1,
                color: isSpeaking ? '#15803D' : '#134E3F',
                textTransform: 'uppercase',
              }}
            >
              {isSpeaking ? 'TEACHING' : 'AI TUTOR'}
            </span>
          </div>

          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: '#15803D',
              background: '#DCFCE7',
              border: '1px solid #86EFAC',
              borderRadius: 6,
              padding: '1px 6px',
            }}
          >
            LIVE HD
          </span>
        </div>

        {/* Avatar View Container */}
        <div
          style={{
            width: 140,
            height: 155,
            borderRadius: 15,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #F8FAF9 0%, #EBF4F0 100%)',
            border: '1.5px solid #D1E3DA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {avatarVideoPath ? (
            <Video
              src={staticFile(avatarVideoPath)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ transform: 'scale(0.8) translateY(-6px)' }}>
              <ShikshaSetuAvatar
                speaking={isSpeaking}
                isSpeakingWord={isSpeakingWord}
                width={150}
                height={175}
                showNatureAura={true}
                showEqualizer={false}
              />
            </div>
          )}
        </div>

        {/* Dynamic Equalizer Waveform Bars when speaking */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3.5,
            height: 14,
            marginTop: 2,
          }}
        >
          {[0.9, 1.6, 1.2, 1.8, 1.4, 1.9, 1.0, 1.5].map((multiplier, i) => {
            const barHeight = isSpeaking
              ? Math.max(3, Math.abs(Math.sin(frame * 0.38 + i * 0.55)) * 12 * multiplier)
              : 3;
            return (
              <div
                key={i}
                style={{
                  width: 3,
                  height: barHeight,
                  borderRadius: 2,
                  background: isSpeaking
                    ? 'linear-gradient(180deg, #10B981 0%, #134E3F 100%)'
                    : 'rgba(19, 78, 63, 0.25)',
                  boxShadow: isSpeaking ? '0 0 6px rgba(16, 185, 129, 0.6)' : 'none',
                  transition: 'height 0.05s ease',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PipTeacherCam;
