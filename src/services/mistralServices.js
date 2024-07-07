import { formatResponse } from '../utils/textFormatting';

export const getMistralResponse = async (message, onNewResponse) => {
  console.log('getMistralResponse called with message:', message);

  try {
    console.log('Sending POST request to /api/mistral');
    const response = await fetch('/api/mistral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    console.log('Response status:', response.status);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    console.log('Starting to read response stream');
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('Stream reading complete');
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      console.log('Received chunk:', chunk);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            console.log('Received [DONE] signal');
            return;
          }
          try {
            const parsed = JSON.parse(data);
            console.log('Parsed data:', parsed);
            onNewResponse(formatResponse(parsed.content));
          } catch (e) {
            console.warn('Error parsing JSON:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in getMistralResponse:', error);
    throw error;
  }
};