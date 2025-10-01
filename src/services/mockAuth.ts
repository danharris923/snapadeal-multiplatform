import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock authentication service for development/testing
// This provides a working auth system without requiring Supabase setup

interface MockUser {
  id: string;
  email: string;
  created_at: string;
}

interface AuthResponse {
  data?: { user: MockUser; session: any };
  error?: { message: string };
}

class MockAuthService {
  private currentUser: MockUser | null = null;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  async initialize() {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._doInitialize();
    await this.initPromise;
    this.initialized = true;
    return;
  }

  private async _doInitialize() {
    try {
      const storedUser = await AsyncStorage.getItem('mock_user');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
        console.log('Mock auth: Restored user session for', this.currentUser?.email);
      } else {
        console.log('Mock auth: No stored user session');
      }
    } catch (error) {
      console.log('Error loading mock user:', error);
    }
  }

  async signInWithPassword({ email, password }: { email: string; password: string }): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simple validation
    if (!email || !password) {
      return { error: { message: 'Email and password are required' } };
    }

    // Accept any email/password for testing
    // In production, this would validate against a real backend
    const mockUser: MockUser = {
      id: `user_${Date.now()}`,
      email: email,
      created_at: new Date().toISOString(),
    };

    this.currentUser = mockUser;
    await AsyncStorage.setItem('mock_user', JSON.stringify(mockUser));

    return {
      data: {
        user: mockUser,
        session: {
          access_token: 'mock_token_' + Date.now(),
          refresh_token: 'mock_refresh_' + Date.now(),
        },
      },
    };
  }

  async signUp({ email, password }: { email: string; password: string }): Promise<AuthResponse> {
    // For mock, signup works the same as signin
    return this.signInWithPassword({ email, password });
  }

  async signOut(): Promise<{ error?: { message: string } }> {
    this.currentUser = null;
    await AsyncStorage.removeItem('mock_user');
    return {};
  }

  async getSession() {
    await this.initialize(); // Ensure initialization is complete
    if (this.currentUser) {
      return {
        data: {
          session: {
            user: this.currentUser,
            access_token: 'mock_token',
          },
        },
        error: null,
      };
    }
    return { data: { session: null }, error: null };
  }

  async getUser() {
    await this.initialize(); // Ensure initialization is complete
    if (this.currentUser) {
      return {
        data: { user: this.currentUser },
        error: null,
      };
    }
    return {
      data: { user: null },
      error: { message: 'No user logged in', status: 400 },
    };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    // Mock implementation - trigger callback when user logs in/out
    return {
      data: { subscription: { unsubscribe: () => {} } },
    };
  }
}

// Export a mock auth object that mimics Supabase auth API
export const mockAuth = {
  auth: new MockAuthService(),
};

// Initialize on load
mockAuth.auth.initialize();