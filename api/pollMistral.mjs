import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { requestId } = req.query;

  try {
    const response = await redis.get(`mistral:${requestId}`);
    if (response) {
      res.status(200).json({ status: 'completed', content: response });
    } else {
      res.status(202).json({ status: 'processing' });
    }
  } catch (error) {
    console.error('Error in poll handler:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}