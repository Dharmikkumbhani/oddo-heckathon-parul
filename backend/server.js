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
      INSERT INTO trips (user_id, title, description, start_date, end_date, cover_image_url, trip_style, budget_range)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
    res.json(result.rows);
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: 'Internal server error.' });
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
