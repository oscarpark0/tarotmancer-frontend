import { MistralClient } from '@mistralai/mistralai';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const client = new MistralClient(process.env.MISTRAL_API_KEY);
    const models = await client.listModels();
    res.status(200).json({ message: 'Mistral API connection successful', models });
  } catch (error) {
    console.error('Error testing Mistral connection:', error);
    res.status(500).json({ error: 'Failed to connect to Mistral API' });
  }
}