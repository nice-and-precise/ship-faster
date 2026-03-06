import React from 'react';
import type { AgentProfile } from './PixelOffice'; // I will define this type in PixelOffice

interface AgentProfileCardProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentProfile | null;
}

export default function AgentProfileCard({ isOpen, onClose, agent }: AgentProfileCardProps) {
  if (!isOpen || !agent) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div 
        className="nes-container is-rounded is-dark"
        style={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#212529',
          boxShadow: '0 0 20px rgba(51, 255, 51, 0.2)',
          borderImageRepeat: 'stretch'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '4px solid #fff', paddingBottom: '10px' }}>
          <h3 className="title" style={{ margin: 0, color: '#33ff33' }}>{agent.name}</h3>
          <i className={`nes-${agent.sprite_config?.characterType || 'mario'}`} style={{ transform: 'scale(1.5)' }}></i>
        </div>

        <div className="nes-field" style={{ marginBottom: '15px' }}>
          <label style={{ color: '#fff' }}>Model / Hardware</label>
          <div className="nes-input is-dark" style={{ padding: '8px', fontSize: '12px' }}>
            {agent.model} [{agent.thinking_level} thinking]
          </div>
        </div>

        <div className="nes-field" style={{ marginBottom: '15px' }}>
          <label style={{ color: '#fff' }}>Soul & Protocol</label>
          <div 
            className="nes-container is-dark with-title" 
            style={{ padding: '10px', fontSize: '12px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
          >
            <p className="title">MEMORY.md</p>
            {agent.persona || 'No soul configured. Factory settings active.'}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
          <button type="button" className="nes-btn is-error" onClick={onClose}>
            Close File
          </button>
          <button type="button" className="nes-btn is-primary" onClick={() => alert('Agent assignment update feature coming soon!')}>
            Re-Assign
          </button>
        </div>
      </div>
    </div>
  );
}
