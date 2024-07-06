import { MistralClient } from '@mistralai/mistralai';

export default async function handler(req, res) {
  console.log('Mistral API handler called');

  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request received');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    console.log(`Invalid method: ${req.method}`);
    res.status(405).json({ error: 'This endpoint requires a POST request' });
    return;
  }

  try {
    const { message } = req.body;
    console.log('Received message:', message);

    if (!process.env.MISTRAL_API_KEY) {
      console.error('MISTRAL_API_KEY is not set');
      res.status(500).json({ error: 'MISTRAL_API_KEY is not set' });
      return;
    }

    const client = new MistralClient(process.env.MISTRAL_API_KEY);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    console.log('Initiating chat stream');
    const stream = await client.chatStream({
      model: "mistral-tiny",
      messages: [{ role: "user", content: message }],
    });

    for await (const chunk of stream) {
      if (chunk.choices[0].delta.content !== undefined) {
        const streamText = chunk.choices[0].delta.content;
        res.write(`data: ${JSON.stringify({ content: streamText })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
    console.log('Stream completed');
  } catch (error) {
    console.error('Error in handler:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
