export async function handler(event, context) {
  // Check if it's a POST request
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'This endpoint requires a POST request' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  try {
    const { message } = JSON.parse(event.body);

    if (!process.env.MIST_API_KEY) {
      console.error('MIST_API_KEY is not set');
      throw new Error('MIST_API_KEY is not set');
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
      throw new Error(`Mistral API error: ${response.status} ${errorText}`);
    }

    // For streaming responses in a serverless environment, you might need to adjust this part
    const responseBody = await response.text();

    return {
      statusCode: response.status,
      body: responseBody,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    };
  } catch (error) {
    console.error('Error in handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
}
