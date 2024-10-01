import axios from 'axios';
import { URL } from 'url';

export default async function handler(req, res) {
  const { imageUrl } = req.query;

  // Validate the imageUrl query parameter
  if (!imageUrl || typeof imageUrl !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing imageUrl query parameter' });
  }

  // Validate the URL
  let parsedUrl;
  try {
    parsedUrl = new URL(imageUrl);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // Only allow http and https protocols
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return res.status(403).json({ error: 'Invalid protocol' });
  }

  try {
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'arraybuffer',
      timeout: 5000, // Reduced timeout to 5 seconds
      maxContentLength: 10 * 1024 * 1024, // Reduced max content length to 10MB
      // ... rest of the axios config
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
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch image' });
  }
}
