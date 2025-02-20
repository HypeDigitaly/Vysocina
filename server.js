
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
  console.log('🟡 [Backend] Received request from client');
  console.log('Request body:', req.body);
  
  if (!CLAUDE_API_KEY) {
    console.log('🔴 [Backend] Error: Claude API key not configured');
    res.status(500).json({ error: 'Claude API key not configured' });
    return;
  }
  
  try {
    console.log('🟣 [Backend->Claude] Sending request to Claude API...');
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
    
    console.log('🟢 [Claude->Backend] Starting to receive stream...');
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('🟢 [Claude->Backend] Stream complete');
        break;
      }
      
      const chunk = Buffer.from(value).toString('utf8');
      console.log('🟢 [Claude->Backend] Chunk received:', chunk);
      res.write(`data: ${chunk}\n\n`);
    }
    
    res.end();
  } catch (error) {
    console.error('Error:', error);
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: error.message,
      details: error.response ? await error.response.text() : null
    });
  }
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Proxy server running on port 3000');
});
