import { calculate } from 'astrology-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { dob, lat, lng } = req.body;
    
    if (!dob || !lat || !lng) {
      return res.status(400).json({ error: 'Missing required params' });
    }

    const result = calculate({
      date: new Date(dob),
      latitude: parseFloat(lat),
      longitude: parseFloat(lng)
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Calculation failed',
      details: error.message 
    });
  }
}
