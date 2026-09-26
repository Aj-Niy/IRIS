import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

/**
 * IntroScene — Shiksha Setu Animated Introduction Card
 * Features:
 * - Sage-cream studio backdrop with subtle micro-grid
 * - Forest Green "C" logo badge with saffron accent divider
 * - Deep Forest Green title — multilingual font support
 */
export const IntroScene = ({ text = "Welcome to Shiksha Setu\nYour AI avatar lesson is about to begin." }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const scaleProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 95, mass: 0.8 },
  });
  const scale = interpolate(scaleProgress, [0, 1], [0.9, 1]);
  const opacity = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [0, 20], [24, 0], { extrapolateRight: "clamp" });

  // Floating background ambient motion
  const orbX = Math.sin(frame * 0.025) * 20;
  const orbY = Math.cos(frame * 0.02) * 15;

  const lines = (text || "").split("\n");
  const headline = lines[0] || "Shiksha Setu Masterclass";
  const bodyLines = lines.slice(1);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "#F4F7F5",
        backgroundImage: `
          radial-gradient(circle at 15% 20%, rgba(19, 78, 63, 0.08) 0%, transparent 55%),
          radial-gradient(circle at 85% 80%, rgba(234, 88, 12, 0.06) 0%, transparent 55%),
          radial-gradient(circle at 50% 50%, rgba(22, 163, 74, 0.04) 0%, transparent 60%)
        `,
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Noto Sans Ol Chiki", "Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
      }}
    >
      {/* Background Pedagogical Graph Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(19, 78, 63, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(19, 78, 63, 0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          pointerEvents: "none",
        }}
      />

      {/* Floating soft sage ambient glow */}
      <div
        style={{
          position: "absolute",
          width: 550,
          height: 550,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(19, 78, 63, 0.07) 0%, transparent 70%)",
          top: -120 + orbY,
          right: -80 + orbX,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* Main ShikshaSetu Card */}
      <div
        style={{
          maxWidth: 960,
          width: "86%",
          padding: "54px 64px",
          background: "rgba(255, 255, 255, 0.95)",
          border: "2px solid #D1E3DA",
          borderRadius: 28,
          boxShadow:
            "0 24px 60px rgba(19, 78, 63, 0.08), 0 4px 16px rgba(19, 78, 63, 0.04), inset 0 1px 2px #FFFFFF",
          opacity,
          transform: `scale(${scale}) translateY(${translateY}px)`,
          zIndex: 10,
        }}
      >
        {/* LearnAI Studio Brand Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 20px",
            background: "#EBF4F0",
            border: "1.5px solid #D1E3DA",
            borderRadius: 999,
            marginBottom: 24,
          }}
        >
          {/* Forest Green C Icon */}
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: "linear-gradient(135deg, #134E3F, #0E3F33)",
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(19, 78, 63, 0.35)",
            }}
          >
            S
          </div>
          <span
            style={{
              color: "#134E3F",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Shiksha Setu · Video Lesson
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            margin: "0 0 18px 0",
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.25,
            color: "#134E3F",
          }}
        >
          {headline}
        </h1>

        {/* Dynamic Saffron Divider */}
        <div
          style={{
            width: 88,
            height: 5,
            background: "linear-gradient(90deg, #EA580C 0%, #F97316 100%)",
            borderRadius: 4,
            marginBottom: 22,
            boxShadow: "0 2px 8px rgba(234, 88, 12, 0.3)",
          }}
        />

        {/* Body Lines */}
        {bodyLines.map((line, idx) => (
          <p
            key={idx}
            style={{
              margin: "10px 0",
              fontSize: 22,
              color: "#374151",
              lineHeight: 1.65,
              fontWeight: 500,
            }}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

export default IntroScene;
