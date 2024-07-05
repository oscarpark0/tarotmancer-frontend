export const getMistralResponse = async (message, onNewResponse) => {
  try {
    const response = await fetch('/api/mistral', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          const jsonData = JSON.parse(line.slice(6));
          if (jsonData.choices[0].delta.content) {
            onNewResponse(jsonData.choices[0].delta.content);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};


export default getMistralResponse;