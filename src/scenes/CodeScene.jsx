import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { SubtitleBar } from "./AvatarScene";

/**
 * CodeScene — ShikshaSetu Interactive Code Studio with Variable Memory State
 * Features:
 * - Animated execution line pointer that steps down code lines
 * - Live Variable Memory Tracker dock (variable changes live on screen)
 * - Live terminal execution output console
 * - Forest Green & Slate studio layout
 * - Native Ol Chiki & indigenous language font support
 */
export const CodeScene = ({
  code = "# Code example\nfor i in range(3):\n    print('Loop:', i)",
  language = "python",
  audioDuration = 10,
  subtitleWords = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalFrames = Math.max(Math.round(audioDuration * fps), 300);

  // Entrance spring
  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.8 },
  });
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [20, 0]);

  // Clean code and line counting
  const cleanCode = (code || "").replace(/\\n/g, "\n");
  const codeLines = cleanCode.split("\n");
  const lineCount = codeLines.length;

  // Active line step execution simulation
  const activeLineIdx = Math.min(
    lineCount - 1,
    Math.floor((frame / Math.max(1, totalFrames * 0.8)) * lineCount)
  );

  // Live variable iteration simulation
  const simIteration = Math.floor(frame / 35) % 4;

  // Terminal blinking cursor
  const cursorBlink = Math.floor(frame / 12) % 2 === 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        height: "100%",
        backgroundColor: "#F4F7F5",
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(19, 78, 63, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(234, 88, 12, 0.05) 0%, transparent 50%)
        `,
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Noto Sans Ol Chiki", "Plus Jakarta Sans", "Inter", sans-serif',
        padding: "35px 55px 85px 55px",
        boxSizing: "border-box",
      }}
    >
      {/* Background Pedagogical Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(19,78,63,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(19,78,63,0.035) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      {/* Main Dual Area: Editor (60%) + Live Execution Inspector (40%) */}
      <div
        style={{
          display: "flex",
          gap: 24,
          width: "74%",
          maxWidth: 920,
          zIndex: 10,
          opacity,
          transform: `translateY(${translateY}px)`,
        }}
      >
        {/* Left: Code Editor Window */}
        <div
          style={{
            flex: 1.3,
            background: "#0F172A",
            borderRadius: 20,
            boxShadow: "0 16px 40px rgba(19, 78, 63, 0.12)",
            border: "2px solid #D1E3DA",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Top Window Bar: Forest Green Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "11px 18px",
              background: "#134E3F",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div style={{ display: "flex", gap: 7 }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#EF4444" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#F59E0B" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#10B981" }} />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255, 255, 255, 0.15)",
                padding: "3px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                color: "#FFFFFF",
                fontFamily: "monospace",
              }}
            >
              <span>{language === "cpp" ? "⚡ lesson.cpp" : "🐍 lesson.py"}</span>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399" }} />
            </div>

            <span style={{ fontSize: 10, fontWeight: 800, color: "#A7F3D0", letterSpacing: 1.2 }}>
              LINE {activeLineIdx + 1}/{lineCount}
            </span>
          </div>

          {/* Code Text with Syntax Highlighter */}
          <div style={{ position: "relative", padding: "10px 14px", flex: 1, overflow: "hidden" }}>
            <SyntaxHighlighter
              language={language === "cpp" ? "cpp" : "python"}
              style={vscDarkPlus}
              showLineNumbers
              wrapLines
              lineNumberStyle={{
                color: "rgba(148, 163, 184, 0.4)",
                minWidth: "2.2em",
                paddingRight: "0.8em",
                fontSize: 14,
              }}
              customStyle={{
                margin: 0,
                padding: "10px 14px",
                background: "transparent",
                fontSize: 15,
                lineHeight: 1.6,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Noto Sans Ol Chiki', monospace",
              }}
            >
              {cleanCode}
            </SyntaxHighlighter>
          </div>

          {/* Bottom IDE status */}
          <div
            style={{
              marginTop: "auto",
              display: "flex",
              justifyContent: "space-between",
              padding: "7px 16px",
              background: "#080F1D",
              borderTop: "1px solid rgba(255, 255, 255, 0.07)",
              fontSize: 10,
              color: "#94A3B8",
              fontFamily: "monospace",
            }}
          >
            <span style={{ color: "#34D399" }}>▶ Live Code Execution</span>
            <span>UTF-8 • Ol Chiki Native</span>
          </div>
        </div>

        {/* Right: Variable Memory State & Output Console */}
        <div
          style={{
            flex: 0.9,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Live Variable Memory Inspector */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D1E3DA",
              borderRadius: 16,
              padding: "14px 16px",
              boxShadow: "0 8px 24px rgba(19, 78, 63, 0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  color: "#134E3F",
                  textTransform: "uppercase",
                }}
              >
                🧠 VARIABLE MEMORY STATE
              </span>
              <span
                style={{
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 99,
                  background: "#DCFCE7",
                  color: "#15803D",
                  fontWeight: 800,
                }}
              >
                LIVE WATCH
              </span>
            </div>

            {/* Variable Slots */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 12px",
                  background: "#F8FAF9",
                  borderRadius: 8,
                  border: "1px solid #E2ECE8",
                  fontSize: 13,
                  fontFamily: "monospace",
                }}
              >
                <span style={{ color: "#134E3F", fontWeight: 700 }}>iterator [i]</span>
                <span style={{ color: "#EA580C", fontWeight: 800 }}>{simIteration}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 12px",
                  background: "#F8FAF9",
                  borderRadius: 8,
                  border: "1px solid #E2ECE8",
                  fontSize: 13,
                  fontFamily: "monospace",
                }}
              >
                <span style={{ color: "#134E3F", fontWeight: 700 }}>active_line</span>
                <span style={{ color: "#10B981", fontWeight: 800 }}>{activeLineIdx + 1}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 12px",
                  background: "#F8FAF9",
                  borderRadius: 8,
                  border: "1px solid #E2ECE8",
                  fontSize: 13,
                  fontFamily: "monospace",
                }}
              >
                <span style={{ color: "#134E3F", fontWeight: 700 }}>status</span>
                <span style={{ color: "#0284C7", fontWeight: 800 }}>OPTIMAL</span>
              </div>
            </div>
          </div>

          {/* Execution Output Console */}
          <div
            style={{
              flex: 1,
              background: "#080F1D",
              border: "1.5px solid #134E3F",
              borderRadius: 16,
              padding: "14px 16px",
              boxShadow: "0 8px 24px rgba(19, 78, 63, 0.08)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                paddingBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  color: "#34D399",
                  textTransform: "uppercase",
                }}
              >
                TERMINAL OUTPUT
              </span>
              <span style={{ fontSize: 10, color: "#64748B" }}>bash</span>
            </div>

            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                color: "#E2E8F0",
                lineHeight: 1.6,
              }}
            >
              <div style={{ color: "#64748B" }}>$ python3 lesson.py</div>
              {Array.from({ length: Math.min(activeLineIdx + 1, 3) }).map((_, idx) => (
                <div key={idx} style={{ color: "#34D399" }}>
                  &gt; [OK] Iteration {idx}: Step completed successfully
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#EA580C" }}>
                <span>&gt; processing</span>
                {cursorBlink && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 7,
                      height: 14,
                      background: "#EA580C",
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized Subtitle Bar */}
      <SubtitleBar subtitleWords={subtitleWords} totalFrames={totalFrames} />
    </div>
  );
};

export default CodeScene;
