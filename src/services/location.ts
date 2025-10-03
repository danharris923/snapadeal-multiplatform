import Geolocation from 'react-native-geolocation-service';
import { Platform, Alert } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export class LocationService {
  private static instance: LocationService;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestLocationPermission(): Promise<boolean> {
    try {
      const permission = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const result = await request(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationResult | null> {
    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) {
      Alert.alert(
        'Location Permission Required',
        'Please enable location services to find deals near you.'
      );
      return null;
    }

    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.error('Location error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  async resolveUserLocation(): Promise<{ lat: number; lng: number; province?: string } | null> {
    const location = await this.getCurrentLocation();
    if (!location) {
      return null;
    }

    // In a real app, you'd use reverse geocoding to get the province/state
    // For now, we'll just return the coordinates
    return {
      lat: location.latitude,
      lng: location.longitude,
      province: 'Unknown', // Would be resolved via geocoding API
    };
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<{ city: string; province: string } | null> {
    try {
      // Using Google Geocoding API (you'll need an API key in production)
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_API_KEY`
      );

      if (!response.ok) {
        // Fallback: use OpenStreetMap Nominatim (free, no API key required)
        const osmResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&countrycodes=ca`
        );

        if (osmResponse.ok) {
          const osmData = await osmResponse.json();
          const address = osmData.address;

          // Verify it's Canada
          if (address.country_code !== 'ca') {
            Alert.alert('Location Error', 'SnapADeal is only available in Canada');
            return null;
          }

          return {
            city: address.city || address.town || address.village || address.municipality || 'Unknown',
            province: address.state || address.province || 'Unknown'
          };
        }

        return null;
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;

        let city = '';
        let province = '';
        let country = '';

        for (const component of addressComponents) {
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            province = component.short_name; // e.g., "ON" for Ontario
          }
          if (component.types.includes('country')) {
            country = component.short_name;
          }
        }

        // Verify it's Canada
        if (country !== 'CA') {
          Alert.alert('Location Error', 'SnapADeal is only available in Canada');
          return null;
        }

        return { city: city || 'Unknown', province: province || 'Unknown' };
      }

      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  async getCityFromLocation(): Promise<string | null> {
    const location = await this.getCurrentLocation();
    if (!location) {
      return null;
    }

    const address = await this.reverseGeocode(location.latitude, location.longitude);
    return address?.city || null;
  }
}