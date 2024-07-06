import { formatResponse } from '../utils/textFormatting';

export const getMistralResponse = async (message, onNewResponse) => {
  try {
    const response = await fetch('https://tarotmancer.com/api/mistral', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let jsonBuffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            return; // Stream is complete
          }
          jsonBuffer += data;
          try {
            const parsed = JSON.parse(jsonBuffer);
            jsonBuffer = ''; // Reset JSON buffer
            if (parsed.choices && parsed.choices[0].delta && parsed.choices[0].delta.content) {
              const formattedContent = formatResponse(parsed.choices[0].delta.content);
              onNewResponse(formattedContent);
            }
          } catch (e) {
            // JSON is incomplete, continue buffering
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in getMistralResponse:', error);
    throw error;
  }
};

export default getMistralResponse;