import axios from 'axios';
import { utc_to_jd, houses, calc_ut, SUN, MOON, MERCURY, VENUS, MARS, 
        JUPITER, SATURN, URANUS, NEPTUNE, PLUTO, SE_ASC, SE_GREG_CAL } from 'swisseph';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { place_of_birth, latitude, longitude, dob, time = '00:00' } = req.body;

    if (!dob) {
      return res.status(400).json({ error: 'Date of birth is required' });
    }

    let finalLat = latitude;
    let finalLng = longitude;

    if (place_of_birth && !latitude && !longitude) {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place_of_birth)}`,
        { headers: { 'User-Agent': 'AstrologyAPI/1.0' } }
      );
      if (response.data?.[0]) {
        finalLat = parseFloat(response.data[0].lat);
        finalLng = parseFloat(response.data[0].lon);
      }
    }

    if (!finalLat || !finalLng) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const [day, month, year] = dob.split('/').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    const jd = utc_to_jd(year, month, day, hour, minute, 0, SE_GREG_CAL);
    const julianDay = jd[1];

    const housesResult = houses(julianDay, finalLat, finalLng, 'P');
    const ascendant = housesResult[0][0];

    const planets = {
      'Sun': SUN, 'Moon': MOON, 'Mercury': MERCURY, 'Venus': VENUS,
      'Mars': MARS, 'Jupiter': JUPITER, 'Saturn': SATURN,
      'Uranus': URANUS, 'Neptune': NEPTUNE, 'Pluto': PLUTO
    };

    const planetPositions = {};
    for (const [name, id] of Object.entries(planets)) {
      const pos = calc_ut(julianDay, id);
      planetPositions[name] = {
        longitude: pos[0],
        sign: getZodiacSign(pos[0])
      };
    }

    planetPositions['Ascendant'] = {
      longitude: ascendant,
      sign: getZodiacSign(ascendant)
    };

    const result = {
      coordinates: { latitude: finalLat, longitude: finalLng },
      date: { date_of_birth: dob, time_of_birth: time, julian_day: julianDay },
      planets: planetPositions,
      houses: housesResult[0].map((cuspid, i) => ({
        house: i + 1,
        longitude: cuspid,
        sign: getZodiacSign(cuspid)
      }))
    };

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function getZodiacSign(longitude) {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  return signs[Math.floor(longitude / 30)];
}
