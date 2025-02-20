const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/claude/chat', async (req, res) => {
  try {
    const payload = req.body;
    console.log('📨 Received client request:', payload);

    // Construct the request
    const requestBody = {
      model: payload.model || 'claude-3-sonnet-20241022',
      max_tokens: payload.max_tokens || 4096,
      temperature: payload.temperature || 0,
      system: [{
        type: "text",
        text: payload.systemPrompt || "You are a helpful AI assistant.",
        cache_control: { type: "ephemeral" }
      }],
      messages: [{
        role: "user",
        content: payload.userData || ""
      }]
    };

    console.log('🔄 Prepared Claude API request:', requestBody);

    // Make the API call
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-beta': 'prompt-caching-2024-07-31'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Claude API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude API Error:', errorText);
      throw new Error(`Claude API request failed (${response.status}): ${errorText}`);
    }

    // Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    console.log('📡 Starting stream to client...');

    let chunkCount = 0;
    for await (const chunk of response.body) {
      chunkCount++;
      if (chunk.type === 'content_block_delta') {
        res.write(`event: content_block_delta\n`);
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        
        if (chunkCount % 20 === 0) {
          console.log(`📊 Streamed ${chunkCount} chunks`);
        }
      }
    }

    console.log('✅ Stream completed:', { totalChunks: chunkCount });
    res.end();
  } catch (error) {
    console.error('🚨 Server Error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
}); 