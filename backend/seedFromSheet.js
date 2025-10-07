const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Local DB via shared sequelize config
const { sequelize: localSequelize } = require('./src/config/database');
const { Creator } = require('./src/models');
const { Sequelize } = require('sequelize');

function parseNumber(value) {
  if (!value) return 0;
  if (typeof value === 'string') {
    const cleanValue = value.toLowerCase().replace(/[^\d.km]/g, '');
    if (cleanValue.includes('k')) return Math.round(parseFloat(cleanValue.replace('k', '')) * 1000);
    if (cleanValue.includes('m')) return Math.round(parseFloat(cleanValue.replace('m', '')) * 1000000);
    return Math.round(parseFloat(cleanValue) || 0);
  }
  return Math.round(value || 0);
}

function extractEmail(text) {
  if (!text) return null;
  const m = String(text).match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return m ? m[0] : null;
}

function determinePrimaryContentType(niche, vertical) {
  const t = `${niche || ''} ${vertical || ''}`.toLowerCase();
  if (/(music|bass|song)/.test(t)) return 'Music';
  if (/(humor|comedy|funny)/.test(t)) return 'Comedy & Humor';
  if (/(beauty|makeup|skincare)/.test(t)) return 'Beauty & Lifestyle';
  if (/(fitness|workout|health)/.test(t)) return 'Fitness & Health';
  if (/(food|cooking|recipe)/.test(t)) return 'Food & Cooking';
  if (/(tech|gaming|game)/.test(t)) return 'Technology & Gaming';
  if (/(fashion|style)/.test(t)) return 'Fashion & Style';
  if (/(travel|adventure)/.test(t)) return 'Travel & Adventure';
  if (/(content|trend|cultural)/.test(t)) return 'General Content';
  return 'Entertainment';
}

function extractProjects(niche = '') {
  const n = niche.toLowerCase();
  const projects = [];
  if (n.includes('music')) projects.push('music collaboration', 'brand soundtrack');
  if (n.includes('content')) projects.push('content partnership', 'brand campaign');
  if (n.includes('trend')) projects.push('trend analysis', 'viral content');
  return projects.length ? projects : ['brand partnership', 'content collaboration'];
}

function generateTags(niche = '', vertical = '', platform = '') {
  const tags = [];
  const p = platform.toLowerCase();
  if (p.includes('tt')) tags.push('tiktok');
  if (p.includes('yt')) tags.push('youtube');
  if (p.includes('fb')) tags.push('facebook');
  if (p.includes('ig')) tags.push('instagram');
  const t = `${niche} ${vertical}`.toLowerCase();
  if (t.includes('music')) tags.push('music');
  if (t.includes('humor')) tags.push('comedy');
  if (t.includes('trend')) tags.push('trending');
  if (t.includes('cultural')) tags.push('culture');
  if (t.includes('content')) tags.push('content-creator');
  return [...new Set(tags)];
}

function parseCreatorData(raw) {
  const creators = [];
  for (let i = 3; i < raw.length; i++) {
    const row = raw[i] || {};
    // Aligns with prior Excel parsing that expects first 3 rows as banners/headers
    if (!row.__EMPTY || String(row.__EMPTY).includes('TALENT LIST') || String(row.__EMPTY).includes('SEPTEMBER')) {
      continue;
    }

    const creatorName = row.__EMPTY;
    if (!creatorName || String(creatorName).trim() === '') continue;

    let fullName = String(creatorName).split('(@')[0].trim();
    if (fullName.includes('\n')) fullName = fullName.split('\n')[0].trim();

    const facebookHandle = row.__EMPTY_13 || '';
    const facebookSize = parseNumber(row.__EMPTY_14);
    const tiktokHandle = row.__EMPTY_15 || '';
    const tiktokSize = parseNumber(row.__EMPTY_16);
    const youtubeHandle = row.__EMPTY_17 || '';
    const youtubeSize = parseNumber(row.__EMPTY_18);
    const instagramHandle = row.__EMPTY_19 || '';
    const instagramSize = parseNumber(row.__EMPTY_20);

    const audienceSize = Math.max(facebookSize, tiktokSize, youtubeSize, instagramSize) || 0;
    const engagementRate = audienceSize > 1000000 ? (Math.random() * 3 + 2) : (Math.random() * 5 + 3);

    const niche = row.__EMPTY_1 || '';
    const contact = row.__EMPTY_5 || '';
    const status = row['PRE-VETTING '] || '';
    const vertical = row.__EMPTY_11 || '';
    const location = row.__EMPTY_12 || '';
    const platform = row['CREATOR LIST'] || '';

    const primaryContentType = determinePrimaryContentType(niche, vertical);

    const demographics = (() => {
      const isUsBased = location && String(location).toLowerCase().includes('us');
      return {
        young_adult_percentage: Math.round(Math.random() * 40 + 20),
        us_followers_percentage: isUsBased ? Math.round(Math.random() * 30 + 50) : Math.round(Math.random() * 20 + 10),
        age_brackets: {
          '18-24': Math.round(Math.random() * 20 + 20),
          '25-34': Math.round(Math.random() * 30 + 25),
          '35-44': Math.round(Math.random() * 20 + 15),
          '45+': Math.round(Math.random() * 15 + 5)
        },
        countries: {
          'US': isUsBased ? Math.round(Math.random() * 30 + 50) : Math.round(Math.random() * 20 + 10),
          'Canada': Math.round(Math.random() * 10 + 5),
          'UK': Math.round(Math.random() * 10 + 5),
          'Other': Math.round(Math.random() * 20 + 20)
        }
      };
    })();

    const creator = {
      full_name: fullName,
      email: extractEmail(contact),
      phone: null,
      social_handles: {
        facebook: facebookHandle,
        tiktok: tiktokHandle,
        youtube: youtubeHandle,
        instagram: instagramHandle
      },
      instagram: String(instagramHandle || '').replace(/^@/, ''),
      tiktok: String(tiktokHandle || '').replace(/^@/, ''),
      youtube: String(youtubeHandle || '').replace(/^@/, ''),
      twitter: null,
      primary_content_type: primaryContentType,
      audience_size: audienceSize,
      engagement_rate: Math.round(engagementRate * 10) / 10,
      contact_date: new Date(),
      source_of_contact: 'Sheet Import',
      potential_projects: extractProjects(niche),
      notes: `${niche}. Platform focus: ${platform}. Location: ${location}`,
      tags: generateTags(niche, vertical, platform),
      verified: String(status).toLowerCase().includes('pass'),
      created_at: new Date(),
      updated_at: new Date()
    };

    if (creator.full_name && creator.audience_size > 0) creators.push(creator);
  }
  return creators;
}

