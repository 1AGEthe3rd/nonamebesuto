const hq1 = 'https://1age.space/hq1/';
const venueId = 'hq1-nnb-gym';

export function returnToHQ1(search) {
  const params = new URLSearchParams(search);
  const destination = new URL(hq1);
  if (params.get('from') === 'hq1' && params.get('venue') === venueId) {
    destination.searchParams.set('return', venueId);
  }
  return destination.href;
}
