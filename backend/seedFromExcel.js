const XLSX = require('xlsx');
const { sequelize } = require('./src/config/database');
const { Creator } = require('./src/models');

function parseCreatorData(rawData) {
  const creators = [];
  
  // Skip header rows and process actual creator data
  for (let i = 3; i < rawData.length; i++) {
    const row = rawData[i];
    
    // Skip empty rows or section headers
    if (!row.__EMPTY || row.__EMPTY.includes('TALENT LIST') || row.__EMPTY.includes('SEPTEMBER')) {
      continue;
    }
    
    // Extract creator name and handle
    const creatorName = row.__EMPTY;
    if (!creatorName || creatorName.trim() === '') continue;
    
    // Parse name (remove handles and clean up)
    let fullName = creatorName.split('(@')[0].trim();
    if (fullName.includes('\n')) {
      fullName = fullName.split('\n')[0].trim();
    }
    
    // Extract social media data
    const facebookHandle = row.__EMPTY_13 || '';
    const facebookSize = parseNumber(row.__EMPTY_14);
    const tiktokHandle = row.__EMPTY_15 || '';
    const tiktokSize = parseNumber(row.__EMPTY_16);
    const youtubeHandle = row.__EMPTY_17 || '';
    const youtubeSize = parseNumber(row.__EMPTY_18);
    const instagramHandle = row.__EMPTY_19 || '';
    const instagramSize = parseNumber(row.__EMPTY_20);
    
    // Calculate total audience size
    const audienceSize = Math.max(facebookSize, tiktokSize, youtubeSize, instagramSize) || 0;
    
    // Generate engagement rate (simulate realistic rates)
    const engagementRate = audienceSize > 1000000 ? 
      (Math.random() * 3 + 2) : // 2-5% for large accounts
      (Math.random() * 5 + 3); // 3-8% for smaller accounts

    // Generate demographics for META filter (simulate realistic demographics)
    const generateDemographics = (location, audienceSize) => {
      // Base demographics influenced by location and audience size
      const isUsBased = location && location.toLowerCase().includes('us');
      const isLargeAccount = audienceSize > 100000;
      
      return {
        young_adult_percentage: Math.round(Math.random() * 40 + 20), // 20-60%
        us_followers_percentage: isUsBased ? 
          Math.round(Math.random() * 30 + 50) : // 50-80% for US creators
          Math.round(Math.random() * 20 + 10),   // 10-30% for others
        age_brackets: {
          '18-24': Math.round(Math.random() * 20 + 20), // 20-40%
          '25-34': Math.round(Math.random() * 30 + 25), // 25-55%
          '35-44': Math.round(Math.random() * 20 + 15), // 15-35%
          '45+': Math.round(Math.random() * 15 + 5)     // 5-20%
        },
        countries: {
          'US': isUsBased ? Math.round(Math.random() * 30 + 50) : Math.round(Math.random() * 20 + 10),
          'Canada': Math.round(Math.random() * 10 + 5),
          'UK': Math.round(Math.random() * 10 + 5),
          'Other': Math.round(Math.random() * 20 + 20)
        }
      };
    };
    
    // Extract other fields
    const niche = row.__EMPTY_1 || '';
    const contact = row.__EMPTY_5 || '';
    const status = row['PRE-VETTING '] || '';
    const vertical = row.__EMPTY_11 || '';
    const location = row.__EMPTY_12 || '';
    const platform = row['CREATOR LIST'] || '';
    
    // Determine primary content type from niche/vertical
    const primaryContentType = determinePrimaryContentType(niche, vertical);
    
    // Create creator object
    const creator = {
      full_name: fullName,
      email: extractEmail(contact),
      phone: null, // Not provided in Excel
      social_handles: {
        facebook: facebookHandle,
        tiktok: tiktokHandle,
        youtube: youtubeHandle,
        instagram: instagramHandle
      },
      instagram: instagramHandle.startsWith('@') ? instagramHandle.substring(1) : instagramHandle,
      tiktok: tiktokHandle.startsWith('@') ? tiktokHandle.substring(1) : tiktokHandle,
      youtube: youtubeHandle.startsWith('@') ? youtubeHandle.substring(1) : youtubeHandle,
      twitter: null, // Not provided in Excel
      primary_content_type: primaryContentType,
      audience_size: audienceSize,
      engagement_rate: Math.round(engagementRate * 10) / 10, // Round to 1 decimal
      contact_date: new Date(),
      source_of_contact: 'Excel Import',
      potential_projects: extractProjects(niche),
      notes: `${niche}. Platform focus: ${platform}. Location: ${location}`,
      tags: generateTags(niche, vertical, platform),
      verified: status.toLowerCase().includes('pass'),
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Only add if we have a valid name and some social media presence
    if (creator.full_name && creator.audience_size > 0) {
      creators.push(creator);
    }
  }
  
  return creators;
}

function parseNumber(value) {
  if (!value) return 0;
  
  // Handle string numbers with k/m suffixes
  if (typeof value === 'string') {
    const cleanValue = value.toLowerCase().replace(/[^\d.km]/g, '');
    
    if (cleanValue.includes('k')) {
      return Math.round(parseFloat(cleanValue.replace('k', '')) * 1000);
    } else if (cleanValue.includes('m')) {
      return Math.round(parseFloat(cleanValue.replace('m', '')) * 1000000);
    } else {
      return Math.round(parseFloat(cleanValue) || 0);
    }
  }
  
  return Math.round(value || 0);
}

function extractEmail(contact) {
  if (!contact) return null;
  const emailMatch = contact.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return emailMatch ? emailMatch[0] : null;
}

function determinePrimaryContentType(niche, vertical) {
  const text = `${niche} ${vertical}`.toLowerCase();
  
  if (text.includes('music') || text.includes('bass') || text.includes('song')) return 'Music';
  if (text.includes('humor') || text.includes('comedy') || text.includes('funny')) return 'Comedy & Humor';
  if (text.includes('beauty') || text.includes('makeup') || text.includes('skincare')) return 'Beauty & Lifestyle';
  if (text.includes('fitness') || text.includes('workout') || text.includes('health')) return 'Fitness & Health';
  if (text.includes('food') || text.includes('cooking') || text.includes('recipe')) return 'Food & Cooking';
  if (text.includes('tech') || text.includes('gaming') || text.includes('game')) return 'Technology & Gaming';
  if (text.includes('fashion') || text.includes('style')) return 'Fashion & Style';
  if (text.includes('travel') || text.includes('adventure')) return 'Travel & Adventure';
  if (text.includes('content') || text.includes('trend') || text.includes('cultural')) return 'General Content';
  
  return 'Entertainment';
}

function extractProjects(niche) {
  const projects = [];
  
  if (niche.toLowerCase().includes('music')) projects.push('music collaboration', 'brand soundtrack');
  if (niche.toLowerCase().includes('content')) projects.push('content partnership', 'brand campaign');
  if (niche.toLowerCase().includes('trend')) projects.push('trend analysis', 'viral content');
  
  return projects.length > 0 ? projects : ['brand partnership', 'content collaboration'];
}

function generateTags(niche, vertical, platform) {
  const tags = [];
  
  // Add platform tags
  if (platform.toLowerCase().includes('tt')) tags.push('tiktok');
  if (platform.toLowerCase().includes('yt')) tags.push('youtube');
  if (platform.toLowerCase().includes('fb')) tags.push('facebook');
  if (platform.toLowerCase().includes('ig')) tags.push('instagram');
  
  // Add content tags
  const text = `${niche} ${vertical}`.toLowerCase();
  if (text.includes('music')) tags.push('music');
  if (text.includes('humor')) tags.push('comedy');
  if (text.includes('trend')) tags.push('trending');
  if (text.includes('cultural')) tags.push('culture');
  if (text.includes('content')) tags.push('content-creator');
  
  return [...new Set(tags)]; // Remove duplicates
}

async function seedFromExcel() {
  try {
    console.log('Reading Excel file...');
    const excelPath = '../INTERNAL Facebook for Creators _ Master Creator List.xlsx';
    const workbook = XLSX.readFile(excelPath);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(firstSheet);
    
    console.log('Parsing creator data...');
    const creators = parseCreatorData(rawData);
    
    console.log(`Parsed ${creators.length} creators from Excel file`);
    
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established.');

    console.log('Syncing database...');
    await sequelize.sync();
    
    console.log('Clearing existing creators...');
    await Creator.destroy({ where: {} });
    
    console.log('Creating creators from Excel data...');
    const createdCreators = await Creator.bulkCreate(creators);
    
    console.log(`Successfully created ${createdCreators.length} creators!`);
    
    // Show some sample data
    console.log('\\nSample creators:');
    createdCreators.slice(0, 3).forEach(creator => {
      console.log(`- ${creator.full_name}: ${creator.primary_content_type}, ${creator.audience_size} followers`);
    });
    
    console.log('\\nDatabase seeded successfully from Excel file.');
    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedFromExcel();
}

module.exports = { seedFromExcel };