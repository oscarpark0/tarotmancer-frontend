import { getToken, getUserId } from '../utils/auth';

export const getMistralResponse = async (message, onNewResponse, onResponseComplete, drawId, userId) => {
  if (!drawId) {
    throw new Error('Draw ID is required');
  }
  try {
    const token = getToken();
    
    // If userId is not provided, try to get it from localStorage
    if (!userId) {
      userId = getUserId();
    }
    
    // If still no userId, check for anonymous user ID
    if (!userId) {
      userId = localStorage.getItem('anonymousUserId');
    }
    
    // As a final fallback, generate a temporary ID for this session
    if (!userId) {
      userId = 'anonymous_' + Date.now();
      console.warn('Using temporary user ID for this session:', userId);
    }
    
    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/mistral`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : undefined,
        'User-ID': userId
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
  if (!drawId) {
    throw new Error('Draw ID not provided');
  }
  
  // If userId is not provided, try to get it from various sources
  if (!userId) {
    // Try to get from auth
    userId = getUserId();
    
    // If still no userId, check for anonymous user ID
    if (!userId) {
      userId = localStorage.getItem('anonymousUserId');
    }
    
    // As a final fallback, generate a temporary ID for this session
    if (!userId) {
      userId = 'anonymous_' + Date.now();
      console.warn('Using temporary user ID for storing response:', userId);
    }
  }

  try {
    // For anonymous users, store the response in localStorage only
    if (userId.startsWith('anonymous_') || userId.startsWith('anon_')) {
      console.log('Storing Mistral response for anonymous user in localStorage');
      // Store in localStorage
      const storedDraws = localStorage.getItem('anonMistralResponses') || '{}';
      let parsedDraws;
      try {
        parsedDraws = JSON.parse(storedDraws);
      } catch (e) {
        parsedDraws = {};
      }
      
      parsedDraws[drawId] = {
        response,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('anonMistralResponses', JSON.stringify(parsedDraws));
      return { success: true };
    }
    
    // For logged-in users, use the API
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
      const errorText = await res.text();
      throw new Error(`Failed to store Mistral response: ${errorText}`);
    }

    const responseText = await res.text();
    const responseData = { message: responseText };
    return responseData;
  } catch (error) {
    console.error('Error storing Mistral response:', error);
    throw error;
  }
}