import MistralClient from '@mistralai/mistralai';
import fetch from 'node-fetch';

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function upstashRequest(command, args) {
  const response = await fetch(UPSTASH_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([command, ...args]),
  });
  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;
  const jobId = Date.now().toString();

  // Add job to queue
  await upstashRequest('LPUSH', ['mistral_jobs', JSON.stringify({ jobId, message })]);

  res.status(202).json({ jobId, message: 'Job queued successfully' });
}

// Separate worker function to process jobs
async function processJobs() {
  while (true) {
    const job = await upstashRequest('BRPOP', ['mistral_jobs', '0']);
    if (job && job.result && job.result[1]) {
      const { jobId, message } = JSON.parse(job.result[1]);
      const client = new MistralClient(process.env.MISTRAL_API_KEY);

      try {
        const chatStream = await client.chatStream({
          model: "open-mixtral-8x22b",
          messages: [{ role: "user", content: message }],
        });

        let response = '';
        for await (const chunk of chatStream) {
          if (chunk.choices[0].delta.content) {
            response += chunk.choices[0].delta.content;
          }
        }

        // Store the result in Upstash
        await upstashRequest('SET', [`result:${jobId}`, response]);
        await upstashRequest('EXPIRE', [`result:${jobId}`, '3600']);
      } catch (error) {
        console.error('Error processing job:', error);
        await upstashRequest('SET', [`result:${jobId}`, JSON.stringify({ error: 'An error occurred while processing the request' })]);
        await upstashRequest('EXPIRE', [`result:${jobId}`, '3600']);
      }
    }
  }
}

// Start the job processor
processJobs();