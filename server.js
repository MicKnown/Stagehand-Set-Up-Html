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
    
    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Monitoring Stagehand-Set-Up-Html repository' })}\n\n`);
    clients.add(res);
    
    req.on('close', () => clients.delete(res));
});

// GitHub webhook endpoint
app.post('/webhook', (req, res) => {
    const event = req.headers['x-github-event'];
    const repo = req.body.repository?.name;
    
    // Only process events from your specific repository
    if (event === 'push' && repo === 'Stagehand-Set-Up-Html') {
        const message = req.body.head_commit.message;
        const author = req.body.head_commit.author.name;
        const notification = {
            type: 'push',
            message: `${author} updated Stagehand-Set-Up-Html: ${message}`,
            timestamp: new Date().toISOString()
        };
        
        clients.forEach(client => {
            client.write(`data: ${JSON.stringify(notification)}\n\n`);
        });
    }
    res.sendStatus(200);
});

app.listen(3000, () => {
    console.log('Monitoring Stagehand-Set-Up-Html repository on port 3000');
});
