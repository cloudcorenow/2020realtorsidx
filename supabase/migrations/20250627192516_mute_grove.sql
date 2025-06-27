-- Database schema for 20/20 Realtors

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  photo TEXT,
  phone TEXT,
  email TEXT,
  bio TEXT,
  specializations TEXT, -- JSON array
  social_media TEXT, -- JSON object
  languages TEXT, -- JSON array
  listings INTEGER DEFAULT 0,
  experience INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  price INTEGER NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  beds INTEGER NOT NULL,
  baths REAL NOT NULL,
  sqft INTEGER NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL,
  year_built INTEGER,
  features TEXT, -- JSON array
  images TEXT, -- JSON array
  is_featured INTEGER DEFAULT 0,
  is_new INTEGER DEFAULT 0,
  status TEXT DEFAULT 'for-sale',
  listing_date TEXT,
  latitude REAL,
  longitude REAL,
  mls_number TEXT UNIQUE,
  agent_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (agent_id) REFERENCES agents (id)
);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  property_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (property_id) REFERENCES properties (id),
  UNIQUE(user_id, property_id)
);

-- Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  property_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (property_id) REFERENCES properties (id)
);

-- Tour requests table
CREATE TABLE IF NOT EXISTS tour_requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  property_id TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (property_id) REFERENCES properties (id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_beds ON properties(beds);
CREATE INDEX IF NOT EXISTS idx_properties_baths ON properties(baths);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_is_new ON properties(is_new);
CREATE INDEX IF NOT EXISTS idx_properties_mls_number ON properties(mls_number);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_property_id ON user_favorites(property_id);

-- Insert sample agents
INSERT OR IGNORE INTO agents (id, name, title, photo, phone, email, bio, specializations, social_media, languages, listings, experience) VALUES
('rm1', 'Roger Martinez', 'Senior Real Estate Agent', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg', '(714) 555-0101', 'roger@2020realtors.com', 'With over 15 years of experience in real estate, Roger specializes in residential properties and investment opportunities.', '["Residential", "Investment Properties", "First-time Buyers"]', '{"linkedin": "rogermartinez-realtor"}', '["English", "Spanish"]', 25, 15),
('ll1', 'Lina Levinthal', 'Luxury Property Specialist', 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg', '(714) 555-0102', 'lina@2020realtors.com', 'Lina brings expertise in luxury properties and high-end real estate transactions.', '["Luxury Homes", "Estate Properties", "Property Investment"]', '{"instagram": "linalevinthal.realestate", "linkedin": "linalevinthal"}', '["English", "Hebrew"]', 18, 12),
('js1', 'Javier Sosa', 'Commercial Real Estate Expert', 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg', '(714) 555-0103', 'javier@2020realtors.com', 'Javier specializes in commercial properties and business real estate solutions.', '["Commercial", "Retail Spaces", "Office Properties"]', '{"linkedin": "javiersosa-commercial"}', '["English", "Spanish"]', 20, 10);