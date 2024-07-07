import { formatResponse } from '../utils/textFormatting';

const POLL_INTERVAL = 1000; // 1 second
const MAX_POLLS = 60; // Maximum number of polls (60 seconds total)

export const getMistralResponse = async (message, onNewResponse) => {
  try {
    const requestId = Date.now().toString();
    const response = await fetch('/api/mistral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, requestId }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    let polls = 0;
    while (polls < MAX_POLLS) {
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      const pollResponse = await fetch(`/api/pollMistral?requestId=${requestId}`);
      const data = await pollResponse.json();

      if (data.status === 'completed') {
        onNewResponse(formatResponse(data.content));
        return;
      }

      polls++;
    }

    throw new Error('Request timed out after maximum polls');
  } catch (error) {
    console.error('Error in getMistralResponse:', error);
    throw error;
  }
};