import { formatResponse } from '../utils/textFormatting';

export const getMistralResponse = async (message, onNewResponse) => {
  try {
    console.log('Sending request to Mistral API');
    const response = await fetch('/api/mistral', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    console.log('Response received from Mistral API');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const formattedContent = formatResponse(parsed.content);
            console.log('Streaming content:', formattedContent);
            onNewResponse(formattedContent);
          } catch (e) {
            console.warn('Error parsing JSON:', e, 'Raw data:', data);
            onNewResponse(data); // Send the raw data if parsing fails
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in getMistralResponse:', error);
    throw error;
  }
};

export const testMistralConnection = async () => {
  try {
    const response = await fetch('/api/test-mistral');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Mistral API test result:', data);
    return data;
  } catch (error) {
    console.error('Error testing Mistral connection:', error);
    throw error;
  }
};

export default getMistralResponse;