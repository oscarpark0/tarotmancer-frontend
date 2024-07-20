import { getToken, getUserId } from '../utils/auth';

export const getMistralResponse = async (message, onNewResponse, onResponseComplete, drawId, userId) => {
  try {
    const token = getToken();
    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/mistral`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: "open-mistral-nemo-2407",
        messages: [{ role: "user", content: message }],
        stream: true,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${errorData.message}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullResponse = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            try {
              await storeMistralResponse(drawId, fullResponse, userId);
              onResponseComplete(fullResponse);
            } catch (error) {
              console.error('Failed to store Mistral response:', error);
              onResponseComplete(fullResponse, error);
            }
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0].delta.content;
            if (content) {
              fullResponse += content;
              onNewResponse(content);
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
    onNewResponse(`Error: ${error.message}`);
    onResponseComplete(null, error);
    throw error;
  }
}

async function storeMistralResponse(drawId, response, userId) {
  if (!userId) {
    userId = getUserId(); // Use getUserId as a fallback
  }
  if (!userId) {
    throw new Error('User ID not provided');
  }

  try {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/store-mistral-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-ID': userId,
      },
      body: JSON.stringify({ drawId, response }),
      credentials: 'include',
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`Failed to store Mistral response: ${errorData.message}`);
    }
  } catch (error) {
    console.error('Error storing Mistral response:', error);
    throw error;
  }
}