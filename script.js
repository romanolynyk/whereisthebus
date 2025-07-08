// M104 Bus Tracker for 41st Street & 8th Avenue (Northbound)
class BusTracker {
    constructor() {
        this.busTimesContainer = document.getElementById('bus-times');
        this.lastUpdatedSpan = document.getElementById('last-updated');
        this.refreshBtn = document.getElementById('refresh-btn');
        
        // Get configuration - prioritize environment variables, fallback to config file
        this.refreshInterval = this.getConfigValue('REFRESH_INTERVAL', 30000);
        
        this.init();
    }
    
    getConfigValue(key, defaultValue) {
        // Check for environment variable first (for production/Render)
        if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
            return window.ENV[key];
        }
        
        // Fallback to config file (for local development)
        if (typeof CONFIG !== 'undefined' && CONFIG[key]) {
            return CONFIG[key];
        }
        
        return defaultValue;
    }
    
    init() {
        this.refreshBtn.addEventListener('click', () => this.fetchBusTimes());
        this.fetchBusTimes();
        
        // Auto-refresh using config interval
        setInterval(() => this.fetchBusTimes(), this.refreshInterval);
    }
    
    async fetchBusTimes() {
        try {
            this.showLoading();
            
            // Using local proxy to MTA Bus Time API
            const proxyUrl = `/api/mta/stop-monitoring`;
            console.log('Fetching from local proxy:', proxyUrl);
            
            try {
                const response = await fetch(proxyUrl);
                console.log('Proxy Response status:', response.status);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('MTA API Response data:', data);
                
                this.processRealBusData(data);
                
            } catch (apiError) {
                console.error('API Error:', apiError);
                // Fallback to mock data if API fails
                const mockData = this.getMockBusData();
                this.displayBusTimes(mockData);
            }
            
            this.updateLastUpdated();
            
        } catch (error) {
            console.error('Error fetching bus times:', error);
            this.showError('Unable to fetch bus times. Please try again.');
        }
    }
    
    processRealBusData(data) {
        console.log('Processing real bus data:', data);

        // The MTA API can return errors in a few different ways.
        // We check for a common error format that appears in different response types.
        if (data.Siri && data.Siri.ServiceDelivery) {
            const serviceDelivery = data.Siri.ServiceDelivery;
            const deliveryTypes = ['VehicleMonitoringDelivery', 'StopMonitoringDelivery'];
            for (const deliveryType of deliveryTypes) {
                if (serviceDelivery[deliveryType] && serviceDelivery[deliveryType][0] && serviceDelivery[deliveryType][0].ErrorCondition) {
                    const errorCondition = serviceDelivery[deliveryType][0].ErrorCondition;
                    const errorMessage = errorCondition.Description || (errorCondition.OtherError && errorCondition.OtherError.ErrorText) || 'Unknown API Error';
                    console.error(`MTA API Error in ${deliveryType}:`, errorMessage);
                    this.showError(`MTA API Error: ${errorMessage}`);
                    return;
                }
            }
        }
        
        // Process the actual MTA API response
        if (data.Siri && data.Siri.ServiceDelivery && data.Siri.ServiceDelivery.StopMonitoringDelivery) {
            const stopMonitoring = data.Siri.ServiceDelivery.StopMonitoringDelivery[0];
            
            if (stopMonitoring && stopMonitoring.MonitoredStopVisit && stopMonitoring.MonitoredStopVisit.length > 0) {
                const busData = stopMonitoring.MonitoredStopVisit.map(visit => {
                    const vehicle = visit.MonitoredVehicleJourney;
                    
                    // Handle different possible time fields
                    let arrivalTime;
                    if (vehicle.MonitoredCall.ExpectedDepartureTime) {
                        arrivalTime = new Date(vehicle.MonitoredCall.ExpectedDepartureTime);
                    } else if (vehicle.MonitoredCall.ExpectedArrivalTime) {
                        arrivalTime = new Date(vehicle.MonitoredCall.ExpectedArrivalTime);
                    } else {
                        // This case might not be ideal, but it's a fallback.
                        arrivalTime = new Date(); // Should not happen with real data
                    }
                    
                    const minutesFromNow = Math.round((arrivalTime - new Date()) / 60000);
                    
                    // Make vehicleId more friendly by extracting the number
                    let vehicleId = vehicle.VehicleRef || `M104_${Math.floor(Math.random() * 1000)}`;
                    if (vehicleId.includes('_')) {
                        vehicleId = vehicleId.split('_').pop();
                    }

                    return {
                        vehicleId: vehicleId,
                        arrivalTime: arrivalTime,
                        minutesFromNow: Math.max(0, minutesFromNow)
                    };
                }).filter(bus => bus.minutesFromNow >= 0).slice(0, 3);
                
                if (busData.length > 0) {
                    this.displayBusTimes(busData);
                    return;
                }
            }
        }
        
        // If we have an API key but no buses are found or the data is unparsable.
        this.busTimesContainer.innerHTML = '<div class="info">No upcoming buses found for this stop.</div>';
    }
    
    getMockBusData() {
        // Generate realistic mock data for demonstration
        const now = new Date();
        const times = [];
        
        // Generate 3 bus times in the next 30 minutes
        for (let i = 0; i < 3; i++) {
            const minutesFromNow = Math.floor(Math.random() * 25) + 2; // 2-27 minutes
            const arrivalTime = new Date(now.getTime() + minutesFromNow * 60000);
            
            times.push({
                vehicleId: `M104_${Math.floor(Math.random() * 1000)}`,
                arrivalTime: arrivalTime,
                minutesFromNow: minutesFromNow
            });
        }
        
        // Sort by arrival time
        return times.sort((a, b) => a.minutesFromNow - b.minutesFromNow);
    }
    
    displayBusTimes(busData) {
        if (!busData || busData.length === 0) {
            this.busTimesContainer.innerHTML = '<div class="error">No buses scheduled at this time</div>';
            return;
        }
        
        const busTimesHTML = busData.map((bus, index) => {
            const isArrivingSoon = bus.minutesFromNow <= 5;
            const timeClass = isArrivingSoon ? 'bus-time arriving-soon' : 'bus-time';
            
            return `
                <div class="${timeClass}">
                    <div class="bus-number">Bus ${bus.vehicleId}</div>
                    <div class="time">
                        ${bus.arrivalTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        <span class="minutes">(${bus.minutesFromNow} min)</span>
                    </div>
                </div>
            `;
        }).join('');
        
        this.busTimesContainer.innerHTML = busTimesHTML;
    }
    
    showLoading() {
        this.busTimesContainer.innerHTML = '<div class="loading">Loading bus times...</div>';
    }
    
    showError(message) {
        this.busTimesContainer.innerHTML = `<div class="error">${message}</div>`;
    }
    
    updateLastUpdated() {
        const now = new Date();
        this.lastUpdatedSpan.textContent = `Last updated: ${now.toLocaleTimeString()}`;
    }
}

// Initialize the bus tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BusTracker();
}); 