const photos = [
  'photo-1450778869180-41d0601e046e', 'photo-1563460716037-460a3ad24ba9',
  'photo-1644675272883-0c4d582528d8', 'photo-1770836037816-4445dbd449fd',
  'photo-1514888286974-6c03e2ca1dba', 'photo-1533738363-b7f9aef128ce',
  'photo-1573865526739-10659fec78a5', 'photo-1574158622682-e40e69881006',
  'photo-1533743983669-94fa5c4338ec', 'photo-1543852786-1cf6624b9987',
  'photo-1517849845537-4d257902454a', 'photo-1552053831-71594a27632d',
  'photo-1551717743-49959800b1f6', 'photo-1537151608828-ea2b11777ee8',
  'photo-1583337130417-3346a1be7dee', 'photo-1587300003388-59208cc962cb',
  'photo-1548199973-03cce0bbc87b', 'photo-1770836037289-e00e5f351d11',
];

const imageUrl = (photo, width = 720) => `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=80`;
const indexFor = (key) => {
  const value = String(key ?? 'vetcare');
  const numericSuffix = Number.parseInt(value.slice(-12), 10);
  return numericSuffix || [...value].reduce((sum, character) => sum + character.charCodeAt(0), 0);
};

export function petPhoto(key) {
  return imageUrl(photos[(indexFor(key) - 1 + 12) % 12], 640);
}

export function appointmentPhoto(id) {
  return imageUrl(photos[(indexFor(id) - 1 + photos.length) % photos.length]);
}

export function offeringPhoto(id) {
  const number = Number.parseInt(String(id).slice(-12), 10) || indexFor(id);
  const offset = String(id).startsWith('43000000') ? 24 : 0;
  return imageUrl(photos[(offset + number - 1) % photos.length]);
}

export const workingHoursPhoto = imageUrl('photo-1770836037289-e00e5f351d11', 900);
