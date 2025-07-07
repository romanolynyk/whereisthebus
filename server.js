const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// Main route that injects environment variables
app.get('/', (req, res) => {
    try {
        // Read the HTML file
        let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
        
        // Create environment variables object
        const envVars = {
            MTA_API_KEY: process.env.MTA_API_KEY || '',
            STOP_ID: process.env.STOP_ID || '401041',
            ROUTE_ID: process.env.ROUTE_ID || 'M104',
            DIRECTION: process.env.DIRECTION || 'N',
            REFRESH_INTERVAL: process.env.REFRESH_INTERVAL || 30000
        };
        
        // Inject environment variables into the HTML
        const envScript = `<script>window.ENV = ${JSON.stringify(envVars)};</script>`;
        html = html.replace('</head>', `${envScript}\n</head>`);
        
        res.send(html);
    } catch (error) {
        console.error('Error serving index.html:', error);
        res.status(500).send('Error loading application');
    }
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 