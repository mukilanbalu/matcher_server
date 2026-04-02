const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Constants
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const ARTIFACT_DIR = '/Users/mukilanbalu/.gemini/antigravity/brain/10de18e9-e9c7-4f35-8568-71373ed0d3d7';

const IMAGES = {
  'sample-1': {
    profile: 'sample_groom_rajesh_png_1775114982093.png',
    astro: 'sample_horoscope_1_png_1775115022538.png'
  },
  'sample-2': {
    profile: 'sample_bride_priya_png_1775115001964.png',
    astro: 'sample_horoscope_2_png_1775115044403.png'
  }
};

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function uploadAndLink() {
  for (const [userId, paths] of Object.entries(IMAGES)) {
    console.log(`Processing user ${userId}...`);

    // 1. Upload Profile image
    const profileFile = fs.readFileSync(path.join(ARTIFACT_DIR, paths.profile));
    const { data: pUpload, error: pError } = await supabase.storage
      .from('profile_images')
      .upload(`${userId}.png`, profileFile, { upsert: true, contentType: 'image/png' });
    
    if (pError) {
      console.error(`Error uploading profile for ${userId}:`, pError.message);
      continue;
    }

    const { data: { publicUrl: profileUrl } } = supabase.storage
      .from('profile_images')
      .getPublicUrl(`${userId}.png`);

    // 2. Upload Astro image
    const astroFile = fs.readFileSync(path.join(ARTIFACT_DIR, paths.astro));
    const { data: aUpload, error: aError } = await supabase.storage
      .from('astro_images')
      .upload(`${userId}.png`, astroFile, { upsert: true, contentType: 'image/png' });

    if (aError) {
      console.error(`Error uploading astro for ${userId}:`, aError.message);
      continue;
    }

    const { data: { publicUrl: astroUrl } } = supabase.storage
      .from('astro_images')
      .getPublicUrl(`${userId}.png`);

    // 3. Update Database
    const { error: dbError } = await supabase
      .from('profiles')
      .update({
        profile_img: [profileUrl],
        astro: {
          rasi: userId === 'sample-1' ? 'Mishabam' : 'Rishabam',
          lagnam: userId === 'sample-1' ? 'Kanni' : 'Kanni',
          nakshatram: userId === 'sample-1' ? 'Rohini' : 'Nakshatram',
          img: astroUrl
        }
      })
      .eq('id', userId);

    if (dbError) {
      console.error(`Error updating DB for ${userId}:`, dbError.message);
    } else {
      console.log(`Successfully updated user ${userId} with images!`);
    }
  }
}

uploadAndLink();
