module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();

  const PEXELS_KEY = process.env.PEXELS_API_KEY;
  const q = req.query.q || 'business';
  const per_page = Math.min(parseInt(req.query.per_page) || 18, 30);

  if (!PEXELS_KEY) {
    return res.status(200).json({
      photos: [
        {src:{medium:'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?w=400',large:'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg'},alt:'business'},
        {src:{medium:'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?w=400',large:'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg'},alt:'team'},
        {src:{medium:'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?w=400',large:'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg'},alt:'work'},
      ]
    });
  }

  try {
    // Bez locale — szerokie wyniki po angielsku
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${per_page}`;
    const r = await fetch(url, {
      headers: { 'Authorization': PEXELS_KEY }
    });
    const data = await r.json();
    return res.status(200).json({ photos: data.photos || [] });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
};
