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
    const [status, content, error] = await Promise.all([
      redis.get(`mistral:${requestId}:status`),
      redis.get(`mistral:${requestId}`),
      redis.get(`mistral:${requestId}:error`)
    ]);

    if (status === 'completed') {
      res.status(200).json({ status: 'completed', content });
    } else if (status === 'error') {
      res.status(500).json({ status: 'error', error });
    } else {
      res.status(202).json({ status: 'processing' });
    }
  } catch (error) {
    console.error('Error in poll handler:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}