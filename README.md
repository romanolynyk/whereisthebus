# M20 Bus Tracker

A simple, modern web application that shows the next 3 northbound M104 bus times at 41st Street & 8th Avenue in New York City.

## Features

- 🚌 Real-time bus tracking for M20 route
- 📍 Specific location: 41st Street & 8th Avenue (Northbound)

## Getting Started

### Local Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run the Application:**
   ```bash
   npm start
   ```
   - Open `http://localhost:3000` in your web browser
   - The app will automatically fetch real bus data using environment variables

### Production Deployment (Render)

1. **Automatic Deployment:**
   - Connect your GitHub repository to Render
   - Render will automatically deploy using the `render.yaml` configuration
   - Preview environments will be created for each pull request

2. **Environment Variables:**
   - Set `MTA_API_KEY` in your Render dashboard with your actual API key
   - Other environment variables are configured in `render.yaml`
   - The API key is NOT stored in code for security

### Production Deployment (Render)

1. **Set Environment Variables in Render Dashboard:**
   - `MTA_API_KEY`: Your MTA API key
   - `STOP_ID`: `401041` (41st Street & 8th Avenue)
   - `ROUTE_ID`: `M104`
   - `DIRECTION`: `N`
   - `REFRESH_INTERVAL`: `30000`

2. **Deploy:**
   - Connect your GitHub repository to Render
   - Render will automatically deploy on push to main branch

### Demo Mode (No Setup Required)
If you don't have an API key, the app will display mock bus data for demonstration purposes.

## File Structure

```
whereisthebus/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript for bus tracking logic
├── server.js           # Express server for production deployment
├── package.json        # Node.js dependencies and scripts
├── render.yaml         # Render deployment configuration
├── config.sample.js    # Sample configuration file (for reference)
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Technical Details

### API Endpoints Used
- **MTA Bus Time API:** `https://bustime.mta.info/api/siri/stop-monitoring.json`
- **Stop ID:** `401041` (41st Street & 8th Avenue)
- **Route:** `M104`
- **Direction:** `N` (Northbound)

### Features Implemented
- Real-time bus arrival predictions
- Auto-refresh functionality
- Error handling and fallback data
- Responsive design for all devices
- Loading states and user feedback

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Customization

### Changing the Bus Route
To track a different bus route, update these values in `script.js`:
```javascript
this.routeId = 'M104';        // Change to your desired route
this.stopId = '401041';       // Change to your desired stop ID
this.direction = 'N';         // 'N' for Northbound, 'S' for Southbound
```

### Styling
The app uses CSS custom properties and modern design patterns. You can customize colors, fonts, and layout by editing `styles.css`.

## Troubleshooting

### Common Issues

1. **"Unable to fetch bus times" error:**
   - Check your internet connection
   - Verify your API key is correct
   - Ensure the MTA API is accessible

2. **No buses showing:**
   - The bus might not be running at this time
   - Check if there are service changes
   - Verify the stop ID is correct

3. **CORS errors:**
   - The MTA API may have CORS restrictions
   - Consider using a backend proxy service
   - Use the mock data for development

## Future Enhancements

- [ ] Add multiple bus routes
- [ ] Show bus capacity/occupancy
- [ ] Add notifications for approaching buses
- [ ] Include service alerts and delays
- [ ] Add favorite stops functionality
- [ ] Implement offline support

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues and enhancement requests!

---

## Security Note

**Important:** Never commit your actual API key to a public repository. The `config.js` file with your real API key is automatically ignored by git. Always use the sample configuration file as a template.

## Demo Mode

This application currently uses mock data for demonstration. For production use with real bus data, you'll need to obtain an MTA API key and configure the application using the setup instructions above. 
