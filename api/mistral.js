import { NextResponse } from 'next/server';

export async function GET(req) {
  return new NextResponse('This endpoint requires a POST request', { status: 405 });
}

export async function POST(req) {
  try {
    const { message } = await req.json();

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

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return new NextResponse(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
