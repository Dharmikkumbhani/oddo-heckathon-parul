import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ Successfully connected to PostgreSQL!");
    
    // Optional: run a quick query to show it's working
    const res = await client.query('SELECT NOW() AS current_time');
    console.log("🕒 Database time is:", res.rows[0].current_time);
    
    // Check if tables are there
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log(`📊 Found ${tablesRes.rows.length} tables in the public schema.`);
    if (tablesRes.rows.length > 0) {
      console.log("Your schema.sql ran successfully! Here are some tables:");
      console.log(tablesRes.rows.slice(0, 5).map(t => t.table_name).join(', ') + '...');
    } else {
      console.log("⚠️ No tables found. Did you forget to run schema.sql?");
    }

    client.release();
  } catch (err) {
    console.error("❌ Failed to connect to PostgreSQL.");
    console.error("Error details:", err.message);
    if (err.message.includes("password authentication failed")) {
      console.log("\n👉 Hint: Double-check that you put the correct password in your .env file!");
    }
  } finally {
    pool.end();
  }
}

testConnection();
