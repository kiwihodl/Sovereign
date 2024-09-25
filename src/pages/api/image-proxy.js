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
      responseType: 'arraybuffer',
      timeout: 8000, // Set a timeout to prevent long-running requests
      // limit the size of the response to 100MB
      maxContentLength: 100 * 1024 * 1024,
    });

    // Validate content type
    const contentType = response.headers['content-type'];
    const allowedContentTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedContentTypes.includes(contentType)) {
      return res.status(403).json({ error: 'Invalid content type' });
    }

    // Set security headers
    res.setHeader('Content-Security-Policy', "img-src 'self'; object-src 'none'");
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Set the content type and send the image data
    res.setHeader('Content-Type', contentType);
    res.send(response.data);
  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
}
