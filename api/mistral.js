export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'This endpoint requires a POST request' });
  }

  try {
    const { message } = req.body;

    if (!process.env.MIST_API_KEY) {
      console.error('MIST_API_KEY is not set');
      return res.status(500).json({ error: 'MIST_API_KEY is not set' });
    }

    // Set up headers for streaming
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MIST_API_KEY}`
      },
      body: JSON.stringify({
        model: "open-mixtral-8x22b",
        messages: [{ role: "user", content: message }],
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mistral API error:', response.status, errorText);
      res.write(`data: ${JSON.stringify({ error: `Mistral API error: ${response.status} ${errorText}` })}\n\n`);
      return res.end();
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        res.write(`data: ${chunk}\n\n`);
      }
    } finally {
      reader.releaseLock();
      res.end();
    }
  } catch (error) {
    console.error('Error in handler:', error);
    res.write(`data: ${JSON.stringify({ error: error.message || 'Internal Server Error' })}\n\n`);
    res.end();
  }
}
