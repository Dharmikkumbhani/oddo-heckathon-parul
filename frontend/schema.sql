-- Create custom enums
CREATE TYPE trip_status AS ENUM ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled');
CREATE TYPE account_status AS ENUM ('active', 'blocked', 'deleted');
CREATE TYPE budget_item_type AS ENUM ('transport', 'stay', 'activity', 'meal', 'misc');
CREATE TYPE collaborator_role AS ENUM ('owner', 'editor', 'viewer');
CREATE TYPE note_type AS ENUM ('general', 'reminder', 'hotel', 'transport', 'food');

-- 1. Countries
CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) UNIQUE NOT NULL,
    iso_code VARCHAR(10) UNIQUE NOT NULL,
    currency_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    password_hash TEXT NOT NULL,
    profile_photo_url TEXT,
    city VARCHAR(120),
    country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
    bio TEXT,
    language_preference VARCHAR(20),
    account_status account_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- 3. User Preferences
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    preferred_budget_level VARCHAR(20),
    preferred_trip_styles TEXT[],
    preferred_activity_types TEXT[],
    preferred_climate VARCHAR(50),
    receive_notifications BOOLEAN DEFAULT true,
    privacy_public_profile BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Cities
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    region VARCHAR(120),
    description TEXT,
    cost_index NUMERIC(8,2),
    popularity_score NUMERIC(5,2),
    climate_type VARCHAR(50),
    best_for TEXT[],
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Trips
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE CHECK (end_date >= start_date),
    cover_image_url TEXT,
    trip_style VARCHAR(50),
    budget_range VARCHAR(30),
    status trip_status DEFAULT 'draft',
    is_public BOOLEAN DEFAULT false,
    public_slug VARCHAR(255) UNIQUE NULL,
    total_estimated_cost NUMERIC(12,2),
    currency_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- 6. Trip Stops
CREATE TABLE trip_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    stop_order INTEGER NOT NULL,
    title VARCHAR(150) NULL,
    arrival_date DATE,
    departure_date DATE,
    notes TEXT,
    estimated_stop_cost NUMERIC(12,2),
    stay_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_dates CHECK (departure_date >= arrival_date),
    CONSTRAINT uq_trip_stop_order UNIQUE (trip_id, stop_order)
);

-- 7. Activity Categories
CREATE TABLE activity_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Activities
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    category_id UUID REFERENCES activity_categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    estimated_cost NUMERIC(12,2),
    rating NUMERIC(3,2),
    is_family_friendly BOOLEAN,
    is_outdoor BOOLEAN,
    adventure_level VARCHAR(20),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Trip Stop Activities
CREATE TABLE trip_stop_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    trip_stop_id UUID REFERENCES trip_stops(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    activity_date DATE,
    start_time TIME NULL,
    end_time TIME NULL,
    custom_title VARCHAR(200) NULL,
    custom_notes TEXT,
    estimated_cost NUMERIC(12,2),
    sequence_order INTEGER,
    status VARCHAR(20) DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Trip Budgets
CREATE TABLE trip_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
    budget_limit NUMERIC(12,2),
    estimated_total_cost NUMERIC(12,2),
    estimated_transport_cost NUMERIC(12,2),
    estimated_stay_cost NUMERIC(12,2),
    estimated_activity_cost NUMERIC(12,2),
    estimated_meal_cost NUMERIC(12,2),
    estimated_misc_cost NUMERIC(12,2),
    average_cost_per_day NUMERIC(12,2),
    is_over_budget BOOLEAN DEFAULT false,
    warning_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Trip Budget Items
CREATE TABLE trip_budget_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_budget_id UUID REFERENCES trip_budgets(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    trip_stop_id UUID REFERENCES trip_stops(id) ON DELETE CASCADE,
    item_type budget_item_type NOT NULL,
    title VARCHAR(200),
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit_cost NUMERIC(12,2),
    total_cost NUMERIC(12,2),
    expense_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Packing Categories
CREATE TABLE packing_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    icon_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Packing Items
CREATE TABLE packing_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    category_id UUID REFERENCES packing_categories(id) ON DELETE SET NULL,
    item_name VARCHAR(200) NOT NULL,
    quantity INTEGER DEFAULT 1,
    is_packed BOOLEAN DEFAULT false,
    is_suggested BOOLEAN DEFAULT false,
    created_by_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Trip Notes
CREATE TABLE trip_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    trip_stop_id UUID REFERENCES trip_stops(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200),
    content TEXT NOT NULL,
    note_date DATE NULL,
    note_time TIME NULL,
    note_type note_type DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Shared Itineraries
CREATE TABLE shared_itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
    shared_by_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    public_slug VARCHAR(255) UNIQUE NOT NULL,
    share_title VARCHAR(200),
    share_description TEXT,
    is_public BOOLEAN DEFAULT true,
    allow_copy_trip BOOLEAN DEFAULT true,
    share_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Saved Destinations
CREATE TABLE saved_destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_city UNIQUE (user_id, city_id)
);

-- 17. Community Bookmarks
CREATE TABLE community_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shared_itinerary_id UUID REFERENCES shared_itineraries(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_bookmark UNIQUE (user_id, shared_itinerary_id)
);

-- 18. Trip Collaborators
CREATE TABLE trip_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role collaborator_role DEFAULT 'viewer',
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. Media Files
CREATE TABLE media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploaded_by_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_name VARCHAR(255),
    entity_type VARCHAR(50), -- e.g., 'user', 'trip', 'city', 'activity'
    entity_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for fast lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trip_stops_trip_id ON trip_stops(trip_id);
CREATE INDEX idx_activities_city_id ON activities(city_id);
CREATE INDEX idx_shared_itineraries_slug ON shared_itineraries(public_slug);
