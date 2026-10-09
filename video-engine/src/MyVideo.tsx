import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence, Img, Audio, OffthreadVideo } from "remotion";
import storyboard from "./storyboard.json";

const fontFace = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&family=Inter:wght@400;600&display=swap');
`;

const ProgressBar: React.FC<{ totalFrames: number }> = ({ totalFrames }) => {
  const frame = useCurrentFrame();
  const progress = (frame / totalFrames) * 100;
  return (
    <div style={{ position: "absolute", bottom: 40, left: 40, right: 40, height: 6, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ width: `${progress}%`, height: "100%", backgroundColor: "#FBBF24", borderRadius: 10 }} />
    </div>
  );
};

const AnimatedWord: React.FC<{ word: string; startFrame: number; index: number }> = ({ word, startFrame, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const delay = startFrame; 
  const progress = spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.8 } });
  
  const scale = interpolate(progress, [0, 1], [0.5, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateY = interpolate(progress, [0, 1], [40, 0]);

  const isHighlighted = index % 3 === 1;

  return (
    <span
      style={{
        display: "inline-block",
        transform: `scale(${scale}) translateY(${translateY}px)`,
        opacity,
        color: isHighlighted ? "#FBBF24" : "white",
        marginRight: "16px",
        marginBottom: "12px",
        textTransform: "uppercase",
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 900,
        fontSize: 64,
        lineHeight: 1.1,
        textShadow: "0px 4px 12px rgba(0,0,0,0.8)",
      }}
    >
      {word}
    </span>
  );
};

const Scene: React.FC<{ headline: string; words: { word: string, startFrame: number }[]; imageUrl?: string, sceneStartFrame: number }> = ({ headline, words, imageUrl, sceneStartFrame }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  // Subtle Ken Burns zoom on image
  const bgScale = interpolate(frame, [0, durationInFrames], [1, 1.15]);
  
  const titleProgress = spring({ frame: frame - 5, fps, config: { damping: 12 } });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#111" }}>
      {imageUrl && imageUrl.match(/\.(mp4|mov)$/i) ? (
         <AbsoluteFill>
             <OffthreadVideo src={imageUrl} startFrom={sceneStartFrame} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
         </AbsoluteFill>
      ) : imageUrl ? (
        <>
          <AbsoluteFill style={{ transform: `scale(1.2)` }}>
             <Img src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(40px) brightness(0.3)" }} />
          </AbsoluteFill>
          <AbsoluteFill style={{ transform: `scale(${bgScale})`, alignItems: "center", justifyContent: "center" }}>
             <Img src={imageUrl} style={{ width: "90%", height: "auto", maxHeight: "50%", objectFit: "contain", borderRadius: "24px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }} />
          </AbsoluteFill>
        </>
      ) : null}

      {/* Dark gradient overlay for text readability */}
      <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.1) 100%)" }} />

      <AbsoluteFill style={{ padding: "80px 40px", justifyContent: "flex-end", display: "flex", flexDirection: "column", paddingBottom: "120px" }}>
        
        {/* Top Headline Tag */}
        <div style={{
          alignSelf: "center",
          backgroundColor: "rgba(0,0,0,0.6)",
          padding: "10px 24px",
          borderRadius: "50px",
          marginBottom: "auto",
          marginTop: "40px",
          opacity: titleOpacity,
          border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(12px)",
        }}>
          <h2 style={{ color: "white", margin: 0, fontSize: 24, fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "2px" }}>
            {headline}
          </h2>
        </div>

        {/* Kinetic Words at the bottom */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", textAlign: "center" }}>
          {words.map((w, i) => (
            <AnimatedWord key={i} word={w.word} startFrame={w.startFrame} index={i} />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const MyVideo: React.FC = () => {
  let currentTime = 0;
  const totalFrames = storyboard.scenes.reduce((acc: any, scene: any) => acc + scene.durationInFrames, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <style>{fontFace}</style>
      
      {(storyboard as any).audioUrl && <Audio src={(storyboard as any).audioUrl} />}

      {storyboard.scenes.map((scene: any, index: number) => {
        const startFrame = currentTime;
        currentTime += scene.durationInFrames;
        
        return (
          <Sequence key={index} from={startFrame} durationInFrames={scene.durationInFrames}>
            <Scene headline={scene.headline} words={scene.words} imageUrl={scene.imageUrl} sceneStartFrame={startFrame} />
          </Sequence>
        );
      })}
      
      <ProgressBar totalFrames={totalFrames} />
    </AbsoluteFill>
  );
};
