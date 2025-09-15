const { Sequelize } = require('sequelize');

// Production database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log
});

// Import the Creator model
const Creator = require('./src/models/Creator');

const sampleCreators = [
  // META Qualifying Creators (5)
  {
    full_name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0101',
    instagram: '@sarahlifestyle',
    tiktok: '@sarahj_creator',
    youtube: 'SarahJohnsonVlogs',
    twitter: '@sarahjcreates',
    primary_content_type: 'Lifestyle',
    audience_size: 25000,
    engagement_rate: 4.2,
    facebook_followers: 15000,
    demographics: {
      young_adult_percentage: 45,
      us_followers_percentage: 60,
      age_brackets: {
        '18-24': 25,
        '25-34': 35,
        '35-44': 25,
        '45+': 15
      },
      countries: {
        'US': 60,
        'Canada': 15,
        'UK': 10,
        'Other': 15
      }
    },
    contact_date: '2024-09-01',
    source_of_contact: 'Instagram DM',
    notes: 'Very responsive, interested in beauty brand collaborations',
    tags: ['lifestyle', 'beauty', 'fashion', 'META'],
    verified: true
  },
  {
    full_name: 'Marcus Chen',
    email: 'marcus.chen@email.com',
    phone: '+1-555-0102',
    instagram: '@marcusfitness',
    tiktok: '@marcusfit',
    youtube: 'MarcusFitnessJourney',
    twitter: '@marcuschen_fit',
    primary_content_type: 'Fitness',
    audience_size: 18000,
    engagement_rate: 5.8,
    facebook_followers: 8500,
    demographics: {
      young_adult_percentage: 55,
      us_followers_percentage: 70,
      age_brackets: {
        '18-24': 30,
        '25-34': 40,
        '35-44': 20,
        '45+': 10
      },
      countries: {
        'US': 70,
        'Canada': 12,
        'Australia': 8,
        'Other': 10
      }
    },
    contact_date: '2024-08-15',
    source_of_contact: 'TikTok comment',
    notes: 'Great engagement rates, focuses on home workouts',
    tags: ['fitness', 'wellness', 'health', 'META'],
    verified: true
  },
  {
    full_name: 'Emma Rodriguez',
    email: 'emma.rodriguez@email.com',
    phone: '+1-555-0103',
    instagram: '@emmafoodielife',
    tiktok: '@emmafoods',
    youtube: 'EmmaKitchen',
    twitter: '@emmafoodie',
    primary_content_type: 'Food',
    audience_size: 32000,
    engagement_rate: 6.1,
    facebook_followers: 12000,
    demographics: {
      young_adult_percentage: 40,
      us_followers_percentage: 50,
      age_brackets: {
        '18-24': 20,
        '25-34': 35,
        '35-44': 30,
        '45+': 15
      },
      countries: {
        'US': 50,
        'Mexico': 20,
        'Spain': 15,
        'Other': 15
      }
    },
    contact_date: '2024-08-28',
    source_of_contact: 'Email outreach',
    notes: 'Specializes in healthy recipes and meal prep content',
    tags: ['food', 'cooking', 'healthy living', 'META'],
    verified: true
  },
  {
    full_name: 'Alex Thompson',
    email: 'alex.thompson@email.com',
    phone: '+1-555-0104',
    instagram: '@alextech',
    tiktok: '@alextechreviews',
    youtube: 'AlexTechChannel',
    twitter: '@alexthompsontech',
    primary_content_type: 'Technology',
    audience_size: 45000,
    engagement_rate: 3.7,
    facebook_followers: 22000,
    demographics: {
      young_adult_percentage: 65,
      us_followers_percentage: 80,
      age_brackets: {
        '18-24': 35,
        '25-34': 40,
        '35-44': 20,
        '45+': 5
      },
      countries: {
        'US': 80,
        'Canada': 8,
        'UK': 7,
        'Other': 5
      }
    },
    contact_date: '2024-09-05',
    source_of_contact: 'YouTube collaboration',
    notes: 'Great for tech product reviews and unboxings',
    tags: ['technology', 'reviews', 'gadgets', 'META'],
    verified: true
  },
  {
    full_name: 'Zoe Williams',
    email: 'zoe.williams@email.com',
    phone: '+1-555-0105',
    instagram: '@zoetravels',
    tiktok: '@zoeadventures',
    youtube: 'ZoeWorldWide',
    twitter: '@zoewilliams_travel',
    primary_content_type: 'Travel',
    audience_size: 28000,
    engagement_rate: 4.9,
    facebook_followers: 16000,
    demographics: {
      young_adult_percentage: 50,
      us_followers_percentage: 45,
      age_brackets: {
        '18-24': 25,
        '25-34': 40,
        '35-44': 25,
        '45+': 10
      },
      countries: {
        'US': 45,
        'UK': 20,
        'Australia': 15,
        'Other': 20
      }
    },
    contact_date: '2024-08-20',
    source_of_contact: 'Instagram collaboration',
    notes: 'Focus on budget travel and adventure content',
    tags: ['travel', 'adventure', 'lifestyle', 'META'],
    verified: true
  },
  
  // Regular Creators (3)
  {
    full_name: 'David Park',
    email: 'david.park@email.com',
    phone: '+1-555-0106',
    instagram: '@davidmusic',
    tiktok: '@davidbeats',
    youtube: 'DavidParkMusic',
    twitter: '@davidpark_music',
    primary_content_type: 'Music',
    audience_size: 12000,
    engagement_rate: 3.2,
    facebook_followers: 800,
    demographics: {
      young_adult_percentage: 15,
      us_followers_percentage: 10,
      age_brackets: {
        '18-24': 10,
        '25-34': 20,
        '35-44': 35,
        '45+': 35
      },
      countries: {
        'Korea': 60,
        'Japan': 20,
        'US': 10,
        'Other': 10
      }
    },
    contact_date: '2024-09-10',
    source_of_contact: 'Music platform',
    notes: 'Indie musician with growing following',
    tags: ['music', 'indie', 'korean'],
    verified: false
  },
  {
    full_name: 'Lisa Brown',
    email: 'lisa.brown@email.com',
    phone: '+1-555-0107',
    instagram: '@lisaart',
    tiktok: '@lisacreates',
    youtube: 'LisaArtStudio',
    twitter: '@lisabrown_art',
    primary_content_type: 'Art',
    audience_size: 8500,
    engagement_rate: 2.8,
    facebook_followers: 500,
    demographics: {
      young_adult_percentage: 12,
      us_followers_percentage: 15,
      age_brackets: {
        '18-24': 8,
        '25-34': 15,
        '35-44': 40,
        '45+': 37
      },
      countries: {
        'US': 15,
        'Canada': 10,
        'Europe': 50,
        'Other': 25
      }
    },
    contact_date: '2024-08-12',
    source_of_contact: 'Art exhibition',
    notes: 'Traditional artist exploring digital content',
    tags: ['art', 'traditional', 'painting'],
    verified: false
  },
  {
    full_name: 'Ryan Miller',
    email: 'ryan.miller@email.com',
    phone: '+1-555-0108',
    instagram: '@ryangaming',
    tiktok: '@ryanplays',
    youtube: 'RyanGamerTV',
    twitter: '@ryanmiller_game',
    primary_content_type: 'Gaming',
    audience_size: 15000,
    engagement_rate: 4.1,
    facebook_followers: 300,
    demographics: {
      young_adult_percentage: 18,
      us_followers_percentage: 8,
      age_brackets: {
        '13-17': 40,
        '18-24': 30,
        '25-34': 20,
        '35+': 10
      },
      countries: {
        'Global': 60,
        'US': 8,
        'Europe': 20,
        'Asia': 12
      }
    },
    contact_date: '2024-09-03',
    source_of_contact: 'Gaming platform',
    notes: 'Focus on indie games and retro content',
    tags: ['gaming', 'indie games', 'retro'],
    verified: false
  }
];

async function seedProduction() {
  try {
    console.log('Connecting to production database...');
    await sequelize.authenticate();
    console.log('Connected successfully!');

    // Initialize the Creator model
    Creator.init(Creator.getAttributes(), {
      sequelize,
      modelName: 'Creator',
      tableName: 'creators'
    });

    console.log('Syncing database schema...');
    await sequelize.sync({ alter: true });

    console.log('Checking existing creators...');
    const existingCount = await Creator.count();
    console.log(`Found ${existingCount} existing creators`);

    if (existingCount === 0) {
      console.log('Seeding creators...');
      await Creator.bulkCreate(sampleCreators);
      console.log(`✅ Successfully seeded ${sampleCreators.length} creators to production!`);
    } else {
      console.log('Database already has creators. Skipping seed.');
    }

    const finalCount = await Creator.count();
    console.log(`Total creators in database: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Error seeding production database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

// Run the seeder
seedProduction();