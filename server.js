const express = require('express');
const app = express();
const clients = new Set();

app.use(express.json());
app.use(express.static('.')); // Serve static files

// SSE endpoint
app.get('/github-webhook', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    clients.add(res);
    
    req.on('close', () => clients.delete(res));
});

// GitHub webhook endpoint
app.post('/webhook', (req, res) => {
    const event = req.headers['x-github-event'];
    if (event === 'push') {
        const message = req.body.head_commit.message;
        const notification = {
            type: 'push',
            message: message
        };
        
        clients.forEach(client => {
            client.write(`data: ${JSON.stringify(notification)}\n\n`);
        });
    }
    res.sendStatus(200);
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
