import { formatResponse } from '../utils/textFormatting';

// Use the environment variable for the API base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const getMistralResponse = async (message, onNewResponse) => {
  try {
    // Ensure there's no trailing slash in the base URL
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/api/mistral-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(5);
          if (data === '[DONE]') return;
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.choices && parsed.choices[0].delta.content) {
              onNewResponse(formatResponse(parsed.choices[0].delta.content));
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in getMistralResponse:', error);
    throw error;
  }
};