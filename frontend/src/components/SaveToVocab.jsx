import React, { useState } from 'react';
import { saveVocabEntry } from '../services/vocabMemory';

// Inline SVG icons to avoid dependency on specific lucide version
const BookmarkPlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
    <line x1="12" y1="7" x2="12" y2="13"/>
    <line x1="9" y1="10" x2="15" y2="10"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const DupeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

/**
 * Reusable "Save to Words in Use" action button.
 * Can be embedded in vocab cards, translation results, voice panels, etc.
 *
 * Props:
 *   text     {string}  - The tribal-script word/phrase to save (required)
 *   roman    {string}  - Roman phonetic pronunciation
 *   hindi    {string}  - Source Hindi text
 *   lang     {string}  - Language code: 'sat' | 'hoc' | 'unr'
 *   langName {string}  - Human-readable language name
 *   source   {string}  - Origin feature: 'lesson' | 'voice' | 'translation'
 *   context  {string}  - Brief contextual info (lesson title, phrase category, etc.)
 *   onSaved  {func}    - Optional callback after successful save: onSaved(entry, isDuplicate)
 */
export default function SaveToVocab({
  text = '',
  roman = '',
  hindi = '',
  lang = 'sat',
  langName = 'Santhali',
  source = 'lesson',
  context = '',
  onSaved
}) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'duplicate' | 'error'

  const handleSave = async () => {
    if (!text.trim() || status === 'saving') return;
    setStatus('saving');

    const result = saveVocabEntry({ text, roman, hindi, lang, langName, source, context });

    if (!result.saved) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
      return;
    }

    if (result.isDuplicate) {
      setStatus('duplicate');
    } else {
      setStatus('saved');
    }

    if (onSaved) onSaved(result.entry, result.isDuplicate);
    setTimeout(() => setStatus('idle'), 2200);
  };

  const isDisabled = status === 'saving' || !text.trim();

  const label = {
    idle:      'Save',
    saving:    'Saving…',
    saved:     'Saved!',
    duplicate: 'Already saved',
    error:     'Error'
  }[status];

  const Icon = {
    idle:      BookmarkPlusIcon,
    saving:    BookmarkPlusIcon,
    saved:     CheckIcon,
    duplicate: DupeIcon,
    error:     DupeIcon
  }[status];

  const color = {
    idle:      'var(--text-muted)',
    saving:    'var(--text-muted)',
    saved:     'var(--green-accent)',
    duplicate: 'var(--badge-amber-text)',
    error:     'var(--badge-rose-text)'
  }[status];

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={isDisabled}
      title={isDisabled && !text.trim() ? 'No text to save' : 'Save to Words in Use'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '5px 9px',
        borderRadius: 'var(--radius-full)',
        fontSize: 11,
        fontWeight: 700,
        fontFamily: 'inherit',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        background: status === 'saved' ? 'var(--green-light)' : status === 'duplicate' ? 'var(--badge-amber-bg)' : 'transparent',
        border: '1px solid',
        borderColor: status === 'saved' ? 'var(--green-border)' : status === 'duplicate' ? 'var(--badge-amber-border)' : 'var(--border-medium)',
        color,
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap'
      }}
    >
      <Icon />
      <span>{label}</span>
    </button>
  );
}
