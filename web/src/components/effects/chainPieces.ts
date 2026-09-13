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

export const CHAIN_PIECES: ChainPiece[] = Array.from({ length: COUNT }, (_, i) => ({
  left: hash(i * 1.7 + 1) * 100,
  top: hash(i * 3.1 + 2) * 100,
  size: 20 + hash(i * 5.3 + 3) * 24,
}));
