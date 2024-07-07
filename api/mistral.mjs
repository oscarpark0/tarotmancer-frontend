import { MistralClient } from '@mistralai/mistralai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;
    const client = new MistralClient(process.env.MISTRAL_API_KEY);

    const chatStream = await client.chatStream({
      model: "open-mixtral-8x22b",
      messages: [{ role: "user", content: message }],
    });

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    for await (const chunk of chatStream) {
      if (chunk.choices[0].delta.content !== undefined) {
        const streamText = chunk.choices[0].delta.content;
        res.write(`data: ${JSON.stringify({ content: streamText })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error in Mistral API handler:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}