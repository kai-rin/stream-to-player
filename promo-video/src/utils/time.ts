export const FPS = 30;
export const DURATION_SECONDS = 30;
export const DURATION_FRAMES = FPS * DURATION_SECONDS;

export const sec = (s: number): number => Math.round(s * FPS);
