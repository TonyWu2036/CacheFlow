require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors');
// No need for node-fetch in Node.js 18+
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/perplexity', async (req, res) => {
  try {
    if (!process.env.PERPLEXITY_KEY) {
      throw new Error('Missing Perplexity API key');
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_KEY}`,
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));

