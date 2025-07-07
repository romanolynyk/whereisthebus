const express = require('express');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// MTA API proxy endpoint to handle CORS
app.get('/api/mta/stop-monitoring', async (req, res) => {
    try {
        const { MonitoringRef, LineRef, DirectionRef } = req.query;
        
        // Build MTA API URL
        const mtaUrl = `https://bustime.mta.info/api/siri/stop-monitoring.json?key=${process.env.MTA_API_KEY}&MonitoringRef=${MonitoringRef}&LineRef=${LineRef}&DirectionRef=${DirectionRef}`;
        
        console.log('Fetching from MTA API:', mtaUrl);
        
        const response = await fetch(mtaUrl);
        const data = await response.json();
        
        console.log('MTA API Response:', JSON.stringify(data).substring(0, 500) + '...');
        
        // Send response with CORS headers
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.json(data);
        
    } catch (error) {
        console.error('Error proxying MTA API:', error);
        res.status(500).json({ error: error.message });
    }
});

// Handle CORS preflight requests
app.options('/api/mta/stop-monitoring', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});

// Main route that injects environment variables
app.get('/', (req, res) => {
    try {
        // Read the HTML file
        let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
        
        // Create environment variables object
        const envVars = {
            MTA_API_KEY: process.env.MTA_API_KEY || '',
            STOP_ID: process.env.STOP_ID || '404052',
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
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        stopId: process.env.STOP_ID || '404052'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Stop ID: ${process.env.STOP_ID || '404052'}`);
}); 