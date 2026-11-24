const ROUND_MS = 30_000;
const BEAT_MS = 700;
const MIN_HIT_GAP = 230;

export function createRound(start) {
  let hits = 0;
  let score = 0;
  let combo = 0;
  let lastSide;
  let lastHit = -Infinity;

  function read(now) {
    const remaining = Math.max(0, ROUND_MS - (now - start));
    return { remaining, hits, combo, score, complete: remaining === 0 };
  }

  return {
    read,
    strike(side, now) {
      if (!['left', 'right'].includes(side) || now < start || read(now).complete || now - lastHit < MIN_HIT_GAP) return null;
      const phase = (now - start) % BEAT_MS;
      const onBeat = Math.min(phase, BEAT_MS - phase) < 145;
      combo = side === lastSide || now - lastHit > 1300 ? 1 : combo + 1;
      lastSide = side;
      lastHit = now;
      hits += 1;
      score += (onBeat ? 20 : 10) + Math.min(8, combo - 1) * 2;
      return { ...read(now), onBeat };
    },
  };
}