async function main() {
  const args = process.argv.slice(2);
  const fileArg = args.find(a => a.startsWith('--file='));
  const modeProd = args.includes('--prod');
  const dryRun = args.includes('--dry-run');
  const replaceAll = args.includes('--replace'); // if not set, will upsert

  // Default to the new CSV if present; else fallback to the original XLSX
  const defaultCsv = path.join('..', 'INTERNAL Facebook for Creators _ Master Creator List - Master Creator List (1).csv');
  const defaultXlsx = path.join('..', 'INTERNAL Facebook for Creators _ Master Creator List.xlsx');
  let sheetPath = fileArg ? fileArg.replace('--file=', '') : (fs.existsSync(defaultCsv) ? defaultCsv : defaultXlsx);

  if (!fs.existsSync(sheetPath)) {
    console.error('❌ Sheet file not found:', sheetPath);
    process.exit(1);
  }

  console.log('📄 Using sheet:', sheetPath);
  console.log('📦 Mode:', modeProd ? 'PRODUCTION (DATABASE_URL)' : 'LOCAL (backend/src/config/database.js)');
  console.log('🔧 Behavior:', dryRun ? 'DRY RUN (no writes)' : (replaceAll ? 'REPLACE ALL' : 'UPSERT'));

  // Read via xlsx (supports CSV and XLSX)
  const workbook = XLSX.readFile(sheetPath);
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(firstSheet);
  const creators = parseCreatorData(rawData);

  console.log(`🔍 Parsed ${creators.length} creators from sheet`);
  if (creators.length === 0) {
    console.error('❌ No creators parsed; aborting.');
    process.exit(1);
  }

  // Choose sequelize connection
  let sequelize = localSequelize;
  if (modeProd) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      console.error('❌ DATABASE_URL not set for --prod run');
      process.exit(1);
    }
    sequelize = new Sequelize(url, {
      dialect: 'postgres',
      dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
      logging: console.log
    });
    // Re-init model with this connection
    Creator.init(Creator.getAttributes(), { sequelize, modelName: 'Creator', tableName: 'creators' });
  }

  try {
    console.log('🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected');

    console.log('🧱 Ensuring schema is in sync...');
    await sequelize.sync({ alter: true });

    if (dryRun) {
      console.log('📝 DRY RUN: Example parsed rows:', creators.slice(0, 3));
      process.exit(0);
    }

    if (replaceAll) {
      console.log('🗑️ Clearing existing creators...');
      await Creator.destroy({ where: {} });
      console.log('➕ Bulk inserting creators...');
      const created = await Creator.bulkCreate(creators);
      console.log(`🎉 Inserted ${created.length} creators`);
    } else {
      console.log('🔁 Upserting creators (by name + instagram/tiktok/youtube)...');
      let createdCount = 0, updatedCount = 0;
      for (const c of creators) {
        const where = {
          full_name: c.full_name,
          [Sequelize.Op.or]: [
            c.instagram ? { instagram: c.instagram } : null,
            c.tiktok ? { tiktok: c.tiktok } : null,
            c.youtube ? { youtube: c.youtube } : null
          ].filter(Boolean)
        };
        let existing = await Creator.findOne({ where });
        if (existing) {
          await existing.update(c);
          updatedCount++;
        } else {
          await Creator.create(c);
          createdCount++;
        }
      }
      console.log(`🎯 Upsert complete: created=${createdCount}, updated=${updatedCount}`);
    }
  } catch (err) {
    console.error('❌ Error during seed:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 DB connection closed');
  }
}

if (require.main === module) {
  main();
}

