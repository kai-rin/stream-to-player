// Canvas dimensions
export const CANVAS = { width: 1920, height: 1080 } as const;

// 8px-based spacing scale
export const SPACE = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
  "4xl": 96,
  "5xl": 128,
} as const;

// Type scale — balanced for readability with reduced UI element sizes
export const TYPE = {
  display: { fontSize: 84, fontWeight: 700 as const },
  h1: { fontSize: 72, fontWeight: 700 as const },
  h2: { fontSize: 72, fontWeight: 600 as const },
  h3: { fontSize: 56, fontWeight: 600 as const },
  body: { fontSize: 48, fontWeight: 400 as const },
  caption: { fontSize: 44, fontWeight: 400 as const },
  small: { fontSize: 32, fontWeight: 400 as const },
} as const;

// Broadcast safe areas
export const SAFE_AREA = {
  action: { x: 96, y: 54 }, // 5%
  title: { x: 192, y: 108 }, // 10%
} as const;

// Element size presets
export const SIZES = {
  browser: { width: 1040, height: 600 },
  player: { width: 620, height: 420 },
  badge: { width: 400, height: 110 },
  iconLg: 120,
  iconMd: 100,
  captionBarHeight: 200,
} as const;

// Rule of thirds intersection points
export const THIRDS = {
  x: [CANVAS.width / 3, (CANVAS.width * 2) / 3] as const, // [640, 1280]
  y: [CANVAS.height / 3, (CANVAS.height * 2) / 3] as const, // [360, 720]
} as const;
