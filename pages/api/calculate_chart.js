import { utc_to_jd, houses, calc_ut, SUN, MOON, SE_GREG_CAL } from 'swisseph';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.SWISSEPH_EPHE_PATH = path.join(__dirname, '../../../ephe');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { dob, lat, lng, time = '00:00' } = req.body;
    
    if (!dob || !lat || !lng) {
      return res.status(400).json({ error: 'Missing dob, lat or lng' });
    }

    const [day, month, year] = dob.split('/').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    
    const jd = utc_to_jd(year, month, day, hour, minute, 0, SE_GREG_CAL)[1];
    const housesResult = houses(jd, parseFloat(lat), parseFloat(lng), 'P');
    const sunPos = calc_ut(jd, SUN);

    res.status(200).json({
      success: true,
      data: {
        ascendant: housesResult[0][0],
        sun: sunPos[0],
        julianDay: jd
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Calculation failed',
      details: error.message 
    });
  }
}
