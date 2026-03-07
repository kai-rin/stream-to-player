import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { sec } from "./utils/time";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Demo } from "./scenes/Scene3Demo";
import { Scene4Proof } from "./scenes/Scene4Proof";
import { Scene5CTA } from "./scenes/Scene5CTA";

// Transition duration: 15 frames = 0.5s
const T = sec(0.5);

// Scene durations (including overlap frames absorbed by transitions)
// Total = S1 + S2 + S3 + S4 + S5 - (T * 4) = 900
// 135 + 165 + 390 + 165 + 105 - 60 = 900 ✓
const S1 = 135; // ~4.5s
const S2 = 165; // ~5.5s
const S3 = 390; // ~13s
const S4 = 165; // ~5.5s
const S5 = 105; // ~3.5s

export const PromoVideo = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={S1}>
        <Scene1Hook />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T })}
      />

      <TransitionSeries.Sequence durationInFrames={S2}>
        <Scene2Problem />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T })}
      />

      <TransitionSeries.Sequence durationInFrames={S3}>
        <Scene3Demo />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: T })}
      />

      <TransitionSeries.Sequence durationInFrames={S4}>
        <Scene4Proof />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T })}
      />

      <TransitionSeries.Sequence durationInFrames={S5}>
        <Scene5CTA />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
