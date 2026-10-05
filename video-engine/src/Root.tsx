import { Composition } from "remotion";
import { MyVideo } from "./MyVideo";
import storyboard from "./storyboard.json";

export const RemotionRoot: React.FC = () => {
  // Dynamically calculate total duration based on storyboard
  const totalFrames = storyboard.scenes.reduce((acc, scene) => acc + scene.durationInFrames, 0);

  return (
    <>
      <Composition
        id="MyComp"
        component={MyVideo}
        durationInFrames={totalFrames}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
