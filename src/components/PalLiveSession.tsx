'use client';

import React, { useState, useEffect } from 'react';

interface PalLiveSessionProps {
  lang?: string;
  defaultReplicaId?: string;
  defaultPersonaId?: string;
}

export default function PalLiveSession({
  lang = 'de',
  defaultReplicaId = 'rc39f215e8cb',
  defaultPersonaId = 'p10c7cf5763b'
}: PalLiveSessionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isDe = lang === 'de';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const startSession = async () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage(isDe ? 'Verbindung zum Videoserver wird aufgebaut...' : 'Connecting to video server...');

    try {
      const res = await fetch('/api/pal/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: defaultPersonaId,
          replicaId: defaultReplicaId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isDe ? 'Fehler beim Starten der Sitzung' : 'Failed to start session'));
      }

      setStatusMessage(isDe ? 'Stream bereit. Starte Video...' : 'Stream ready. Loading video...');
      setConversationId(data.conversationId);
      setConversationUrl(data.conversationUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isDe ? 'Verbindungsfehler' : 'Connection error');
      setError(msg);
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  const endSession = async () => {
    if (conversationId) {
      try {
        await fetch(`/api/pal/session?conversationId=${encodeURIComponent(conversationId)}`, {
          method: 'DELETE'
        });
      } catch (e) {
        console.error('Session end error:', e);
      }
    }
    setConversationUrl(null);
    setConversationId(null);
    setIsFullscreen(false);
  };

  return (
    <div
      style={{
        width: '100%',
        margin: '1.5rem 0 2.5rem 0'
      }}
    >
      {/* Zoom Container - TasteSkill: 1px border, subtle tone shift, no heavy glow */}
      <div
        style={{
          position: isFullscreen ? 'fixed' : 'relative',
          top: isFullscreen ? 0 : 'auto',
          left: isFullscreen ? 0 : 'auto',
          width: isFullscreen ? '100vw' : '100%',
          height: isFullscreen ? '100vh' : 'auto',
          zIndex: isFullscreen ? 99999 : 1,
          backgroundColor: '#090d16',
          borderRadius: isFullscreen ? '0px' : '12px',
          overflow: 'hidden',
          border: '1px solid #1e293b',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Top Window Bar (Zoom Header) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '11px 16px',
            backgroundColor: '#0f172a',
            borderBottom: '1px solid #1e293b'
          }}
        >
          {/* Left: Window dots + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* macOS Window Controls */}
            <div style={{ display: 'flex', gap: '6px' }} aria-hidden="true">
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '-0.01em' }}>
                Zoom Reality-Check • Gopal Norbert Klein
              </span>
              {conversationUrl ? (
                <span
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                  LIVE
                </span>
              ) : (
                <span
                  style={{
                    backgroundColor: 'rgba(148, 163, 184, 0.12)',
                    color: '#94a3b8',
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    padding: '2px 7px',
                    borderRadius: '4px'
                  }}
                >
                  BEREIT
                </span>
              )}
            </div>
          </div>

          {/* Right: Quick actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {conversationUrl && (
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '5px 9px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
                title={isFullscreen ? 'Vollbild beenden' : 'Vollbild'}
                aria-label={isFullscreen ? 'Vollbild beenden' : 'Vollbild'}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Video Stage */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: isFullscreen ? 'calc(100vh - 120px)' : '580px',
            backgroundColor: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {conversationUrl ? (
            /* Active Live Video Stream */
            <iframe
              src={conversationUrl}
              allow="camera; microphone; display-capture; autoplay"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block'
              }}
              title="Gopal Norbert Klein Live Reality-Check"
            />
          ) : (
            /* Zoom Standby Room */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '36px 20px',
                textAlign: 'center',
                maxWidth: '480px'
              }}
            >
              {/* Product Monogram Avatar Badge - TasteSkill: High contrast, genuine monogram */}
              <div
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
              >
                <span
                  style={{
                    color: '#f8fafc',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em'
                  }}
                >
                  GNK
                </span>
              </div>

              <h2
                style={{
                  color: '#ffffff',
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.02em'
                }}
              >
                Gopal Norbert Klein
              </h2>

              <p
                style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  lineHeight: 1.55,
                  margin: '0 0 22px 0'
                }}
              >
                {isDe
                  ? 'Live-Reality-Check nach der Floating-Methode. Stelle echten Augenkontakt her, um kindliche Bindungsängste und Projektionen direkt aufzulösen.'
                  : 'Live reality-check floating session. Maintain real eye contact to resolve childhood attachment projections.'}
              </p>

              {error && (
                <div
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    fontSize: '0.8125rem',
                    marginBottom: '18px',
                    textAlign: 'left'
                  }}
                >
                  <strong>Verbindungsfehler:</strong> {error}
                </div>
              )}

              {/* Big Zoom Call Button - TasteSkill: Solid flat tone, no gradient, no shadow */}
              <button
                onClick={startSession}
                disabled={isLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  backgroundColor: '#047857',
                  color: '#ffffff',
                  fontSize: '0.925rem',
                  fontWeight: 600,
                  border: '1px solid #065f46',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  boxShadow: 'none',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.currentTarget.style.backgroundColor = '#065f46';
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) e.currentTarget.style.backgroundColor = '#047857';
                }}
              >
                {isLoading ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true">
                      <line x1="12" y1="2" x2="12" y2="6"/>
                      <line x1="12" y1="18" x2="12" y2="22"/>
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                      <line x1="2" y1="12" x2="6" y2="12"/>
                      <line x1="18" y1="12" x2="22" y2="12"/>
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                    </svg>
                    <span>{statusMessage || (isDe ? 'Verbinde...' : 'Connecting...')}</span>
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <span>{isDe ? 'Sitzung starten (Video beitreten)' : 'Start Video Call'}</span>
                  </>
                )}
              </button>

              {/* Status footer with vector icons */}
              <div
                style={{
                  marginTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  color: '#94a3b8',
                  fontSize: '0.75rem'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                  <span>Kamera & Mikrofon aktiv</span>
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <span>Ende-zu-Ende WebRTC</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Zoom Controls Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            backgroundColor: '#0f172a',
            borderTop: '1px solid #1e293b'
          }}
        >
          {/* Left Controls: Audio/Video Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#94a3b8', fontSize: '0.78rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
              Mikrofon bereit
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
              Kamera bereit
            </span>
          </div>

          {/* Center / Right Controls: End Call or Fullscreen */}
          <div>
            {conversationUrl ? (
              <button
                onClick={endSession}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  border: '1px solid #b91c1c',
                  cursor: 'pointer'
                }}
              >
                <span>Sitzung beenden</span>
              </button>
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                Klicke auf „Sitzung starten“, um das Video-Fenster zu öffnen
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
