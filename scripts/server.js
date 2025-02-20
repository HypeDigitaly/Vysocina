const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
require('dotenv').config();

const app = express();
const server = createServer(app);

// CORS configuration
app.use(cors({
  origin: ['https://hypedigitaly.ai', 'https://hypedigitaly.github.io'],
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Claude API proxy endpoint
app.post('/api/claude/chat', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        messages: req.body.messages,
        model: req.body.model || 'claude-3-sonnet-20240229',
        stream: true
      })
    });

    // Pipe the streaming response back to client
    response.body.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to communicate with Claude API' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 