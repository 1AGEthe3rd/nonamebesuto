import test from 'node:test';
import assert from 'node:assert/strict';
import { enteredFromHQ1, gymArrival, hq1Doorway, returnToHQ1, trainingGymSpawn } from '../venue-entry.mjs';

const linkFromStreet = '?from=hq1&venue=hq1-nnb-gym';

test('street arrivals start just inside the gym and exit to the existing storefront', () => {
  assert.ok(enteredFromHQ1(linkFromStreet));
  const arrival = gymArrival(linkFromStreet);
  assert.ok(arrival.z > trainingGymSpawn.z);
  assert.ok(Math.hypot(arrival.x-hq1Doorway.x, arrival.y-hq1Doorway.y, arrival.z-hq1Doorway.z) < hq1Doorway.range);
  assert.equal(returnToHQ1(linkFromStreet), 'https://1age.space/hq1/?return=hq1-nnb-gym');
});

test('direct and unrecognized arrivals keep the existing gym spawn and default HQ1 exit', () => {
  for (const search of ['', '?preview=1', '?from=hq1', '?from=hq1&venue=hq1-alberta-workroom', '?from=https://elsewhere.test&venue=hq1-nnb-gym']) {
    assert.deepEqual(gymArrival(search), trainingGymSpawn);
    assert.equal(returnToHQ1(search), 'https://1age.space/hq1/');
  }
});
