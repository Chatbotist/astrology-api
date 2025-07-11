import { calculateChart } from 'astrology-engine';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { place_of_birth, latitude, longitude, dob, time = '00:00' } = req.body;

    if (!dob) {
      return res.status(400).json({ error: 'Date of birth (dob) is required' });
    }

    const result = await calculateChart({
      date: dob,
      time,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      place: place_of_birth || undefined
    });

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
}
