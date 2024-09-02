import axios from 'axios';

export default async function handler(req, res) {
  try {
    const response = await axios.post('https://stacker.news/api/graphql', {
      query: `
        query RecentItems {
          items(
            limit: 10,
            sort: "NEW"
          ) {
            items {
              id
              title
              url
              createdAt
              user {
                name
              }
              sats
            }
          }
        }
      `
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching from Stacker News:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
}
