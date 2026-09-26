import React from 'react';
import { useCurrentFrame, interpolate, staticFile } from 'remotion';

/**
 * Animated Mouth Overlay for ShikshaSetu Female Educator
 * Matches coordinates on shikshasetu_avatar.png:
 * Center X: 50%, Center Y: 41.5%
 */
function AnimatedLipSyncMouth({ isSpeakingWord }) {
  const frame = useCurrentFrame();

  if (!isSpeakingWord) {
    return null;
  }

  // Active speech phoneme dynamics
  const cycle = (frame * 0.42) % (Math.PI * 2);
  const openness = Math.abs(Math.sin(cycle)) * 14 + 3;
  const mouthWidth = 32 + Math.sin(frame * 0.28) * 5;

  return (
    <div
      style={{
        position: 'absolute',
        left: '43.5%',
        top: '39.2%',
        width: '13%',
        height: '5.6%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <svg viewBox="0 0 100 60" style={{ width: '100%', height: '100%' }}>
        {/* Skin patch base to mask resting mouth */}
        <ellipse cx="50" cy="30" rx="46" ry="24" fill="#F0BDA4" />

        {/* Mouth cavity */}
        <ellipse
          cx="50"
          cy="30"
          rx={mouthWidth}
          ry={openness}
          fill="#3B1710"
          stroke="#944837"
          strokeWidth="2"
        />

        {/* Upper teeth white strip */}
        {openness > 6 && (
          <path
            d={`M ${50 - mouthWidth * 0.65} ${30 - openness * 0.3} Q 50 ${30 - openness * 0.2} ${50 + mouthWidth * 0.65} ${30 - openness * 0.3} Q 50 ${30 + 1} ${50 - mouthWidth * 0.65} ${30 - openness * 0.3}`}
            fill="#FFFFFF"
            opacity="0.95"
          />
        )}

        {/* Soft tongue curve */}
        {openness > 8 && (
          <ellipse
            cx="50"
            cy={30 + openness * 0.45}
            rx={mouthWidth * 0.5}
            ry={openness * 0.35}
            fill="#E07A6B"
          />
        )}

        {/* Upper lip outline */}
        <path
          d={`M ${50 - mouthWidth} 30 Q 50 ${30 - openness * 0.5 - 2} ${50 + mouthWidth} 30`}
          stroke="#944837"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Lower lip outline */}
        <path
          d={`M ${50 - mouthWidth} 30 Q 50 ${30 + openness * 0.65 + 3} ${50 + mouthWidth} 30`}
          stroke="#944837"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/**
 * Animated Blinking Eyelids
 * Natural human blink cycle every ~125 frames (approx 4.1 sec)
 */
function AnimatedBlinkingEyes() {
  const frame = useCurrentFrame();
  const blinkCycle = frame % 125;
  const isBlinking = blinkCycle < 6;

  if (!isBlinking) return null;

  return (
    <>
      {/* Left Eye Blink */}
      <div
        style={{
          position: 'absolute',
          left: '38.5%',
          top: '29.2%',
          width: '9%',
          height: '3.5%',
          pointerEvents: 'none',
        }}
      >
        <svg viewBox="0 0 50 25" style={{ width: '100%', height: '100%' }}>
          <ellipse cx="25" cy="12" rx="22" ry="11" fill="#F0BDA4" />
          <path
            d="M 5 12 Q 25 18 45 12"
            stroke="#4A2E1B"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Right Eye Blink */}
      <div
        style={{
          position: 'absolute',
          left: '52.5%',
          top: '29.2%',
          width: '9%',
          height: '3.5%',
          pointerEvents: 'none',
        }}
      >
        <svg viewBox="0 0 50 25" style={{ width: '100%', height: '100%' }}>
          <ellipse cx="25" cy="12" rx="22" ry="11" fill="#F0BDA4" />
          <path
            d="M 5 12 Q 25 18 45 12"
            stroke="#4A2E1B"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </>
  );
}

/**
 * Animated Monarch / Saffron Butterfly
 * 3D flapping wing physics with natural flight sway
 */
export function FlutteringButterfly({
  startX = 20,
  startY = 30,
  size = 42,
  speed = 1,
  color = '#F97316',
  flip = false,
}) {
  const frame = useCurrentFrame();
  const flap = Math.cos(frame * 0.35 * speed);
  const wingScaleX = Math.max(0.15, Math.abs(flap));
  const swayX = Math.sin(frame * 0.04 * speed + startX) * 22;
  const swayY = Math.cos(frame * 0.05 * speed + startY) * 16;
  const rotate = Math.sin(frame * 0.03 * speed) * 15;

  return (
    <div
      style={{
        position: 'absolute',
        left: `calc(${startX}% + ${swayX}px)`,
        top: `calc(${startY}% + ${swayY}px)`,
        width: size,
        height: size * 0.8,
        transform: `rotate(${rotate}deg) ${flip ? 'scaleX(-1)' : ''}`,
        transformOrigin: 'center center',
        pointerEvents: 'none',
        zIndex: 25,
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))',
      }}
    >
      <svg viewBox="0 0 100 80" style={{ width: '100%', height: '100%' }}>
        {/* Left Wing with 3D flap */}
        <g
          style={{
            transform: `scaleX(${wingScaleX})`,
            transformOrigin: '50px 40px',
          }}
        >
          <path
            d="M 50 40 C 20 10, 5 25, 12 50 C 18 68, 38 60, 50 45 Z"
            fill={color}
            stroke="#3B1710"
            strokeWidth="2"
          />
          <path
            d="M 50 40 C 25 22, 18 35, 22 48"
            stroke="#FFE4D6"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx="22" cy="40" r="3" fill="#FFFFFF" opacity="0.8" />
          <circle cx="16" cy="52" r="2.5" fill="#FFFFFF" opacity="0.8" />
        </g>

        {/* Right Wing with 3D flap */}
        <g
          style={{
            transform: `scaleX(${wingScaleX})`,
            transformOrigin: '50px 40px',
          }}
        >
          <path
            d="M 50 40 C 80 10, 95 25, 88 50 C 82 68, 62 60, 50 45 Z"
            fill={color}
            stroke="#3B1710"
            strokeWidth="2"
          />
          <path
            d="M 50 40 C 75 22, 82 35, 78 48"
            stroke="#FFE4D6"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx="78" cy="40" r="3" fill="#FFFFFF" opacity="0.8" />
          <circle cx="84" cy="52" r="2.5" fill="#FFFFFF" opacity="0.8" />
        </g>

        {/* Butterfly Body & Antennae */}
        <ellipse cx="50" cy="42" rx="3.5" ry="12" fill="#2B130E" />
        <path
          d="M 48 30 Q 42 20 38 18 M 52 30 Q 58 20 62 18"
          stroke="#2B130E"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/**
 * ShikshaSetu Female Educator AI Avatar
 * Faithfully matches the UI screenshot design, color palette, and character art.
 */
export function ShikshaSetuAvatar({
  speaking = false,
  isSpeakingWord = false,
  width = 300,
  height = 360,
  showNatureAura = true,
  showEqualizer = true,
}) {
  const frame = useCurrentFrame();

  // Natural subtle breathing and head nod physics
  const breathing = Math.sin(frame * 0.048) * 2.2;
  const headNod = isSpeakingWord ? Math.sin(frame * 0.22) * 2.5 : breathing * 0.5;
  const headTilt = isSpeakingWord ? Math.sin(frame * 0.12) * 1.5 : Math.sin(frame * 0.03) * 0.8;

  // Concentric Nature Aura Pulse
  const auraPulse = 1 + Math.sin(frame * 0.04) * 0.04;

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      {/* Concentric Soft Nature / Sunburst Aura (from UI illustration) */}
      {showNatureAura && (
        <div
          style={{
            position: 'absolute',
            top: '2%',
            width: width * 0.92,
            height: width * 0.92,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(220, 240, 230, 0.75) 45%, rgba(180, 220, 200, 0.3) 70%, transparent 85%)',
            border: '2px solid rgba(134, 191, 160, 0.35)',
            transform: `scale(${auraPulse})`,
            boxShadow: '0 0 35px rgba(134, 191, 160, 0.25)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Outer Golden Aura Ring */}
      {showNatureAura && (
        <div
          style={{
            position: 'absolute',
            top: '-2%',
            width: width * 1.05,
            height: width * 1.05,
            borderRadius: '50%',
            border: '1.5px dashed rgba(234, 88, 12, 0.25)',
            transform: `scale(${1 + Math.sin(frame * 0.025) * 0.03}) rotate(${frame * 0.15}deg)`,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Main Avatar Character Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transform: `translateY(${-headNod}px) rotate(${headTilt}deg)`,
          transformOrigin: '50% 90%',
          zIndex: 5,
          filter: 'drop-shadow(0 14px 28px rgba(19, 78, 63, 0.18))',
        }}
      >
        {/* Base Transparent Cutout of Female Teacher Avatar */}
        <img
          src={staticFile('shikshasetu_avatar.png')}
          alt="Indian AI Educator"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />

        {/* Animated Lip-sync Mouth */}
        <AnimatedLipSyncMouth isSpeakingWord={isSpeakingWord} />

        {/* Animated Blinking Eyes */}
        <AnimatedBlinkingEyes />
      </div>

      {/* Dynamic Voice Waveform Equalizer */}
      {showEqualizer && speaking && (
        <div
          style={{
            position: 'absolute',
            bottom: -6,
            display: 'flex',
            gap: 3.5,
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.92)',
            border: '1.5px solid #86BFA0',
            borderRadius: 999,
            padding: '4px 12px',
            boxShadow: '0 4px 12px rgba(19, 78, 63, 0.15)',
            zIndex: 10,
          }}
        >
          <span style={{ fontSize: 11, marginRight: 2 }}>🎙️</span>
          {[1.2, 1.8, 0.9, 1.6, 1.1, 1.7, 0.8, 1.4].map((h, i) => (
            <div
              key={i}
              style={{
                width: 3.5,
                height: 5 + Math.abs(Math.sin(frame * 0.35 + i * 0.6)) * 14 * h,
                background: 'linear-gradient(180deg, #10B981, #134E3F)',
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
