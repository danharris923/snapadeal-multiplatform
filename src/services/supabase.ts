import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://dvmxepugxqrwehycdjou.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2bXhlcHVneHFyd2VoeWNkam91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMDMxODQsImV4cCI6MjA3Mjc3OTE4NH0.lzNoh42R5bzUshnLcR34sluijXTgc2bmtiqVSFiLF_s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});