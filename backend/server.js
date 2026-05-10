const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '../frontend/.env' });

const db = require('./db');

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic endpoint
app.get('/', (req, res) => {
  res.send('Backend API is running!');
});

// SIGNUP Endpoint
app.post('/api/signup', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      city, 
      country,
      bio,
      password,
      styles
    } = req.body;

    const profilePhotoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Check if user exists
    const userExists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    let countryId = null;
    if (country) {
      const countryResult = await db.query('SELECT id FROM countries WHERE name ILIKE $1', [country]);
      if (countryResult.rows.length > 0) {
        countryId = countryResult.rows[0].id;
      }
    }

    // Insert user
    const insertQuery = `
      INSERT INTO users 
      (first_name, last_name, email, phone_number, city, country_id, bio, password_hash, profile_photo_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, first_name, last_name, email
    `;
    const values = [firstName, lastName, email, phoneNumber, city, countryId, bio, passwordHash, profilePhotoUrl];
    
    const result = await db.query(insertQuery, values);
    const newUser = result.rows[0];

    // Store user preferences (styles)
    if (styles) {
      let stylesArray = [];
      try {
        stylesArray = JSON.parse(styles);
      } catch (e) {
        if (typeof styles === 'string') stylesArray = [styles];
      }
      if (stylesArray.length > 0) {
        await db.query(`
          INSERT INTO user_preferences (user_id, preferred_trip_styles)
          VALUES ($1, $2)
        `, [newUser.id, stylesArray]);
      }
    }

    // Generate JWT
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1d' });

    res.status(201).json({ message: 'User created successfully', user: newUser, token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET || 'supersecret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// CREATE TRIP Endpoint
app.post('/api/trips', authenticateToken, upload.single('coverImage'), async (req, res) => {
  try {
    const { title, description, startDate, endDate, tripStyle, budgetRange } = req.body;
    const coverImageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const userId = req.user.id;

    const result = await db.query(`
      INSERT INTO trips (user_id, title, description, start_date, end_date, cover_image_url, trip_style, budget_range, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'upcoming')
      RETURNING *
    `, [userId, title, description, startDate, endDate, coverImageUrl, tripStyle, budgetRange]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET TRIPS Endpoint
app.get('/api/trips', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query('SELECT * FROM trips WHERE user_id = $1 ORDER BY start_date ASC', [userId]);
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const processedTrips = result.rows.map(trip => {
      let dynamicStatus = 'upcoming';
      if (trip.start_date && trip.end_date) {
        const start = new Date(trip.start_date);
        const end = new Date(trip.end_date);
        if (end < today) {
          dynamicStatus = 'completed';
        } else if (start <= today && end >= today) {
          dynamicStatus = 'ongoing';
        }
      }
      return { ...trip, status: dynamicStatus };
    });

    res.json(processedTrips);
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET SINGLE TRIP
app.get('/api/trips/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await db.query(`
      SELECT t.*, u.first_name || ' ' || u.last_name as author_name 
      FROM trips t 
      JOIN users u ON t.user_id = u.id 
      WHERE t.id = $1 AND (t.user_id = $2 OR t.is_public = true)
    `, [id, userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Trip not found or private' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET CITIES Endpoint
app.get('/api/cities', async (req, res) => {
  try {
    const search = req.query.q || '';
    const result = await db.query(
      `SELECT c.*, co.name as country_name 
       FROM cities c 
       JOIN countries co ON c.country_id = co.id 
       WHERE c.name ILIKE $1 OR co.name ILIKE $1
       ORDER BY c.popularity_score DESC`, 
      [`%${search}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET ACTIVITIES Endpoint
app.get('/api/activities', async (req, res) => {
  try {
    const cityId = req.query.cityId;
    let query = `
      SELECT a.*, c.name as category_name, c.icon_name 
      FROM activities a 
      LEFT JOIN activity_categories c ON a.category_id = c.id
    `;
    const params = [];
    if (cityId) {
      query += ` WHERE a.city_id = $1`;
      params.push(cityId);
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET TRIP STOPS
app.get('/api/trips/:tripId/stops', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const result = await db.query(`
      SELECT ts.*, c.name as city_name, c.image_url as city_image, c.country_id 
      FROM trip_stops ts
      JOIN cities c ON ts.city_id = c.id
      WHERE ts.trip_id = $1
      ORDER BY ts.stop_order ASC
    `, [tripId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ADD TRIP STOP
app.post('/api/trips/:tripId/stops', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { cityId, arrivalDate, departureDate } = req.body;
    const orderRes = await db.query('SELECT COALESCE(MAX(stop_order), 0) + 1 as next_order FROM trip_stops WHERE trip_id = $1', [tripId]);
    const stopOrder = orderRes.rows[0].next_order;

    const result = await db.query(`
      INSERT INTO trip_stops (trip_id, city_id, stop_order, arrival_date, departure_date)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [tripId, cityId, stopOrder, arrivalDate, departureDate]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add stop error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE TRIP STOP
app.delete('/api/stops/:stopId', authenticateToken, async (req, res) => {
  try {
    const { stopId } = req.params;
    // We should ideally check if the user owns the trip, but for simplicity assuming token is enough or we rely on foreign keys
    await db.query('DELETE FROM trip_stops WHERE id = $1', [stopId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete stop error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// REORDER TRIP STOPS
app.put('/api/trips/:tripId/stops/reorder', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { stopIds } = req.body; // Array of stop IDs in the new order
    
    // We need to update each stop's order. To prevent unique constraint violations during update,
    // we could either defer constraints or just assign negative/temp values.
    // Easiest is to update them to temporary values, then to final values.
    // Or just rely on PostgreSQL updating them correctly if we use a CASE statement.
    // Let's do individual updates for simplicity, and temporarily set them to negative to avoid conflicts.
    
    // First pass: set to negative index
    for (let i = 0; i < stopIds.length; i++) {
      await db.query('UPDATE trip_stops SET stop_order = $1 WHERE id = $2 AND trip_id = $3', [-(i + 1), stopIds[i], tripId]);
    }
    // Second pass: set to correct positive index
    for (let i = 0; i < stopIds.length; i++) {
      await db.query('UPDATE trip_stops SET stop_order = $1 WHERE id = $2 AND trip_id = $3', [(i + 1), stopIds[i], tripId]);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Reorder stops error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET STOP ACTIVITIES
app.get('/api/trips/:tripId/activities', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const result = await db.query(`
      SELECT tsa.*, a.name, a.image_url, a.estimated_cost as base_cost, a.duration_minutes
      FROM trip_stop_activities tsa
      JOIN activities a ON tsa.activity_id = a.id
      WHERE tsa.trip_id = $1
      ORDER BY tsa.activity_date ASC, tsa.start_time ASC
    `, [tripId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ADD ACTIVITY TO STOP
app.post('/api/stops/:stopId/activities', authenticateToken, async (req, res) => {
  try {
    const { stopId } = req.params;
    const { tripId, activityId, activityDate } = req.body;
    const result = await db.query(`
      INSERT INTO trip_stop_activities (trip_id, trip_stop_id, activity_id, activity_date)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [tripId, stopId, activityId, activityDate]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE ACTIVITY FROM STOP
app.delete('/api/activities/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; // this is trip_stop_activities.id
    await db.query('DELETE FROM trip_stop_activities WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ==========================================
// PHASE 4: PRACTICAL TOOLS (BUDGET, PACKING, NOTES)
// ==========================================

// BUDGET
app.get('/api/trips/:tripId/budget', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const tripRes = await db.query('SELECT title, budget_range FROM trips WHERE id = $1', [tripId]);
    if (tripRes.rows.length === 0) return res.status(404).json({ error: 'Trip not found' });
    
    // Aggregate activities by category
    const actRes = await db.query(`
      SELECT COALESCE(ac.name, 'Activity') as category_name, SUM(a.estimated_cost) as total_cost
      FROM trip_stop_activities tsa
      JOIN activities a ON tsa.activity_id = a.id
      LEFT JOIN activity_categories ac ON a.category_id = ac.id
      WHERE tsa.trip_id = $1
      GROUP BY ac.name
    `, [tripId]);
    
    // Aggregate stop costs as 'Stay'
    const stopRes = await db.query(`
      SELECT SUM(estimated_stop_cost) as total_cost FROM trip_stops WHERE trip_id = $1
    `, [tripId]);

    const categories = actRes.rows;
    if (stopRes.rows[0].total_cost && Number(stopRes.rows[0].total_cost) > 0) {
      categories.push({ category_name: 'Stay', total_cost: stopRes.rows[0].total_cost });
    }
    
    // Aggregate by stop for cost by destination (activities + stops)
    const destRes = await db.query(`
      SELECT c.name as city_name, 
        SUM(COALESCE(a.estimated_cost, 0)) as act_cost,
        MAX(COALESCE(ts.estimated_stop_cost, 0)) as stop_cost
      FROM trip_stops ts
      JOIN cities c ON ts.city_id = c.id
      LEFT JOIN trip_stop_activities tsa ON tsa.trip_stop_id = ts.id
      LEFT JOIN activities a ON tsa.activity_id = a.id
      WHERE ts.trip_id = $1
      GROUP BY ts.id, c.name
    `, [tripId]);

    const destMap = {};
    destRes.rows.forEach(r => {
      destMap[r.city_name] = (destMap[r.city_name] || 0) + Number(r.act_cost) + Number(r.stop_cost);
    });
    const destinations = Object.keys(destMap).map(k => ({ city_name: k, city_cost: destMap[k] }));

    res.json({
      trip_title: tripRes.rows[0].title,
      budget_range: tripRes.rows[0].budget_range,
      categories: categories,
      destinations: destinations
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/trips/:id/budget', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { budgetRange } = req.body;
    const result = await db.query(
      'UPDATE trips SET budget_range = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [budgetRange, id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Trip not found or not owned by user' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PACKING
app.get('/api/trips/:tripId/packing', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const result = await db.query(`
      SELECT pi.*, pc.name as category_name, pc.icon_name
      FROM packing_items pi
      LEFT JOIN packing_categories pc ON pi.category_id = pc.id
      WHERE pi.trip_id = $1
      ORDER BY COALESCE(pc.name, 'Essentials'), pi.item_name
    `, [tripId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/trips/:tripId/packing', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { itemName, categoryName } = req.body;
    
    let catId = null;
    if (categoryName) {
       const catRes = await db.query('SELECT id FROM packing_categories WHERE name ILIKE $1', [categoryName]);
       if (catRes.rows.length > 0) catId = catRes.rows[0].id;
    }

    const result = await db.query(`
      INSERT INTO packing_items (trip_id, item_name, category_id, created_by_user_id)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [tripId, itemName, catId, req.user.id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/packing/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      UPDATE packing_items SET is_packed = NOT is_packed WHERE id = $1 RETURNING *
    `, [id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/packing/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM packing_items WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// NOTES
app.get('/api/trips/:tripId/notes', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const result = await db.query(`
      SELECT n.*, t.title as trip_name
      FROM trip_notes n
      JOIN trips t ON n.trip_id = t.id
      WHERE n.trip_id = $1
      ORDER BY n.created_at DESC
    `, [tripId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/trips/:tripId/notes', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { title, content, noteType } = req.body;
    const result = await db.query(`
      INSERT INTO trip_notes (trip_id, user_id, title, content, note_type)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [tripId, req.user.id, title, content, noteType || 'general']);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM trip_notes WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ==========================================
// PHASE 5: COMMUNITY SHARING & DISCOVERABILITY
// ==========================================

app.get('/api/public/trips', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.*, u.first_name || ' ' || u.last_name as author_name,
      (SELECT COUNT(*) FROM trip_stops WHERE trip_id = t.id) as stop_count,
      (SELECT SUM(a.estimated_cost) FROM trip_stop_activities tsa JOIN activities a ON tsa.activity_id = a.id WHERE tsa.trip_id = t.id) as total_cost
      FROM trips t
      JOIN users u ON t.user_id = u.id
      WHERE t.is_public = true
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.patch('/api/trips/:id/publish', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublic } = req.body;
    const userId = req.user.id;
    
    const result = await db.query(
      'UPDATE trips SET is_public = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [isPublic, id, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Trip not found or not owned by user' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/trips/:id/duplicate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await db.query('BEGIN');
    const tripRes = await db.query('SELECT * FROM trips WHERE id = $1', [id]);
    if (tripRes.rows.length === 0) throw new Error("Trip not found");
    const ot = tripRes.rows[0];
    
    const newTripRes = await db.query(`
      INSERT INTO trips (user_id, title, description, start_date, end_date, budget_range, status, is_public, cover_image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
    `, [userId, `Copy of ${ot.title}`, ot.description, ot.start_date, ot.end_date, ot.budget_range, 'upcoming', false, ot.cover_image_url]);
    const newTripId = newTripRes.rows[0].id;
    
    const stopsRes = await db.query('SELECT * FROM trip_stops WHERE trip_id = $1', [id]);
    for (const stop of stopsRes.rows) {
      const newStopRes = await db.query(`
        INSERT INTO trip_stops (trip_id, city_id, stop_order, arrival_date, departure_date)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
      `, [newTripId, stop.city_id, stop.stop_order, stop.arrival_date, stop.departure_date]);
      const newStopId = newStopRes.rows[0].id;
      
      const actsRes = await db.query('SELECT * FROM trip_stop_activities WHERE trip_stop_id = $1', [stop.id]);
      for (const act of actsRes.rows) {
        await db.query(`
          INSERT INTO trip_stop_activities (trip_id, trip_stop_id, activity_id, activity_date, start_time)
          VALUES ($1, $2, $3, $4, $5)
        `, [newTripId, newStopId, act.activity_id, act.activity_date, act.start_time]);
      }
    }
    
    await db.query('COMMIT');
    res.status(201).json({ id: newTripId });
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

// LOGIN Endpoint
app.post('/api/login', async (req, res) => {
  try {
    // Note: The user mentioned "how username created is according to you". 
    // Since the schema uses 'email' as the unique identifier, we use email for login.
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1d' });

    res.json({ 
      message: 'Logged in successfully', 
      token, 
      user: { 
        id: user.id, 
        firstName: user.first_name, 
        lastName: user.last_name, 
        email: user.email 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
