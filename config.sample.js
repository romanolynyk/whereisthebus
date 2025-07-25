// Sample configuration file for API keys and settings
// Copy this file to config.js and add your actual API key
// Note: In production, these should be stored server-side, not in client-side code
const CONFIG = {
    MTA_API_KEY: '286c5961-d847-400c-90b3-4025ad503624', // Replace with your actual MTA API key
    STOP_ID: '401041', // 41st Street & 8th Avenue
    ROUTE_ID: 'M104',
    DIRECTION: 'N', // Northbound
    REFRESH_INTERVAL: 30000 // 30 seconds
};

// Prevent the config from being modified
Object.freeze(CONFIG); 