import MistralClient from '@mistralai/mistralai';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, requestId } = req.body;

  // Immediately respond to the client
  res.status(202).json({ status: 'processing', requestId });

  // Continue processing in the background
  processMistralRequest(message, requestId).catch(console.error);
}

async function processMistralRequest(message, requestId) {
  try {
    const client = new MistralClient(process.env.MISTRAL_API_KEY);

    const chatStream = await client.chatStream({
      model: "open-mixtral-8x22b",
      messages: [{ role: "user", content: message }],
    });

    let fullResponse = '';
    for await (const chunk of chatStream) {
      if (chunk.choices[0].delta.content) {
        fullResponse += chunk.choices[0].delta.content;
        await redis.set(`mistral:${requestId}`, fullResponse, { ex: 300 }); // Cache for 5 minutes
      }
    }

    await redis.set(`mistral:${requestId}:status`, 'completed', { ex: 300 });
  } catch (error) {
    console.error('Error in Mistral API handler:', error);
    await redis.set(`mistral:${requestId}:status`, 'error', { ex: 300 });
    await redis.set(`mistral:${requestId}:error`, error.message, { ex: 300 });
  }
}