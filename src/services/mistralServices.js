import { formatResponse } from '../utils/textFormatting';

export const getMistralResponse = async (message, onNewResponse) => {
  try {
    const response = await fetch('/api/mistral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onNewResponse(formatResponse(fullResponse));
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            fullResponse += parsed.content;
            onNewResponse(formatResponse(fullResponse));
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