const db = require('./db');

async function seed() {
  try {
    // Check if user exists
    let res = await db.query("SELECT id FROM users WHERE email='wanderlust@example.com'");
    let userId;
    if (res.rows.length === 0) {
      const uRes = await db.query(`
        INSERT INTO users (first_name, last_name, email, password_hash)
        VALUES ('Wander', 'Lust', 'wanderlust@example.com', 'dummy')
        RETURNING id
      `);
      userId = uRes.rows[0].id;
    } else {
      userId = res.rows[0].id;
    }

    // Insert public trips
    await db.query(`
      INSERT INTO trips (user_id, title, description, budget_range, is_public, status)
      VALUES ($1, '7 days in Vietnam', 'An amazing journey through Hanoi and Ho Chi Minh.', 700, true, 'completed')
    `, [userId]);
    
    await db.query(`
      INSERT INTO trips (user_id, title, description, budget_range, is_public, status)
      VALUES ($1, 'Solo female travel: Kyoto', 'Exploring temples and culture.', 1200, true, 'completed')
    `, [userId]);

    await db.query(`
      INSERT INTO trips (user_id, title, description, budget_range, is_public, status)
      VALUES ($1, 'Family road trip · Pacific coast', 'Renting an RV along the ocean.', 2500, true, 'completed')
    `, [userId]);

    console.log("Dummy data seeded!");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seed();
