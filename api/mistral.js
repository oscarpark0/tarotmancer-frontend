// Use dynamic imports for both node-fetch and @mistralai/mistralai
let fetch, MistralClient;

Promise.all([
  import('node-fetch').then(module => { fetch = module.default; }),
  import('@mistralai/mistralai').then(module => { MistralClient = module.MistralClient; })
]).then(() => {
  global.fetch = fetch;
});

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'This endpoint requires a POST request' });
    return;
  }

  try {
    // Wait for MistralClient to be available
    while (!MistralClient) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const { message } = req.body;
    console.log('Received message:', message);

    if (!process.env.MISTRAL_API_KEY) {
      console.error('MISTRAL_API_KEY is not set');
      res.status(500).json({ error: 'MISTRAL_API_KEY is not set' });
      return;
    }

    const client = new MistralClient(process.env.MISTRAL_API_KEY);

    console.log('Initiating chat stream');
    const stream = await client.chatStream({
      model: "mistral-tiny",
      messages: [{ role: "user", content: message }],
    });

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
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

// Update the testMistralConnection function similarly
export async function testMistralConnection(req, res) {
  try {
    // Wait for MistralClient to be available
    while (!MistralClient) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const client = new MistralClient(process.env.MISTRAL_API_KEY);
    const models = await client.listModels();
    res.status(200).json({ message: 'Mistral API connection successful', models });
  } catch (error) {
    console.error('Error testing Mistral connection:', error);
    res.status(500).json({ error: 'Failed to connect to Mistral API' });
  }
}