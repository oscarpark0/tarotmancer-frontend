import MistralClient from '@mistralai/mistralai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  try {
    const client = new MistralClient(process.env.MISTRAL_API_KEY);

    const chatStream = await client.chatStream({
      model: "open-mixtral-8x22b",
      messages: [{ role: "user", content: message }],
    });

    for await (const chunk of chatStream) {
      if (chunk.choices[0].delta.content) {
        res.write(`data: ${JSON.stringify({ content: chunk.choices[0].delta.content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
  } catch (error) {
    console.error('Error in Mistral API handler:', error);
    res.write(`data: ${JSON.stringify({ error: 'An error occurred while processing the request' })}\n\n`);
  } finally {
    res.end();
  }
}