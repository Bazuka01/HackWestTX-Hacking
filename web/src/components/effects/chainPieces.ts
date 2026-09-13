export type ChainPiece = {
  left: number; // vw position, 0-100
  top: number; // vh position, 0-100
  size: number; // px
};

const COUNT = 50;

// Deterministic hash so the layout is identical every time the transition
// plays, without calling an impure function (Math.random) during render.
function hash(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// Browsers shorten long decimals in style attributes (92.16903898vw becomes
// 92.169vw), which React reports as a hydration mismatch. Two decimals
// survive unchanged.
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export const CHAIN_PIECES: ChainPiece[] = Array.from({ length: COUNT }, (_, i) => ({
  left: round(hash(i * 1.7 + 1) * 100),
  top: round(hash(i * 3.1 + 2) * 100),
  size: round(20 + hash(i * 5.3 + 3) * 24),
}));
