import axios from 'axios';
import { utc_to_jd, houses, calc_ut, SUN, MOON, MERCURY, VENUS, MARS, 
        JUPITER, SATURN, URANUS, NEPTUNE, PLUTO, SE_ASC, SE_GREG_CAL } from 'swisseph';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { dob, time = '00:00', place_of_birth, latitude, longitude } = req.body;

    if (!dob) return res.status(400).json({ error: 'dob is required' });

    // Получаем координаты
    let lat = latitude;
    let lng = longitude;
    
    if (place_of_birth && !lat && !lng) {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place_of_birth)}`,
        { headers: { 'User-Agent': 'AstrologyAPI/1.0' } }
      );
      if (response.data?.[0]) {
        lat = parseFloat(response.data[0].lat);
        lng = parseFloat(response.data[0].lon);
      }
    }

    if (!lat || !lng) return res.status(400).json({ error: 'Invalid coordinates' });

    // Расчет карты
    const [day, month, year] = dob.split('/').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const jd = utc_to_jd(year, month, day, hour, minute, 0, SE_GREG_CAL)[1];
    const housesResult = houses(jd, lat, lng, 'P');
    const ascendant = housesResult[0][0];

    const planets = {
      'Sun': SUN, 'Moon': MOON, 'Mercury': MERCURY, 'Venus': VENUS,
      'Mars': MARS, 'Jupiter': JUPITER, 'Saturn': SATURN,
      'Uranus': URANUS, 'Neptune': NEPTUNE, 'Pluto': PLUTO
    };

    const result = {
      date: dob,
      time,
      coordinates: { latitude: lat, longitude: lng },
      planets: Object.entries(planets).reduce((acc, [name, id]) => {
        const pos = calc_ut(jd, id);
        acc[name] = {
          longitude: pos[0],
          sign: ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][Math.floor(pos[0]/30)]
        };
        return acc;
      }, {}),
      ascendant: {
        longitude: ascendant,
        sign: ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][Math.floor(ascendant/30)]
      }
    };

    return res.status(200).json(result);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Calculation failed' });
  }
}
