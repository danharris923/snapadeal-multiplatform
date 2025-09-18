const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dvmxepugxqrwehycdjou.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2bXhlcHVneHFyd2VoeWNkam91Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzIwMzE4NCwiZXhwIjoyMDcyNzc5MTg0fQ.ty4Hqy_0SHGQW2uSvbPonQZME6yHzM-EDPX_lynqY2M';

async function fixStoragePolicy() {
  console.log('🔧 Fixing Supabase storage policies for uploads...\n');

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });

  try {
    // Create policy to allow public uploads to deal-images bucket
    console.log('Creating storage upload policy...');

    const { error: policyError } = await supabase.rpc('sql', {
      query: `
        -- Drop existing policies if any
        DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
        DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;

        -- Create policy to allow anyone to upload to deal-images bucket
        CREATE POLICY "Allow public uploads" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'deal-images');

        -- Create policy to allow anyone to read from deal-images bucket
        CREATE POLICY "Allow public reads" ON storage.objects
        FOR SELECT USING (bucket_id = 'deal-images');

        -- Enable RLS
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
      `
    });

    if (policyError) {
      console.error('Policy creation error:', policyError);
    } else {
      console.log('✅ Storage policies created successfully!');
    }

    // Test upload permissions
    console.log('\n🧪 Testing upload permissions...');
    const testData = new Blob(['test'], { type: 'text/plain' });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('deal-images')
      .upload('test_upload.txt', testData, {
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
    } else {
      console.log('✅ Upload test successful!');

      // Clean up test file
      await supabase.storage.from('deal-images').remove(['test_upload.txt']);
      console.log('✅ Test file cleaned up');
    }

    console.log('\n🎉 Storage is now ready for user image uploads!');

  } catch (error) {
    console.error('Setup error:', error);
  }
}

fixStoragePolicy();