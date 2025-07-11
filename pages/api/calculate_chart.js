import axios from 'axios';
import { utc_to_jd, houses, calc_ut, SUN, MOON, MERCURY, VENUS, MARS, 
        JUPITER, SATURN, URANUS, NEPTUNE, PLUTO, SE_ASC, SE_GREG_CAL } from 'swisseph';

export default async function handler(req, res) {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Только POST запросы разрешены' });
  }

  try {
    const { place_of_birth, latitude, longitude, dob, time = '00:00' } = req.body;

    if (!dob) {
      return res.status(400).json({ error: 'Укажите дату рождения (dob)' });
    }

    const [day, month, year] = dob.split('/').map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return res.status(400).json({ error: 'Формат даты: ДД/ММ/ГГГГ' });
    }

    let finalLat = latitude;
    let finalLng = longitude;

    if (place_of_birth && !latitude && !longitude) {
      const coords = await getCoordinates(place_of_birth);
      if (!coords) {
        return res.status(400).json({ error: 'Не удалось найти координаты для места рождения' });
      }
      finalLat = coords.latitude;
      finalLng = coords.longitude;
    }

    if (!finalLat || !finalLng) {
      return res.status(400).json({ error: 'Укажите место рождения или координаты' });
    }

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

    const response = {
      coordinates: { latitude: finalLat, longitude: finalLng },
      date: { date_of_birth: dob, time_of_birth: time, julian_day: julianDay },
      planets: planetPositions,
      houses: housesResult[0].map((cuspid, i) => ({
        house: i + 1,
        longitude: cuspid,
        sign: getZodiacSign(cuspid)
      }))
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Ошибка:', error);
    return res.status(500).json({ error: 'Ошибка сервера', details: error.message });
  }
}

async function getCoordinates(place) {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`,
      { headers: { 'User-Agent': 'AstrologyAPI/1.0' } }
    );
    return response.data?.[0] ? {
      latitude: parseFloat(response.data[0].lat),
      longitude: parseFloat(response.data[0].lon)
    } : null;
  } catch (error) {
    console.error('Ошибка геокодирования:', error);
    return null;
  }
}

function getZodiacSign(longitude) {
  const signs = [
    'Овен', 'Телец', 'Близнецы', 'Рак',
    'Лев', 'Дева', 'Весы', 'Скорпион',
    'Стрелец', 'Козерог', 'Водолей', 'Рыбы'
  ];
  return signs[Math.floor(longitude / 30)];
}
