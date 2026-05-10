const db = require('./db');

async function seedPhase4() {
  try {
    console.log("Seeding Phase 4 dummy data...");

    // Get a user
    const userRes = await db.query('SELECT id FROM users LIMIT 1');
    if (userRes.rows.length === 0) {
      console.log("No users found. Please create a user and a trip first.");
      process.exit(1);
    }
    const userId = userRes.rows[0].id;

    // Get a trip
    const tripRes = await db.query('SELECT id FROM trips WHERE user_id = $1 LIMIT 1', [userId]);
    if (tripRes.rows.length === 0) {
      console.log("No trips found for the user. Please create a trip first.");
      process.exit(1);
    }
    const tripId = tripRes.rows[0].id;

    // Get or create packing categories
    let catDocRes = await db.query("SELECT id FROM packing_categories WHERE name = 'Documents'");
    if (catDocRes.rows.length === 0) {
      await db.query("INSERT INTO packing_categories (name, icon_name) VALUES ('Documents', 'FileText'), ('Clothing', 'Shirt'), ('Electronics', 'Smartphone')");
    }
    const catClothesRes = await db.query("SELECT id FROM packing_categories WHERE name = 'Clothing'");
    const catClothesId = catClothesRes.rows.length > 0 ? catClothesRes.rows[0].id : null;
    
    // Add dummy packing items
    await db.query(`
      INSERT INTO packing_items (trip_id, category_id, item_name, is_packed, created_by_user_id)
      VALUES 
      ($1, $2, 'T-shirts (x4)', false, $3),
      ($1, $2, 'Jacket', true, $3),
      ($1, null, 'Passport', false, $3),
      ($1, null, 'Travel Adapter', false, $3)
    `, [tripId, catClothesId, userId]);

    // Add dummy notes
    await db.query(`
      INSERT INTO trip_notes (trip_id, user_id, title, content, note_type)
      VALUES 
      ($1, $2, 'Hotel Confirmation', 'Booking Reference: XYZ987. Check-in at 2 PM.', 'hotel'),
      ($1, $2, 'Train Tickets', 'Train leaves from Station Central at 08:30 AM. Track 4.', 'transport'),
      ($1, $2, 'Restaurant to try', 'We must visit that sushi place near the park!', 'food')
    `, [tripId, userId]);

    console.log("Dummy data added successfully!");
    process.exit(0);
  } catch (e) {
    console.error("Seeding error:", e);
    process.exit(1);
  }
}

seedPhase4();
