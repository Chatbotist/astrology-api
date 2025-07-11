import axios from 'axios';
import { utc_to_jd, houses, calc_ut, SUN, MOON, MERCURY, VENUS, MARS, 
        JUPITER, SATURN, URANUS, NEPTUNE, PLUTO, SE_ASC, SE_GREG_CAL } from 'swisseph';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.SWISSEPH_EPHE_PATH = path.join(__dirname, '../../ephe');

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { dob, time = '00:00', place_of_birth, latitude, longitude } = req.body;
    
    if (!dob) return res.status(400).json({ error: 'Date of birth (dob) is required' });

    let coords = { lat: latitude, lng: longitude };
    
    if (place_of_birth && !coords.lat && !coords.lng) {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place_of_birth)}`,
        { headers: { 'User-Agent': 'AstrologyAPI/1.0' } }
      );
      if (response.data?.[0]) {
        coords.lat = parseFloat(response.data[0].lat);
        coords.lng = parseFloat(response.data[0].lon);
      }
    }

    if (!coords.lat || !coords.lng) {
      return res.status(400).json({ error: 'Valid coordinates required' });
    }

    const [day, month, year] = dob.split('/').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const jd = utc_to_jd(year, month, day, hour, minute, 0, SE_GREG_CAL)[1];
    const housesResult = houses(jd, coords.lat, coords.lng, 'P');

    const result = {
      date: dob,
      time,
      coordinates: coords,
      ascendant: {
        longitude: housesResult[0][0],
        sign: getZodiacSign(housesResult[0][0])
      },
      planets: {
        Sun: calcPlanet(SUN, jd),
        Moon: calcPlanet(MOON, jd),
        Mercury: calcPlanet(MERCURY, jd),
        Venus: calcPlanet(VENUS, jd),
        Mars: calcPlanet(MARS, jd),
        Jupiter: calcPlanet(JUPITER, jd),
        Saturn: calcPlanet(SATURN, jd),
        Uranus: calcPlanet(URANUS, jd),
        Neptune: calcPlanet(NEPTUNE, jd),
        Pluto: calcPlanet(PLUTO, jd)
      }
    };

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}

function calcPlanet(planetId, jd) {
  const pos = calc_ut(jd, planetId);
  return {
    longitude: pos[0],
    sign: getZodiacSign(pos[0])
  };
}

function getZodiacSign(longitude) {
  const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  return signs[Math.floor(longitude/30)];
}
