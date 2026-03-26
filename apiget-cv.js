import { createClient } from 'redis';

export default async function handler(req, res) {
  // Connect using the credentials you entered in Redis Insight
  const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_ENDPOINT,
      port: 14245
    }
  });

  client.on('error', err => console.log('Redis Client Error', err));

  await client.connect();

  // Fetch the specific key we created in Redis Insight
  const cvData = await client.json.get('candidate:ari');
  
  await client.disconnect();

  // Send the data back to your website
  res.status(200).json(cvData);
}