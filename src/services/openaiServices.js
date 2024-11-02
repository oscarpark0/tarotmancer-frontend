import OpenAI from 'openai';

export const getOpenAIResponse = async (message, onNewResponse, onResponseComplete, drawId, userId) => {
  if (!drawId) {
    throw new Error('Draw ID is required');
  }

  if (!process.env.REACT_APP_OPENAI_API_KEY) {
    const error = new Error('OpenAI API key is not configured');
    console.error('OpenAI API key missing:', error);
    onNewResponse('Error: Service configuration issue. Please contact support.');
    onResponseComplete(null, error);
    throw error;
  }

  try {
    if (!userId) {
      console.warn('User ID not available, but continuing with request');
    }

    const openai = new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are Tarotmancer - a wise and knowledgeable tarot card interpretation master."
        },
        {
          role: "user",
          content: message
        }
      ],
      stream: true,
    });

    let fullResponse = '';

    try {
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          onNewResponse(content);
        }
      }

      await storeOpenAIResponse(drawId, fullResponse, userId);
      onResponseComplete(fullResponse);
    } catch (error) {
      console.error('Error in stream processing:', error);
      onResponseComplete(fullResponse, error);
    }

  } catch (error) {
    console.error('Error:', error);
    onNewResponse(`Error: ${error.message}`);
    onResponseComplete(null, error);
    throw error;
  }
};

async function storeOpenAIResponse(drawId, response, userId) {
  if (!userId) {
    throw new Error('User ID not provided');
  }
  if (!drawId) {
    throw new Error('Draw ID not provided');
  }

  try {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/store-openai-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-ID': userId,
      },
      body: JSON.stringify({ drawId, response }),
      credentials: 'include',
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to store OpenAI response: ${errorText}`);
    }

    const responseText = await res.text();
    return { message: responseText };
  } catch (error) {
    console.error('Error storing OpenAI response:', error);
    throw error;
  }
}
