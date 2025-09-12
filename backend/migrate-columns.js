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

async function migrateColumns() {
  try {
    console.log('Connecting to production database...');
    await sequelize.authenticate();
    console.log('Connected successfully!');

    console.log('Adding missing columns if they don\'t exist...');
    
    // Add facebook_followers column
    try {
      await sequelize.query(`
        ALTER TABLE creators 
        ADD COLUMN IF NOT EXISTS facebook_followers INTEGER DEFAULT 0;
      `);
      console.log('✅ Added facebook_followers column');
    } catch (error) {
      console.log('facebook_followers column might already exist:', error.message);
    }

    // Add demographics column
    try {
      await sequelize.query(`
        ALTER TABLE creators 
        ADD COLUMN IF NOT EXISTS demographics JSONB DEFAULT '{"young_adult_percentage": 0, "us_followers_percentage": 0, "age_brackets": {}, "countries": {}}'::jsonb;
      `);
      console.log('✅ Added demographics column');
    } catch (error) {
      console.log('demographics column might already exist:', error.message);
    }

    // Add facebook column if needed
    try {
      await sequelize.query(`
        ALTER TABLE creators 
        ADD COLUMN IF NOT EXISTS facebook VARCHAR(255);
      `);
      console.log('✅ Added facebook column');
    } catch (error) {
      console.log('facebook column might already exist:', error.message);
    }

    console.log('\\n🎉 Database migration completed successfully!');
    console.log('The backend should now be able to start without 500 errors.');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

// Run the migration
migrateColumns();