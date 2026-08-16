export const toRadians = (value) => (value * Math.PI) / 180;

export const haversineDistance = (aLat, aLng, bLat, bLng) => {
  const earthRadius = 6371e3;
  const latDiff = toRadians(bLat - aLat);
  const lngDiff = toRadians(bLng - aLng);
  const start =
    Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
    Math.cos(toRadians(aLat)) *
      Math.cos(toRadians(bLat)) *
      Math.sin(lngDiff / 2) *
      Math.sin(lngDiff / 2);
  const c = 2 * Math.atan2(Math.sqrt(start), Math.sqrt(1 - start));
  return earthRadius * c;
};

export const attachDistance = (items, lat, lng) =>
  items.map((item) => ({
    ...(typeof item.toObject === "function" ? item.toObject() : item),
    distance: haversineDistance(lat, lng, item.location.coordinates[1], item.location.coordinates[0])
  }));
