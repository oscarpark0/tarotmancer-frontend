import { formatResponse } from '../utils/textFormatting';
import { API_BASE_URL } from '../utils/config';

export const getMistralResponse = async (message, onNewResponse) => {
  try {
    const eventSource = new EventSource(`${API_BASE_URL}/api/mistral-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    eventSource.onmessage = (event) => {
      const data = event.data;
      if (data === '[DONE]') {
        eventSource.close();
        return;
      }

      try {
        const parsed = JSON.parse(data);
        if (parsed.choices && parsed.choices[0].delta.content) {
          onNewResponse(formatResponse(parsed.choices[0].delta.content));
        }
      } catch (e) {
        console.error('Error parsing JSON:', e);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  } catch (error) {
    console.error('Error in getMistralResponse:', error);
    throw error;
  }
};