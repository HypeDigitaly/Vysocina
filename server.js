
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

app.post('/api/claude/chat', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-beta': 'prompt-caching-2024-07-31'
      },
      body: JSON.stringify({
        ...req.body,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed (${response.status})`);
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = response.body.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      res.write(`data: ${Buffer.from(value).toString('utf8')}\n\n`);
    }
    
    res.end();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Proxy server running on port 3000');
});
