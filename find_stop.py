#!/usr/bin/env python3
import urllib.request
import urllib.parse
import json
import os

def find_m104_stops():
    """Find M104 stops to get the correct stop ID"""
    
    # Get API key from environment variable
    api_key = os.getenv('MTA_API_KEY')
    if not api_key:
        print("Error: MTA_API_KEY environment variable not set")
        return
    
    # First, let's try to get all M104 stops
    url = "https://bustime.mta.info/api/siri/vehicle-monitoring.json"
    params = {
        'key': api_key,
        'LineRef': 'M104'
    }
    
    try:
        req = urllib.request.Request(f"{url}?{urllib.parse.urlencode(params)}")
        req.add_header('User-Agent', 'MTA-Bus-Tracker/1.0')
        
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read())
            print("M104 Vehicle Monitoring Response:")
            print(json.dumps(data, indent=2)[:1000])
            
            # Look for stop information in the vehicle data
            if 'Siri' in data and 'ServiceDelivery' in data['Siri']:
                vehicle_delivery = data['Siri']['ServiceDelivery'].get('VehicleMonitoringDelivery', [])
                if vehicle_delivery:
                    vehicles = vehicle_delivery[0].get('VehicleActivity', [])
                    for vehicle in vehicles:
                        journey = vehicle.get('MonitoredVehicleJourney', {})
                        print(f"Vehicle: {journey.get('PublishedLineName')} - {journey.get('DestinationName')}")
                        print(f"Origin: {journey.get('OriginRef')}")
                        print(f"Location: {journey.get('VehicleLocation', {})}")
                        print("---")
            
    except Exception as e:
        print(f"Error getting vehicle monitoring: {e}")

def test_stop_ids():
    """Test different stop ID formats"""
    
    # Get API key from environment variable
    api_key = os.getenv('MTA_API_KEY')
    if not api_key:
        print("Error: MTA_API_KEY environment variable not set")
        return None
    
    stop_ids_to_test = [
        '401041',
        'MTA NYCT_401041', 
        'MTA_401041',
        'MTABC_401041',
        '401041_401041',
        'MTA NYCT_401041_401041',
        '405374',  # From the vehicle monitoring response
        'MTA_405374',
        '404052'   # The correct stop ID
    ]
    
    for stop_id in stop_ids_to_test:
        print(f"\nTesting stop ID: {stop_id}")
        
        url = "https://bustime.mta.info/api/siri/stop-monitoring.json"
        params = {
            'key': api_key,
            'MonitoringRef': stop_id,
            'LineRef': 'M104',
            'DirectionRef': 'N'
        }
        
        try:
            req = urllib.request.Request(f"{url}?{urllib.parse.urlencode(params)}")
            req.add_header('User-Agent', 'MTA-Bus-Tracker/1.0')
            
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read())
                
                # Check if there's an error
                if 'Siri' in data and 'ServiceDelivery' in data['Siri']:
                    service_delivery = data['Siri']['ServiceDelivery']
                    if 'StopMonitoringDelivery' in service_delivery:
                        stop_delivery = service_delivery['StopMonitoringDelivery'][0]
                        if 'ErrorCondition' in stop_delivery:
                            print(f"❌ Error with {stop_id}: {stop_delivery['ErrorCondition']}")
                        else:
                            print(f"✅ SUCCESS with {stop_id}")
                            print(f"Response: {json.dumps(data, indent=2)[:500]}")
                            return stop_id
                    else:
                        print(f"❌ No StopMonitoringDelivery with {stop_id}")
                else:
                    print(f"❌ Unexpected response format with {stop_id}")
                    print(f"Response: {json.dumps(data, indent=2)[:200]}")
                    
        except Exception as e:
            print(f"❌ Error with {stop_id}: {e}")
    
    return None

if __name__ == "__main__":
    print("Finding M104 stops...")
    find_m104_stops()
    
    print("\n" + "="*50)
    print("Testing different stop ID formats...")
    correct_stop_id = test_stop_ids()
    
    if correct_stop_id:
        print(f"\n🎉 Found correct stop ID: {correct_stop_id}")
    else:
        print("\n❌ Could not find correct stop ID") 