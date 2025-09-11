const { sequelize } = require('./src/config/database');
const { Creator } = require('./src/models');

const sampleCreators = [
  {
    full_name: "Sarah Chen",
    email: "sarah.chen@email.com",
    phone: "+1-555-0123",
    social_handles: {
      instagram: "@sarahchenbeauty",
      tiktok: "@beautybysarah",
      youtube: "SarahChenMakeup"
    },
    instagram: "@sarahchenbeauty",
    tiktok: "@beautybysarah",
    youtube: "SarahChenMakeup",
    twitter: "@sarahchen_mua",
    primary_content_type: "Beauty & Lifestyle",
    audience_size: 850000,
    engagement_rate: 4.2,
    contact_date: new Date('2024-01-15'),
    source_of_contact: "Instagram DM",
    potential_projects: ["skincare campaign", "makeup tutorial series", "brand partnership"],
    notes: "Specializes in clean beauty content. Strong engagement with Gen Z audience.",
    tags: ["beauty", "skincare", "lifestyle", "gen-z"],
    verified: true
  },
  {
    full_name: "Marcus Johnson",
    email: "marcus@fitnessmarcus.com",
    phone: "+1-555-0456",
    social_handles: {
      instagram: "@fitnessmarcus",
      youtube: "MarcusJohnsonFit",
      tiktok: "@marcusgetfit"
    },
    instagram: "@fitnessmarcus",
    tiktok: "@marcusgetfit",
    youtube: "MarcusJohnsonFit",
    primary_content_type: "Fitness & Health",
    audience_size: 1200000,
    engagement_rate: 5.8,
    contact_date: new Date('2024-02-10'),
    source_of_contact: "Referral",
    potential_projects: ["supplement partnership", "workout program launch", "fitness app collaboration"],
    notes: "Former personal trainer turned content creator. Excellent video production quality.",
    tags: ["fitness", "health", "workout", "nutrition"],
    verified: true
  },
  {
    full_name: "Emma Rodriguez",
    email: "hello@emmacooks.com",
    phone: "+1-555-0789",
    social_handles: {
      instagram: "@emmacooks",
      tiktok: "@emmaskitchen",
      youtube: "EmmaRodriguezCooks"
    },
    instagram: "@emmacooks",
    tiktok: "@emmaskitchen",
    youtube: "EmmaRodriguezCooks",
    twitter: "@emmacooks",
    primary_content_type: "Food & Cooking",
    audience_size: 650000,
    engagement_rate: 6.1,
    contact_date: new Date('2024-01-28'),
    source_of_contact: "Email outreach",
    potential_projects: ["cookbook promotion", "kitchen appliance partnership", "recipe development"],
    notes: "Focus on quick, healthy meals for busy professionals. Strong recipe engagement.",
    tags: ["food", "cooking", "recipes", "healthy-eating"],
    verified: false
  },
  {
    full_name: "Alex Thompson",
    email: "alex@techwithalex.com",
    phone: "+1-555-0321",
    social_handles: {
      instagram: "@techwithalex",
      youtube: "TechWithAlex",
      twitter: "@alextech"
    },
    instagram: "@techwithalex",
    youtube: "TechWithAlex",
    twitter: "@alextech",
    primary_content_type: "Technology",
    audience_size: 950000,
    engagement_rate: 3.9,
    contact_date: new Date('2024-03-05'),
    source_of_contact: "LinkedIn",
    potential_projects: ["product reviews", "tech tutorials", "startup partnerships"],
    notes: "Covers consumer tech, gadgets, and startup ecosystem. High-value audience.",
    tags: ["technology", "gadgets", "startups", "reviews"],
    verified: true
  },
  {
    full_name: "Jessica Park",
    email: "jess@wanderlustjess.com",
    phone: "+1-555-0654",
    social_handles: {
      instagram: "@wanderlustjess",
      tiktok: "@jessicaroams",
      youtube: "JessicaParkTravel"
    },
    instagram: "@wanderlustjess",
    tiktok: "@jessicaroams",
    youtube: "JessicaParkTravel",
    primary_content_type: "Travel & Adventure",
    audience_size: 720000,
    engagement_rate: 5.3,
    contact_date: new Date('2024-02-20'),
    source_of_contact: "Conference meeting",
    potential_projects: ["destination marketing", "travel gear partnerships", "hotel collaborations"],
    notes: "Sustainable travel advocate. Strong female millennial following.",
    tags: ["travel", "adventure", "sustainability", "millennial"],
    verified: true
  },
  {
    full_name: "David Kim",
    email: "david@fashionforward.com",
    phone: "+1-555-0987",
    social_handles: {
      instagram: "@davidkimstyle",
      tiktok: "@davidfashion",
      youtube: "DavidKimFashion"
    },
    instagram: "@davidkimstyle",
    tiktok: "@davidfashion",
    youtube: "DavidKimFashion",
    twitter: "@davidkimstyle",
    primary_content_type: "Fashion & Style",
    audience_size: 580000,
    engagement_rate: 4.7,
    contact_date: new Date('2024-01-12'),
    source_of_contact: "Instagram DM",
    potential_projects: ["fashion week coverage", "brand partnerships", "styling collaborations"],
    notes: "Menswear specialist with growing unisex content. Strong urban demographic.",
    tags: ["fashion", "menswear", "style", "urban"],
    verified: false
  },
  {
    full_name: "Riley Martinez",
    email: "riley@plantparentlife.com",
    phone: "+1-555-0147",
    social_handles: {
      instagram: "@plantparentlife",
      tiktok: "@rileyplants",
      youtube: "PlantParentWithRiley"
    },
    instagram: "@plantparentlife",
    tiktok: "@rileyplants",
    youtube: "PlantParentWithRiley",
    primary_content_type: "Home & Garden",
    audience_size: 380000,
    engagement_rate: 7.2,
    contact_date: new Date('2024-03-15'),
    source_of_contact: "Email outreach",
    potential_projects: ["plant care guides", "gardening tool partnerships", "nursery collaborations"],
    notes: "Plant care expert with extremely engaged community. High conversion rates.",
    tags: ["plants", "gardening", "home-decor", "sustainability"],
    verified: false
  },
  {
    full_name: "Jordan Williams",
    email: "jordan@gamingwithjordan.com",
    phone: "+1-555-0852",
    social_handles: {
      instagram: "@gamingwithjordan",
      tiktok: "@jordangaming",
      youtube: "JordanWilliamsGaming",
      twitch: "jordanwgaming"
    },
    instagram: "@gamingwithjordan",
    tiktok: "@jordangaming",
    youtube: "JordanWilliamsGaming",
    twitter: "@jordanwgaming",
    primary_content_type: "Gaming",
    audience_size: 1500000,
    engagement_rate: 4.5,
    contact_date: new Date('2024-02-28'),
    source_of_contact: "Gaming event",
    potential_projects: ["game reviews", "hardware partnerships", "streaming collaborations"],
    notes: "Multi-platform gaming content creator. Strong Gen Z male audience.",
    tags: ["gaming", "streaming", "reviews", "gen-z"],
    verified: true
  },
  {
    full_name: "Maya Patel",
    email: "maya@mindfulwithmaya.com",
    phone: "+1-555-0369",
    social_handles: {
      instagram: "@mindfulwithmaya",
      youtube: "MayaPatelWellness",
      tiktok: "@mayamindful"
    },
    instagram: "@mindfulwithmaya",
    youtube: "MayaPatelWellness",
    tiktok: "@mayamindful",
    primary_content_type: "Wellness & Mental Health",
    audience_size: 420000,
    engagement_rate: 6.8,
    contact_date: new Date('2024-03-01'),
    source_of_contact: "Podcast guest referral",
    potential_projects: ["meditation app partnership", "wellness retreat promotion", "mental health awareness"],
    notes: "Licensed therapist creating wellness content. Highly trusted by audience.",
    tags: ["wellness", "mental-health", "meditation", "self-care"],
    verified: true
  },
  {
    full_name: "Carlos Santos",
    email: "carlos@carloscreatesco.com",
    phone: "+1-555-0741",
    social_handles: {
      instagram: "@carloscreatesco",
      youtube: "CarlosSantosArt",
      tiktok: "@carlosart"
    },
    instagram: "@carloscreatesco",
    youtube: "CarlosSantosArt",
    tiktok: "@carlosart",
    primary_content_type: "Art & Design",
    audience_size: 290000,
    engagement_rate: 8.1,
    contact_date: new Date('2024-01-20'),
    source_of_contact: "Art gallery event",
    potential_projects: ["art supply partnerships", "design tutorials", "brand illustrations"],
    notes: "Digital artist and illustrator. Extremely high engagement, loyal following.",
    tags: ["art", "design", "illustration", "digital-art"],
    verified: false
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established.');

    console.log('Syncing database...');
    await sequelize.sync();
    
    console.log('Clearing existing creators...');
    await Creator.destroy({ where: {} });
    
    console.log('Creating sample creators...');
    const createdCreators = await Creator.bulkCreate(sampleCreators);
    
    console.log(`Successfully created ${createdCreators.length} creators!`);
    console.log('Database seeded successfully.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleCreators };