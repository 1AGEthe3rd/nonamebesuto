const hq1 = 'https://1age.space/hq1/';
const venueId = 'hq1-nnb-gym';

export const trainingGymSpawn = Object.freeze({ x:0, y:1.72, z:10 });
export const hq1Doorway = Object.freeze({ x:0, y:1.4, z:13, range:3.3 });

export function enteredFromHQ1(search) {
  const params = new URLSearchParams(search);
  return params.get('from') === 'hq1' && params.get('venue') === venueId;
}

export function gymArrival(search) {
  return enteredFromHQ1(search) ? { ...trainingGymSpawn, z:12.7 } : { ...trainingGymSpawn };
}

export function returnToHQ1(search) {
  const destination = new URL(hq1);
  if (enteredFromHQ1(search)) {
    destination.searchParams.set('return', venueId);
  }
  return destination.href;
}
