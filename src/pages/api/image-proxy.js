import axios from 'axios';

export default async function handler(req, res) {
  const { imageUrl } = req.query;

  // Validate the imageUrl query parameter
  if (!imageUrl) {
    return res.status(400).json({ error: 'Missing imageUrl query parameter' });
  }

  try {
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'stream',
    });

    // Forward the content type
    res.setHeader('Content-Type', response.headers['content-type']);

    // Stream the image from the external source to the client
    response.data.pipe(res);
  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
}
