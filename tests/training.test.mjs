import assert from 'node:assert/strict';
import test from 'node:test';
import { createRound, createGuestProgress } from '../training.mjs';

test('the original 30-second bag round awards an alternating on-beat combo', () => {
  const round = createRound(1000);
  assert.equal(round.read(1000).remaining, 30000);
  assert.equal(round.strike('left', 1000)?.score, 20);
  assert.equal(round.strike('right', 1100), null, 'rate-limited punches cannot score twice');
  const second = round.strike('right', 1700);
  assert.equal(second?.combo, 2);
  assert.equal(second?.score, 42);
  assert.equal(second?.hits, 2);
  assert.equal(round.strike('left', 31000), null, 'expired rounds cannot score');
  assert.equal(round.read(31000).complete, true);
});

test('in-session guest progression records completed rounds only', () => {
  const progress = createGuestProgress();
  assert.deepEqual(progress.read(), { rounds: 0, bestScore: 0, totalHits: 0 });
  assert.throws(() => progress.record({ complete: false, hits: 9, score: 100 }), /completed/);
  assert.deepEqual(progress.record({ complete: true, hits: 7, score: 100 }),
    { rounds: 1, bestScore: 100, totalHits: 7 });
  assert.deepEqual(progress.record({ complete: true, hits: 3, score: 90 }),
    { rounds: 2, bestScore: 100, totalHits: 10 });
  assert.deepEqual(progress.record({ complete: true, hits: 6, score: 140 }),
    { rounds: 3, bestScore: 140, totalHits: 16 });
  assert.deepEqual(createGuestProgress().read(),
    { rounds: 0, bestScore: 0, totalHits: 0 }, 'separate visits do not share progress');
});

test('guest progression rejects malformed and negative scores', () => {
  const progress = createGuestProgress();
  for (const bad of [null, {}, { complete: true, score: -1, hits: 0 },
    { complete: true, score: 10, hits: -1 }, { complete: true, score: NaN, hits: 3 }]) {
    assert.throws(() => progress.record(bad), /completed/);
  }
});

test('guest return route always stays at HQ1 and never invents an account', async () => {
  const { returnToHQ1 } = await import('../venue-entry.mjs');
  assert.equal(returnToHQ1('?from=hq1&venue=hq1-nnb-gym'),
    'https://1age.space/hq1/?return=hq1-nnb-gym');
  assert.equal(returnToHQ1('?preview=1'), 'https://1age.space/hq1/');
  assert.equal(returnToHQ1('?from=hq1&venue=other&return=hq1-nnb-gym'),
    'https://1age.space/hq1/');
  assert.equal(returnToHQ1('?from=hq1&venue=hq1-nnb-gym&x=999&z=999'),
    'https://1age.space/hq1/?return=hq1-nnb-gym');
});
