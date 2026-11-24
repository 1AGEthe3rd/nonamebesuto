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


/**
 * Non-persistent guest progression for the current visit only.
 * No accounts, wallets, weigh-in data, tracking, or browser storage.
 */
export function createGuestProgress() {
  let rounds = 0;
  let bestScore = 0;
  let totalHits = 0;
  const read = () => ({ rounds, bestScore, totalHits });
  return {
    read,
    record(finishedRound) {
      if (!finishedRound?.complete || !Number.isSafeInteger(finishedRound.score) ||
          finishedRound.score < 0 || !Number.isSafeInteger(finishedRound.hits) ||
          finishedRound.hits < 0) {
        throw new TypeError('A valid completed training round is required');
      }
      rounds += 1;
      bestScore = Math.max(bestScore, finishedRound.score);
      totalHits += finishedRound.hits;
      return read();
    },
  };
}
