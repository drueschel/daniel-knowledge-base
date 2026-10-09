import { Composition } from 'remotion';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { Main } from './Main';

export type VideoProps = {
  audioUrl: string;
  videos: string[];
  text: string;
  storyboard?: any[];
  visualStyle?: string;
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HyperFrames"
        component={Main}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={async ({ props }) => {
          if (!props.audioUrl) {
             return { durationInFrames: 300 };
          }
          try {
            const duration = await getAudioDurationInSeconds(props.audioUrl);
            return {
              durationInFrames: Math.max(1, Math.ceil(duration * 30))
            };
          } catch(e) {
            console.log("Error calculating duration", e);
            return { durationInFrames: 300 };
          }
        }}
        defaultProps={{
          audioUrl: '',
          videos: [],
          text: '',
          storyboard: [],
          visualStyle: ''
        }}
      />
    </>
  );
};
