import MistralClient from '@mistralai/mistralai';

export default async function handler(req, res) {
  console.log('Mistral API handler called');

  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    console.log('Parsing request body');
    const { message } = req.body;
    console.log('Received message:', message);

    console.log('Initializing MistralClient');
    const client = new MistralClient(process.env.MISTRAL_API_KEY);

    console.log('Setting response headers');
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    console.log('Initiating chat stream');
    const chatStream = await client.chatStream({
      model: "open-mixtral-8x22b",
      messages: [{ role: "user", content: message }],
    });

    console.log('Processing chat stream');
    for await (const chunk of chatStream) {
      if (chunk.choices[0].delta.content) {
        const content = chunk.choices[0].delta.content;
        console.log('Sending chunk:', content);
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    console.log('Chat stream completed');
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error in Mistral API handler:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}