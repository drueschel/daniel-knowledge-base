import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence, interpolateColors } from "remotion";
import storyboard from "./storyboard.json";

// Lade Google Font (Inter & Montserrat)
const fontFace = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&family=Inter:wght@400;600&display=swap');
`;

const NoiseOverlay: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      opacity: 0.15,
      mixBlendMode: "overlay",
      pointerEvents: "none",
    }}
  />
);

const ProgressBar: React.FC<{ totalFrames: number }> = ({ totalFrames }) => {
  const frame = useCurrentFrame();
  const progress = (frame / totalFrames) * 100;
  return (
    <div style={{ position: "absolute", bottom: 40, left: 40, right: 40, height: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ width: `${progress}%`, height: "100%", backgroundColor: "#fff", borderRadius: 10 }} />
    </div>
  );
};

const AnimatedWord: React.FC<{ word: string; index: number }> = ({ word, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Stagger the animation by 5 frames per word
  const delay = index * 6 + 20; 
  const progress = spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.8 } });
  
  const scale = interpolate(progress, [0, 1], [0.8, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateY = interpolate(progress, [0, 1], [30, 0]);

  // Color highlight every 3rd word for IG style
  const isHighlighted = index % 3 === 1;

  return (
    <span
      style={{
        display: "inline-block",
        transform: `scale(${scale}) translateY(${translateY}px)`,
        opacity,
        color: isHighlighted ? "#FBBF24" : "white",
        marginRight: "24px",
        marginBottom: "16px",
        textTransform: "uppercase",
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 900,
        fontSize: 75,
        lineHeight: 1.1,
        textShadow: "0px 6px 15px rgba(0,0,0,0.5)",
      }}
    >
      {word}
    </span>
  );
};

const Scene: React.FC<{ headline: string; words: string[]; gradient: string[] }> = ({ headline, words, gradient }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  // Subtle background zoom & pan
  const bgScale = interpolate(frame, [0, durationInFrames], [1, 1.2]);
  
  // Title slide in
  const titleProgress = spring({ frame: frame - 5, fps, config: { damping: 12 } });
  const titleY = interpolate(titleProgress, [0, 1], [-50, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Moving Gradient Background */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
          transform: `scale(${bgScale})`,
          transformOrigin: "center center",
        }}
      />
      <NoiseOverlay />

      <AbsoluteFill style={{ padding: "80px 60px", justifyContent: "center", display: "flex", flexDirection: "column" }}>
        
        {/* Top Headline Tag */}
        <div style={{
          alignSelf: "flex-start",
          backgroundColor: "rgba(0,0,0,0.4)",
          padding: "12px 24px",
          borderRadius: "50px",
          marginBottom: "60px",
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          border: "2px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
        }}>
          <h2 style={{ color: "white", margin: 0, fontSize: 32, fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "2px" }}>
            {headline}
          </h2>
        </div>

        {/* Kinetic Words */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-start" }}>
          {words.map((w, i) => (
            <AnimatedWord key={i} word={w} index={i} />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const MyVideo: React.FC = () => {
  let currentTime = 0;
  const totalFrames = storyboard.scenes.reduce((acc, scene) => acc + scene.durationInFrames, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <style>{fontFace}</style>
      
      {storyboard.scenes.map((scene, index) => {
        const startFrame = currentTime;
        currentTime += scene.durationInFrames;
        
        return (
          <Sequence key={index} from={startFrame} durationInFrames={scene.durationInFrames}>
            <Scene headline={scene.headline} words={scene.words} gradient={scene.gradient} />
          </Sequence>
        );
      })}
      
      {/* Global Overlays */}
      <ProgressBar totalFrames={totalFrames} />
    </AbsoluteFill>
  );
};
