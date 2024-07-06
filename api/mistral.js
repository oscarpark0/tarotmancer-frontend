export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'This endpoint requires a POST request' }), { 
      status: 405, 
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { message } = await req.json();

    if (!process.env.MIST_API_KEY) {
      console.error('MIST_API_KEY is not set');
      return new Response(JSON.stringify({ error: 'MIST_API_KEY is not set' }), { 
        status: 500, 
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

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
      return new Response(JSON.stringify({ error: `Mistral API error: ${response.status} ${errorText}` }), { 
        status: response.status, 
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    // Set up streaming response
    const streamResponse = new TransformStream();
    const writer = streamResponse.writable.getWriter();
    const reader = response.body.getReader();

    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }
      } finally {
        writer.close();
      }
    };

    pump();

    return new Response(streamResponse.readable, {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in handler:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
      status: 500, 
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }
}
