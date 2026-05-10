const db = require('./db');

async function seed() {
  try {
    // Insert Countries
    const cRes = await db.query(`
      INSERT INTO countries (name, iso_code, currency_code) VALUES 
      ('Japan', 'JP', 'JPY'),
      ('France', 'FR', 'EUR'),
      ('Thailand', 'TH', 'THB')
      ON CONFLICT (iso_code) DO NOTHING
      RETURNING id, name
    `);
    
    // We need to fetch countries to get their IDs
    const countries = await db.query('SELECT * FROM countries');
    const getCountryId = (name) => countries.rows.find(c => c.name === name).id;

    // Insert Cities
    const citiesRes = await db.query(`
      INSERT INTO cities (country_id, name, region, description, cost_index, popularity_score, climate_type, image_url) VALUES 
      ($1, 'Tokyo', 'Kanto', 'A bustling metropolis mixing the ultramodern and the traditional.', 85.5, 9.8, 'Temperate', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&q=80'),
      ($1, 'Kyoto', 'Kansai', 'Famous for its numerous classical Buddhist temples, gardens, and imperial palaces.', 80.0, 9.5, 'Temperate', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80'),
      ($2, 'Paris', 'Île-de-France', 'France''s capital, a major European city and global center for art, fashion, gastronomy and culture.', 90.0, 9.9, 'Temperate', 'https://images.unsplash.com/photo-1502602898657-3e9076113837?w=600&q=80'),
      ($3, 'Bangkok', 'Central', 'Large city known for ornate shrines and vibrant street life.', 45.0, 9.2, 'Tropical', 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80')
      RETURNING id, name
    `, [getCountryId('Japan'), getCountryId('France'), getCountryId('Thailand')]);

    const getCityId = (name) => citiesRes.rows.find(c => c.name === name).id;

    // Insert Activity Categories
    await db.query(`
      INSERT INTO activity_categories (name, icon_name) VALUES 
      ('Sightseeing', 'camera'),
      ('Food & Drink', 'utensils'),
      ('Adventure', 'compass')
      ON CONFLICT (name) DO NOTHING
    `);
    const cats = await db.query('SELECT * FROM activity_categories');
    const getCatId = (name) => cats.rows.find(c => c.name === name).id;

    // Insert Activities
    await db.query(`
      INSERT INTO activities (city_id, category_id, name, description, duration_minutes, estimated_cost, rating, image_url) VALUES 
      ($1, $4, 'Senso-ji Temple Visit', 'Visit Tokyo''s oldest Buddhist temple.', 120, 0, 4.8, 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80'),
      ($1, $5, 'Tsukiji Outer Market Food Tour', 'Taste fresh seafood and street food.', 180, 50, 4.7, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80'),
      ($2, $4, 'Fushimi Inari Shrine Hike', 'Hike through thousands of vermilion torii gates.', 240, 0, 4.9, 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=600&q=80'),
      ($3, $4, 'Eiffel Tower Summit', 'Take the elevator to the top of the iconic tower.', 120, 30, 4.8, 'https://images.unsplash.com/photo-1543305809-54b9f6b4f73d?w=600&q=80')
    `, [getCityId('Tokyo'), getCityId('Kyoto'), getCityId('Paris'), getCatId('Sightseeing'), getCatId('Food & Drink')]);

    console.log('Successfully seeded cities and activities!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
seed();
