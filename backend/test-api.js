const db = require('./db');

async function test() {
  try {
    const userRes = await db.query('SELECT id FROM users LIMIT 1');
    const userId = userRes.rows[0].id;
    const tripRes = await db.query('SELECT id FROM trips WHERE user_id = $1 LIMIT 1', [userId]);
    const tripId = tripRes.rows[0].id;

    console.log("Trip ID:", tripId, "User ID:", userId);

    let catId = null;
    const catRes = await db.query('SELECT id FROM packing_categories WHERE name ILIKE $1', ['Clothing']);
    if (catRes.rows.length > 0) catId = catRes.rows[0].id;

    const result = await db.query(`
      INSERT INTO packing_items (trip_id, item_name, category_id, created_by_user_id)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [tripId, "Test Item", catId, userId]);
    
    console.log("Insert result:", result.rows[0]);
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    process.exit(0);
  }
}
test();
