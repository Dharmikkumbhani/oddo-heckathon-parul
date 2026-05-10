const db = require('./db');

async function seed() {
  try {
    const userRes = await db.query('SELECT id FROM users LIMIT 1');
    if (userRes.rows.length === 0) {
      console.log('No users found. Please sign up first.');
      process.exit(1);
    }
    const userId = userRes.rows[0].id;
    console.log('Using User ID:', userId);

    await db.query(`
      INSERT INTO trips (user_id, title, description, start_date, end_date, cover_image_url, trip_style, budget_range, status)
      VALUES 
      ($1, 'Wonders of Japan', 'Two weeks exploring Tokyo, Kyoto, and Osaka. Neon lights and cherry blossoms.', '2026-04-10', '2026-04-24', null, 'Culture,Food', '3000', 'upcoming'),
      ($1, 'Backpacking Southeast Asia', 'A month-long adventure through Thailand, Vietnam, and Bali.', '2026-08-01', '2026-08-30', null, 'Adventure,Budget', '1500', 'upcoming'),
      ($1, 'Weekend in Paris', 'A quick romantic getaway to the city of lights.', '2025-05-10', '2025-05-13', null, 'Relaxation,Luxury', '2000', 'completed')
    `, [userId]);
    
    console.log('Dummy trips inserted successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding:', err);
    process.exit(1);
  }
}
seed();
