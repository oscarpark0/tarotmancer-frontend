import { formatResponse } from '../utils/textFormatting';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getMistralResponse = async (message, onNewResponse) => {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
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

      // Move the streaming logic into a separate function
      await streamResponse(response, onNewResponse);
      
      return; // Success, exit the function
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error);
      
      if (retries === MAX_RETRIES - 1 || !isRetryableError(error)) {
        throw error; // Rethrow if max retries reached or non-retryable error
      }
      
      retries++;
      await delay(RETRY_DELAY * retries); // Exponential backoff
    }
  }
};

const streamResponse = async (response, onNewResponse) => {
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
};

const isRetryableError = (error) => {
  return error.message.includes('504') || error.message.includes('timeout');
};