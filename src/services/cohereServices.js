import { COHERE_API_KEY } from '../utils/config';

export const getCohereResponse = async (message, onNewResponse) => {
  try {
    const response = await fetch('https://api.cohere.com/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${COHERE_API_KEY}`,
      },
      body: JSON.stringify({
        message: message,
        model: 'command-r-plus',
        stream: true,
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      buffer += chunk;

      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (line.trim() === '') continue;

        try {
          const data = JSON.parse(line);

          if (data.event_type === 'text-generation') {
            onNewResponse(data.text);
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export default getCohereResponse;