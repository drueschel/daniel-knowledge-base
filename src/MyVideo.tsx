import { AbsoluteFill, useCurrentFrame } from "remotion";

export const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  
  return (
    <AbsoluteFill style={{ backgroundColor: "#1e1e1e", justifyContent: "center", alignItems: "center" }}>
      <h1 style={{ color: "white", fontSize: 100, fontFamily: "sans-serif" }}>
        Frame: {frame}
      </h1>
    </AbsoluteFill>
  );
};
