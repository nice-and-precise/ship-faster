'use client';

import { useEffect, useState } from 'react';

export type DialogueLine = {
  id: string;
  speaker: string;
  portrait?: string;
  text: string;
  requiresInput?: boolean;
  inputPlaceholder?: string;
  submitLabel?: string;
};

type RPGDialogueBoxProps = {
  isOpen: boolean;
  lines: DialogueLine[];
  onClose: () => void;
  onInputSubmit?: (value: string) => void;
};

export default function RPGDialogueBox({ isOpen, lines, onClose, onInputSubmit }: RPGDialogueBoxProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setLineIndex(0);
      setInputValue('');
    }
  }, [isOpen]);

  if (!isOpen || lines.length === 0) return null;

  const line = lines[Math.min(lineIndex, lines.length - 1)];
  const lastLine = lineIndex >= lines.length - 1;

  const next = () => {
    if (lastLine) {
      onClose();
      return;
    }
    setLineIndex((prev) => Math.min(prev + 1, lines.length - 1));
  };

  const submit = () => {
    if (!line.requiresInput) return;
    onInputSubmit?.(inputValue.trim());
    setInputValue('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 12,
        zIndex: 260,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <section
        className="nes-container is-dark with-title"
        style={{ width: 'min(980px, calc(100vw - 24px))', pointerEvents: 'auto' }}
      >
        <p className="title">{line.speaker}</p>
        <div style={{ display: 'grid', gap: 10 }}>
          <p style={{ margin: 0, fontSize: '10px', lineHeight: 1.7 }}>
            {line.portrait ? `${line.portrait} ` : ''}
            {line.text}
          </p>

          {line.requiresInput && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                className="nes-input"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder={line.inputPlaceholder ?? 'https://target.tld'}
                style={{ flex: 1, minWidth: 220 }}
              />
              <button type="button" className="nes-btn is-success" onClick={submit}>
                {line.submitLabel ?? 'Send'}
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="nes-btn" onClick={onClose}>Close</button>
            <button type="button" className="nes-btn is-primary" onClick={next}>{lastLine ? 'Done' : 'Next'}</button>
          </div>
        </div>
      </section>
    </div>
  );
}
