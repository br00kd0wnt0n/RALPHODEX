#!/usr/bin/env node

require('dotenv').config();
const socialMediaFetcher = require('./src/utils/socialMediaFetcher');

async function testSocialMediaAPIs() {
  console.log('🧪 Testing Social Media APIs...\n');
  
  // Check environment variables
  console.log('🔑 Environment Variables Check:');
  console.log('RAPIDAPI_KEY:', process.env.RAPIDAPI_KEY ? '✅ Set' : '❌ Missing');
  console.log('YOUTUBE_API_KEY:', process.env.YOUTUBE_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('TWITTER_BEARER_TOKEN:', process.env.TWITTER_BEARER_TOKEN ? '✅ Set' : '❌ Missing');
  console.log('');

  // Test with a sample creator object
  const testCreator = {
    id: 1,
    full_name: 'Test Creator',
    instagram: 'instagram', // Replace with actual Instagram handle
    youtube: 'youtube',     // Replace with actual YouTube handle
    tiktok: 'tiktok',       // Replace with actual TikTok handle
    twitter: 'twitter'       // Replace with actual Twitter handle
  };

  try {
    console.log('📡 Testing social media fetch...');
    const posts = await socialMediaFetcher.fetchCreatorPosts(testCreator);
    
    console.log('✅ Test completed successfully!');
    console.log('📊 Results:');
    console.log('- Total posts found:', posts.length);
    console.log('- Platforms:', [...new Set(posts.map(p => p.platform))]);
    
    if (posts.length > 0) {
      console.log('\n📋 Sample posts:');
      posts.slice(0, 3).forEach((post, index) => {
        console.log(`${index + 1}. ${post.platform.toUpperCase()}: ${post.caption.substring(0, 50)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testSocialMediaAPIs().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});
