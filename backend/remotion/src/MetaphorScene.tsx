import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig, random } from 'remotion';

export const MetaphorScene: React.FC<{ type: string, duration: number, text: string }> = ({ type, duration, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const progress = interpolate(frame, [0, duration], [0, 1], { extrapolateRight: 'clamp' });
  const pulse = Math.sin(frame / 5) * 0.05 + 1; // subtle pulsing

  const bgColor = '#f8f5f0'; // Warm paper background
  let elements = null;

  // Minimalist clean styling
  const circleBase = {
    position: 'absolute' as const,
    width: 300,
    height: 300,
    borderRadius: '50%',
    border: '8px solid #2d3748', // Dark slate stroke
    mixBlendMode: 'multiply' as const,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  if (type === 'FUSION') {
    // Two circles moving together and merging
    const distance = interpolate(progress, [0, 1], [300, 80]);
    elements = (
      <>
        <div style={{ ...circleBase, backgroundColor: '#fb923c', opacity: 0.8, transform: `translate(-${distance}px, 0)` }} />
        <div style={{ ...circleBase, backgroundColor: '#38bdf8', opacity: 0.8, transform: `translate(${distance}px, 0)` }} />
      </>
    );
  } else if (type === 'AUTONOMY') {
    // One circle moving away and getting smaller
    const distanceX = interpolate(progress, [0, 1], [150, 400]);
    const distanceY = interpolate(progress, [0, 1], [0, -400]);
    const scale = interpolate(progress, [0, 1], [1, 0.5]);
    
    elements = (
      <>
        <div style={{ ...circleBase, backgroundColor: '#fb923c', opacity: 0.8, transform: `translate(-150px, 0)` }} />
        <div style={{ ...circleBase, backgroundColor: '#38bdf8', opacity: 0.8, transform: `translate(${distanceX}px, ${distanceY}px) scale(${scale})` }} />
      </>
    );
  } else if (type === 'CONTACT') {
    // Two circles with a connecting line growing between them
    const lineWidth = interpolate(progress, [0, 0.5], [0, 400], { extrapolateRight: 'clamp' });
    elements = (
      <>
        <div style={{ ...circleBase, width: 250, height: 250, backgroundColor: '#34d399', opacity: 0.8, transform: `translate(-250px, 0) scale(${pulse})` }} />
        <div style={{ ...circleBase, width: 250, height: 250, backgroundColor: '#38bdf8', opacity: 0.8, transform: `translate(250px, 0) scale(${pulse})` }} />
        {/* The connection line */}
        <div style={{ position: 'absolute', width: lineWidth, height: 8, backgroundColor: '#2d3748', zIndex: -1 }} />
      </>
    );
  } else {
    // TENSION
    // Erratic jittery movement to symbolize internal storm
    const jitterX = (random(frame) - 0.5) * 30;
    const jitterY = (random(frame + 1) - 0.5) * 30;
    elements = (
      <>
        <div style={{ ...circleBase, backgroundColor: '#fb923c', opacity: 0.8, transform: `translate(-150px, 0)` }} />
        <div style={{ ...circleBase, backgroundColor: '#f43f5e', opacity: 0.9, transform: `translate(${150 + jitterX}px, ${jitterY}px) scale(${pulse * 1.1})` }} />
        {/* Jagged broken connection line */}
        <div style={{ position: 'absolute', width: 250, height: 8, backgroundColor: '#2d3748', transform: `rotate(${jitterY}deg)`, opacity: 0.5, zIndex: -1 }} />
      </>
    );
  }

  // Fade in/out for subtitle
  const opacity = interpolate(frame, [0, 10, duration - 10, duration], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }}>
      {/* Subtle paper texture overlay */}
      <AbsoluteFill style={{ opacity: 0.4, backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }} />
      
      {elements}
      
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '150px', opacity }}>
        <div style={{
          width: '85%',
          textAlign: 'center',
        }}>
           <h1 style={{ color: '#1e293b', fontFamily: 'serif', fontSize: '55px', fontWeight: 600, lineHeight: '1.4', margin: 0 }}>
              {text}
            </h1>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
