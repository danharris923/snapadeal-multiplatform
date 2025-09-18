const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dvmxepugxqrwehycdjou.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2bXhlcHVneHFyd2VoeWNkam91Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzIwMzE4NCwiZXhwIjoyMDcyNzc5MTg0fQ.ty4Hqy_0SHGQW2uSvbPonQZME6yHzM-EDPX_lynqY2M';

async function simpleStorageFix() {
  console.log('🔧 Simple storage fix - making bucket fully public...\n');

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Update bucket to be fully public with no restrictions
    console.log('Making deal-images bucket fully public...');

    const { error: updateError } = await supabase.storage.updateBucket('deal-images', {
      public: true,
      allowedMimeTypes: null, // Allow all MIME types
      fileSizeLimit: null,    // No size limit
      allowedMimeTypes: ['image/*'] // Allow all image types
    });

    if (updateError) {
      console.error('Update error:', updateError);
    } else {
      console.log('✅ Bucket updated successfully!');
    }

    // Test with actual image upload
    console.log('\n🧪 Testing image upload...');

    // Create a simple 1x1 pixel PNG
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xC2, 0x8D, 0xB3, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('deal-images')
      .upload('public/test_image.png', pngData, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Image upload test failed:', uploadError);
    } else {
      console.log('✅ Image upload test successful!');
      console.log('Upload data:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('deal-images')
        .getPublicUrl('public/test_image.png');

      console.log('✅ Public URL generated:', publicUrl);

      // Clean up
      await supabase.storage.from('deal-images').remove(['public/test_image.png']);
      console.log('✅ Test file cleaned up');
    }

    console.log('\n🎉 Storage should now work for user uploads!');

  } catch (error) {
    console.error('Error:', error);
  }
}

simpleStorageFix();