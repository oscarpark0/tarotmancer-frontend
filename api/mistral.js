import { createParser } from 'eventsource-parser';

export default async function handler(event, context) {
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

    // Set up streaming response
    return new Response(
      new ReadableStream({
        async start(controller) {
          const parser = createParser((event) => {
            if (event.type === 'event') {
              const data = event.data;
              if (data === '[DONE]') {
                controller.close();
              } else {
                try {
                  const json = JSON.parse(data);
                  const text = json.choices[0]?.delta?.content || '';
                  controller.enqueue(text);
                } catch (e) {
                  console.error('Error parsing streaming data:', e);
                }
              }
            }
          });

          const reader = response.body.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = new TextDecoder().decode(value);
              parser.feed(chunk);
            }
          } finally {
            reader.releaseLock();
          }
        }
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    );
  } catch (error) {
    console.error('Error in handler:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
