export const getMistralResponse = async (message, onNewResponse) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/mistral`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
      credentials: 'include',
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            return;
          }
          try {
            if (data.startsWith('{') && data.endsWith('}')) {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0].delta.content;
              if (content) {
                onNewResponse(content);
              }
            } else {
              onNewResponse(data);
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e);
            onNewResponse(data);
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