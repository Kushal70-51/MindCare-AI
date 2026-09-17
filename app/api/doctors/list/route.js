import getDb from '../../../../lib/db';

// Haversine great-circle distance in km — standard formula for
// straight-line distance between two lat/lng points on Earth's surface.
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request) {
  const url = new URL(request.url);
  const patientLat = parseFloat(url.searchParams.get('lat'));
  const patientLng = parseFloat(url.searchParams.get('lng'));
  const hasPatientLocation = Number.isFinite(patientLat) && Number.isFinite(patientLng);

  const db = getDb();
  const doctors = db
    .prepare(
      `SELECT id, full_name, email, specialty, hospital_affiliation, years_experience, city, latitude, longitude
       FROM doctors WHERE verification_status = 'verified' ORDER BY full_name ASC`
    )
    .all();

  const withDistance = doctors.map((d) => {
    const hasDoctorLocation = typeof d.latitude === 'number' && typeof d.longitude === 'number';
    const distance =
      hasPatientLocation && hasDoctorLocation
        ? Math.round(distanceKm(patientLat, patientLng, d.latitude, d.longitude) * 10) / 10
        : null;
    // Don't leak exact coordinates to the client — only the derived distance.
    const { latitude, longitude, ...rest } = d;
    return { ...rest, distanceKm: distance };
  });

  // Doctors with a known distance first (nearest first), then everyone else
  // (no location set, or patient didn't share theirs) in their existing
  // alphabetical order.
  withDistance.sort((a, b) => {
    if (a.distanceKm === null && b.distanceKm === null) return 0;
    if (a.distanceKm === null) return 1;
    if (b.distanceKm === null) return -1;
    return a.distanceKm - b.distanceKm;
  });

  return Response.json({ doctors: withDistance });
}
