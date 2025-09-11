const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3001;

// Your GitHub webhook secret (set this in GitHub and as environment variable)
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-secret-key-here';

// Path to your deployment script
const DEPLOY_SCRIPT = process.env.DEPLOY_SCRIPT || '/home/u574849695/ksaunibliss/deploy/webhook-deploy.sh';

// Middleware to parse JSON
app.use(express.json());

// Function to verify GitHub webhook signature
function verifySignature(payload, signature) {
    const computedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');
    
    const expectedSignature = `sha256=${computedSignature}`;
    
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        message: 'Webhook server is running',
        timestamp: new Date().toISOString()
    });
});

// Main webhook endpoint
app.post('/webhook', (req, res) => {
    const signature = req.headers['x-hub-signature-256'];
    const payload = JSON.stringify(req.body);
    
    console.log(`🔍 Webhook received at ${new Date().toISOString()}`);
    
    // Verify signature if secret is set
    if (WEBHOOK_SECRET !== 'your-secret-key-here' && signature) {
        if (!verifySignature(payload, signature)) {
            console.log('❌ Invalid signature');
            return res.status(401).json({ error: 'Invalid signature' });
        }
        console.log('✅ Signature verified');
    }
    
    const event = req.headers['x-github-event'];
    const body = req.body;
    
    console.log(`📨 Event type: ${event}`);
    
    // Only deploy on push events to main branch
    if (event === 'push' && body.ref === 'refs/heads/main') {
        console.log('🚀 Push to main branch detected, starting deployment...');
        
        // Respond immediately to GitHub
        res.status(200).json({ 
            message: 'Deployment started',
            commit: body.head_commit?.id?.substring(0, 7) || 'unknown',
            timestamp: new Date().toISOString()
        });
        
        // Execute deployment script asynchronously
        exec(`chmod +x ${DEPLOY_SCRIPT} && ${DEPLOY_SCRIPT}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Deployment failed: ${error.message}`);
                console.error(`stderr: ${stderr}`);
                return;
            }
            
            console.log(`✅ Deployment completed successfully`);
            console.log(`stdout: ${stdout}`);
            
            // Optional: Send notification to Slack/Discord/etc
            // sendNotification('✅ Deployment successful!');
        });
        
    } else {
        console.log(`ℹ️  Ignoring event: ${event} on ${body.ref || 'unknown ref'}`);
        res.status(200).json({ 
            message: 'Event ignored',
            reason: `Not a push to main branch (event: ${event}, ref: ${body.ref})`
        });
    }
});

// Ping endpoint for GitHub webhook testing
app.post('/ping', (req, res) => {
    console.log('🏓 Ping received from GitHub');
    res.status(200).json({ message: 'Pong! Webhook server is ready.' });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎣 Webhook server listening on port ${PORT}`);
    console.log(`📍 Webhook URL: http://your-server-ip:${PORT}/webhook`);
    console.log(`🏥 Health check: http://your-server-ip:${PORT}/health`);
    console.log(`🔧 Deploy script: ${DEPLOY_SCRIPT}`);
    console.log(`🔐 Webhook secret: ${WEBHOOK_SECRET === 'your-secret-key-here' ? '⚠️  Not set' : '✅ Configured'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down webhook server gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 SIGINT received, shutting down webhook server gracefully');
    process.exit(0);
});
