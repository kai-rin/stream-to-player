import { interpolate } from "remotion";

export const trapezoidFade = (
  frame: number,
  fadeIn: number,
  holdStart: number,
  holdEnd: number,
  fadeOut: number,
): number =>
  interpolate(frame, [fadeIn, holdStart, holdEnd, fadeOut], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const exitOpacity = (
  frame: number,
  exitStart: number,
  exitEnd: number,
): number =>
  interpolate(frame, [exitStart, exitEnd], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const SPRING_ENTRANCE = { damping: 12, mass: 0.5, stiffness: 120 };
export const SPRING_SMOOTH = { damping: 200 };
