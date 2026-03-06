'use client';

import { useEffect, useState } from 'react';
import type { CharacterType } from './AgentSprite';

type DeskPosition = { x: number; y: number };

type AgentCreatePayload = {
  name: string;
  model: string;
  thinking_level: string;
  persona: string;
  sprite_config: {
    characterType: CharacterType;
    character_type: CharacterType;
    desk: DeskPosition;
    desk_position: DeskPosition;
  };
};

type AgentBuilderModalProps = {
  isOpen: boolean;
  desk: DeskPosition | null;
  onClose: () => void;
  onSubmit: (payload: AgentCreatePayload, authToken?: string) => Promise<void>;
};

const MODELS = ['gemini-3.1-pro-preview-customtools', 'openai-codex/gpt-5.3-codex', 'opencode-go/kimi-k2.5'];
const THINKING = ['low', 'medium', 'high'];
const CHARACTERS: CharacterType[] = ['mario', 'luigi', 'toad', 'peach', 'yoshi'];

export default function AgentBuilderModal({ isOpen, desk, onClose, onSubmit }: AgentBuilderModalProps) {
  const [name, setName] = useState('');
  const [model, setModel] = useState(MODELS[0]);
  const [thinkingLevel, setThinkingLevel] = useState('low');
  const [persona, setPersona] = useState('');
  const [characterType, setCharacterType] = useState<CharacterType>('mario');
  const [authToken, setAuthToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName('');
    setPersona('');
    setError(null);
    setAuthToken(window.localStorage.getItem('mc.token') || '');
  }, [isOpen, desk?.x, desk?.y]);

  if (!isOpen || !desk) return null;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(
        {
          name: name.trim(),
          model,
          thinking_level: thinkingLevel,
          persona: persona.trim(),
          sprite_config: {
            characterType,
            character_type: characterType,
            desk,
            desk_position: desk,
          },
        },
        authToken.trim() || undefined,
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000 }}>
      <div className="nes-container with-title is-dark" style={{ maxWidth: 560, margin: '8vh auto', padding: 16 }}>
        <p className="title">Agent Builder · Desk {desk.x},{desk.y}</p>
        <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
          <input className="nes-input" placeholder="Agent name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="nes-select">
            <select value={model} onChange={(e) => setModel(e.target.value)}>{MODELS.map((m) => <option key={m}>{m}</option>)}</select>
          </div>
          <div className="nes-select">
            <select value={thinkingLevel} onChange={(e) => setThinkingLevel(e.target.value)}>{THINKING.map((t) => <option key={t}>{t}</option>)}</select>
          </div>
          <div className="nes-select">
            <select value={characterType} onChange={(e) => setCharacterType(e.target.value as CharacterType)}>{CHARACTERS.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <textarea className="nes-textarea" placeholder="Persona" value={persona} onChange={(e) => setPersona(e.target.value)} rows={3} />
          <input className="nes-input" placeholder="Bearer token (admin/orchestrator)" value={authToken} onChange={(e) => setAuthToken(e.target.value)} />
          {error ? <p className="nes-text is-error">{error}</p> : null}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="nes-btn" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="nes-btn is-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Agent'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
