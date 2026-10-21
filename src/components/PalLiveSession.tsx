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
  const [showCheatSheet, setShowCheatSheet] = useState(false);
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
        margin: '1.5rem 0 3rem 0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Zoom Container */}
      <div
        style={{
          position: isFullscreen ? 'fixed' : 'relative',
          top: isFullscreen ? 0 : 'auto',
          left: isFullscreen ? 0 : 'auto',
          width: isFullscreen ? '100vw' : '100%',
          height: isFullscreen ? '100vh' : 'auto',
          zIndex: isFullscreen ? 99999 : 1,
          backgroundColor: '#090d16',
          borderRadius: isFullscreen ? '0px' : '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(147, 51, 234, 0.25)',
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
            padding: '12px 18px',
            backgroundColor: '#0f172a',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Left: Window dots + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* macOS Window Controls */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
              <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
              <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '-0.01em' }}>
                Zoom Reality-Check • Gopal Norbert Klein
              </span>
              {conversationUrl ? (
                <span
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                  LIVE
                </span>
              ) : (
                <span
                  style={{
                    backgroundColor: 'rgba(148, 163, 184, 0.15)',
                    color: '#94a3b8',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '9999px'
                  }}
                >
                  BEREIT
                </span>
              )}
            </div>
          </div>

          {/* Right: Quick actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowCheatSheet(!showCheatSheet)}
              style={{
                backgroundColor: showCheatSheet ? '#7c3aed' : 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📖 {isDe ? '5-Phasen Spickzettel' : '5-Phase Guide'}
            </button>

            {conversationUrl && (
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
                title={isFullscreen ? 'Vollbild beenden' : 'Vollbild'}
              >
                {isFullscreen ? '✕' : '⛶'}
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Guidance Drawer */}
        {showCheatSheet && (
          <div
            style={{
              backgroundColor: '#0b1120',
              borderBottom: '1px solid rgba(147, 51, 234, 0.3)',
              padding: '16px 20px',
              color: '#e2e8f0',
              fontSize: '0.8rem',
              lineHeight: 1.5
            }}
          >
            <div style={{ fontWeight: 700, color: '#c084fc', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
              {isDe ? 'Die 5 Phasen im Überblick' : '5-Phase Overview'}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '10px'
              }}
            >
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px' }}>
                <b style={{ color: '#a855f7' }}>1. Erdung:</b> Äußeres Thema in 1 Satz nennen – dann sofort ins Hier & Jetzt.
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px' }}>
                <b style={{ color: '#a855f7' }}>2. Weiche:</b> Anstrengen/brav sein (Verschmelzung) oder Distanz/Rückzug (Autonomie)?
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px' }}>
                <b style={{ color: '#a855f7' }}>3. 4 Säulen:</b> Droht Angreifen, Verlassen, Ignorieren oder Manipulieren?
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px' }}>
                <b style={{ color: '#a855f7' }}>4. Reality-Check:</b> Frage Gopal direkt: „Hast du vor, mich zu verlassen?“
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px' }}>
                <b style={{ color: '#a855f7' }}>5. Stille:</b> Bei Zweifeln: „Lügst du mich an?“ Bei Tränen/Seufzen: Stille halten.
              </div>
            </div>
          </div>
        )}

        {/* Video Stage (The actual Zoom View) */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: isFullscreen ? 'calc(100vh - 120px)' : '620px',
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
                padding: '40px 24px',
                textAlign: 'center',
                maxWidth: '520px'
              }}
            >
              {/* Avatar Photo / Icon Placeholder */}
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                  padding: '3px',
                  marginBottom: '20px',
                  boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem'
                  }}
                >
                  🧘‍♂️
                </div>
              </div>

              <h2
                style={{
                  color: '#ffffff',
                  fontSize: '1.5rem',
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
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  margin: '0 0 24px 0'
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
                    padding: '12px 16px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    fontSize: '0.85rem',
                    marginBottom: '20px',
                    textAlign: 'left'
                  }}
                >
                  <strong>Verbindungsfehler:</strong> {error}
                </div>
              )}

              {/* Big Zoom Call Button */}
              <button
                onClick={startSession}
                disabled={isLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 32px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.5)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                {isLoading ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                    <span>{statusMessage || (isDe ? 'Verbinde...' : 'Connecting...')}</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '1.2rem' }}>📞</span>
                    <span>{isDe ? 'Sitzung starten (Video beitreten)' : 'Start Video Call'}</span>
                  </>
                )}
              </button>

              <div
                style={{
                  marginTop: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  color: '#64748b',
                  fontSize: '0.75rem'
                }}
              >
                <span>🎥 Kamera & Mikrofon aktiv</span>
                <span>•</span>
                <span>🔒 Ende-zu-Ende WebRTC</span>
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
            padding: '14px 24px',
            backgroundColor: '#0f172a',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Left Controls: Audio/Video Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#94a3b8', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#10b981' }}>●</span> Mikrofon bereit
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#10b981' }}>●</span> Kamera bereit
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
                  gap: '8px',
                  padding: '8px 20px',
                  borderRadius: '9999px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                }}
              >
                <span>✕</span>
                <span>{isDe ? 'Sitzung beenden' : 'End Call'}</span>
              </button>
            ) : (
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                Klicke auf „Sitzung starten“, um das Video-Fenster zu öffnen
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
