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
}