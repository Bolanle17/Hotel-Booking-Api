const express = require('express');
const router = express.Router();
const axios = require('axios');


let lastRequestTime = Date.now();

router.get('/geocode', async (req, res) => {
  const { address } = req.query;
  if (!address) {
    console.log('Geocode request received without address');
    return res.json({ error: 'Address is required' });
  }

  const currentTime = Date.now();
  const timeDiff = currentTime - lastRequestTime;
  if (timeDiff < 1000) { 
    return res.json({ error: 'Too many requests, please wait a second.' });
  }

  lastRequestTime = currentTime;


  console.log('Geocoding address:', address);

  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        format: 'json',
        q: address,
        limit: 1
      },
      headers: {
        'User-Agent': 'hotelbookings/1.0 (opeyemi6280@gmail.com)'
      }
    }); 

    console.log('Nominatim API response:', response.data);

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      console.log('Returning coordinates:', { lat, lon });
      res.json({ lat, lon });
    } else {
      console.log('Location not found for address:', address);
      res.json({ error: 'Location not found' });
    }
  } catch (error) {
    console.error('Geocoding service error:', error.message);
    res.json({ error: 'Geocoding service error', details: error.message });
  }
});

module.exports = router;