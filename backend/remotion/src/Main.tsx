import { AbsoluteFill, Audio, Sequence, useVideoConfig, Video } from 'remotion';
import React from 'react';
import { VideoProps } from './Root';
import { MetaphorScene } from './MetaphorScene';

export const Main: React.FC<VideoProps> = ({ audioUrl, videos, text, storyboard, visualStyle }) => {
  const { fps, durationInFrames } = useVideoConfig();

  const useMetaphors = storyboard && storyboard.length > 0;
  const clipsCount = Math.max(1, useMetaphors ? storyboard.length : videos.length);
  const framesPerClip = Math.ceil(durationInFrames / clipsCount);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
      {audioUrl && <Audio src={audioUrl} />}

      {/* Legacy Pexels Fallback */}
      {!useMetaphors && videos.map((vidUrl, index) => {
        const startFrame = index * framesPerClip;
        return (
          <Sequence key={index} from={startFrame} durationInFrames={framesPerClip}>
            <AbsoluteFill>
              <Video
                src={vidUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.5
                }}
                muted
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* New Abstract Metaphor Engine */}
      {useMetaphors && storyboard!.map((scene, index) => {
        const startFrame = index * framesPerClip;
        
        return (
          <Sequence key={index} from={startFrame} durationInFrames={framesPerClip}>
            <MetaphorScene 
              type={scene.metaphor_type} 
              duration={framesPerClip} 
              text={scene.voiceover_text} 
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
