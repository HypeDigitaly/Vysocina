const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const claude = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

app.post('/api/claude/chat', async (req, res) => {
  try {
    // Extract the relevant fields from Voiceflow's payload structure
    const payload = req.body;
    
    // Construct the Claude API request
    const stream = await claude.messages.stream({
      model: payload.model || 'claude-3-sonnet-20241022',
      max_tokens: payload.max_tokens || 4096,
      temperature: payload.temperature || 0,
      system: [{
        type: "text",
        text: payload.systemPrompt || "You are a helpful AI assistant.",
        cache_control: {
          type: "ephemeral"
        }
      }],
      messages: [{
        role: "user",
        content: payload.userData || ""
      }],
      stream: true
    });

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Stream the response
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        res.write(`event: content_block_delta\n`);
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
    }

    res.end();
  } catch (error) {
    console.error('Streaming error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
}); 