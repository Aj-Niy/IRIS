import React, { useState } from "react";
import { BookOpen, MessageSquare, Target, GraduationCap, X } from "lucide-react";
import { TRIBAL_LANGUAGES } from "../services/apertiumSantaliData";
import { uiTranslations } from "../services/uiTranslations";
import DifyBot from "./DifyBot";

export default function AIMentorPage({ 
  currentLang = 'sat', 
  userName,
  uiLang = 'en'
}) {
  const t = uiTranslations[uiLang] || uiTranslations.en;
  const [selectedLang, setSelectedLang] = useState(currentLang);
  const [showFeatures, setShowFeatures] = useState(true);

  const activeLangObj = TRIBAL_LANGUAGES.find(l => l.code === selectedLang) || TRIBAL_LANGUAGES[0];

  const FEATURES = [
    { label: "Lesson Translation", icon: BookOpen },
    { label: "Classroom Phrases", icon: MessageSquare },
    { label: "NIPUN FLN Exercises", icon: Target },
    { label: "NEP 2020 Pedagogy", icon: GraduationCap }
  ];

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{t.mentor.title}</h1>
          <p>{t.mentor.subtitle}</p>
        </div>
        <div className="seg">
          {TRIBAL_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              className={selectedLang === lang.code ? 'active' : ''}
              onClick={() => setSelectedLang(lang.code)}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Concise Feature Capability Bar */}
      {showFeatures && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 16,
            padding: '8px 14px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginRight: 4
              }}
            >
              Capabilities
            </span>
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-sub)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <Icon size={13} color="var(--green-primary)" />
                  <span>{feat.label}</span>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setShowFeatures(false)}
            title="Remove feature bar"
            aria-label="Remove feature bar"
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 4,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease'
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Unified Dify Bot inside the central themed workspace */}
      <DifyBot selectedLangName={activeLangObj.name} />
    </div>
  );
}
