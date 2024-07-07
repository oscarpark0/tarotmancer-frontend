import { formatResponse } from '../utils/textFormatting';

export const getMistralResponse = async (message, onNewResponse) => {
  try {
    const response = await fetch('/api/mistral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const jobId = await response.json();

    const intervalId = setInterval(async () => {
      try {
        const resultResponse = await fetch(`/api/mistral-result?jobId=${jobId.jobId}`);
        if (!resultResponse.ok) throw new Error(`HTTP error! status: ${resultResponse.status}`);

        const result = await resultResponse.json();
        if (result.result) {
          clearInterval(intervalId);
          onNewResponse(formatResponse(result.result));
        }
      } catch (error) {
        console.error('Error in getMistralResponse:', error);
        throw error;
      }
    }, 1000);
  } catch (error) {
    console.error('Error in getMistralResponse:', error);
    throw error;
  }
};