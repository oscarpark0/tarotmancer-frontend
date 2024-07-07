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

  try {
    const client = new MistralClient(process.env.MISTRAL_API_KEY);

    // Start the Mistral API request
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

    res.status(200).json({ status: 'completed', requestId });
  } catch (error) {
    console.error('Error in Mistral API handler:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}