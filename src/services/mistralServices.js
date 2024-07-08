import { formatResponse } from '../utils/textFormatting';
import { API_BASE_URL } from '../utils/config';

export const getMistralResponse = async (message, onNewResponse) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/mistral`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();
    if (result.result) {
      onNewResponse(formatResponse(result.result));
    }
  } catch (error) {
    console.error('Error in getMistralResponse:', error);
    throw error;
  }
};