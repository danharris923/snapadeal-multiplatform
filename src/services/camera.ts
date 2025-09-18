import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import { Alert, Platform } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export interface ImageResult {
  uri: string;
  type: string;
  name: string;
}

export class CameraService {
  static async requestCameraPermission(): Promise<boolean> {
    try {
      const permission = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;

      const result = await request(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Camera permission error:', error);
      return false;
    }
  }

  static async requestPhotoLibraryPermission(): Promise<boolean> {
    try {
      const permission = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

      const result = await request(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Photo library permission error:', error);
      return false;
    }
  }

  static showImagePicker(): Promise<ImageResult | null> {
    return new Promise((resolve) => {
      Alert.alert(
        'Select Image',
        'Choose an option',
        [
          {
            text: 'Camera',
            onPress: () => this.openCamera(resolve),
          },
          {
            text: 'Photo Library',
            onPress: () => this.openPhotoLibrary(resolve),
          },
          {
            text: 'Cancel',
            onPress: () => resolve(null),
            style: 'cancel',
          },
        ]
      );
    });
  }

  private static async openCamera(callback: (result: ImageResult | null) => void) {
    const hasPermission = await this.requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      callback(null);
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      },
      (response: ImagePickerResponse) => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          callback({
            uri: asset.uri || '',
            type: asset.type || 'image/jpeg',
            name: asset.fileName || 'photo.jpg',
          });
        } else {
          callback(null);
        }
      }
    );
  }

  private static async openPhotoLibrary(callback: (result: ImageResult | null) => void) {
    const hasPermission = await this.requestPhotoLibraryPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Photo library access is required to select photos.');
      callback(null);
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      },
      (response: ImagePickerResponse) => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          callback({
            uri: asset.uri || '',
            type: asset.type || 'image/jpeg',
            name: asset.fileName || 'photo.jpg',
          });
        } else {
          callback(null);
        }
      }
    );
  }
}