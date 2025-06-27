# D1 Database Setup - Individual Queries

Run these queries **one by one** in your D1 database console:

## 1. Create Users Table
```sql
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, first_name TEXT, last_name TEXT, phone TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
```

## 2. Create Agents Table
```sql
CREATE TABLE IF NOT EXISTS agents (id TEXT PRIMARY KEY, name TEXT NOT NULL, title TEXT, photo TEXT, phone TEXT, email TEXT, bio TEXT, specializations TEXT, social_media TEXT, languages TEXT, listings INTEGER DEFAULT 0, experience INTEGER DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')));
```

## 3. Create Properties Table
```sql
CREATE TABLE IF NOT EXISTS properties (id TEXT PRIMARY KEY, title TEXT NOT NULL, price INTEGER NOT NULL, address TEXT NOT NULL, city TEXT NOT NULL, state TEXT NOT NULL, zip TEXT NOT NULL, beds INTEGER NOT NULL, baths REAL NOT NULL, sqft INTEGER NOT NULL, description TEXT, property_type TEXT NOT NULL, year_built INTEGER, features TEXT, images TEXT, is_featured INTEGER DEFAULT 0, is_new INTEGER DEFAULT 0, status TEXT DEFAULT 'for-sale', listing_date TEXT, latitude REAL, longitude REAL, mls_number TEXT UNIQUE, agent_id TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (agent_id) REFERENCES agents (id));
```

## 4. Create User Favorites Table
```sql
CREATE TABLE IF NOT EXISTS user_favorites (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, property_id TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users (id), FOREIGN KEY (property_id) REFERENCES properties (id), UNIQUE(user_id, property_id));
```

## 5. Create Contact Submissions Table
```sql
CREATE TABLE IF NOT EXISTS contact_submissions (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, subject TEXT NOT NULL, message TEXT NOT NULL, property_id TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (property_id) REFERENCES properties (id));
```

## 6. Create Tour Requests Table
```sql
CREATE TABLE IF NOT EXISTS tour_requests (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, property_id TEXT NOT NULL, preferred_date TEXT NOT NULL, preferred_time TEXT NOT NULL, message TEXT, status TEXT DEFAULT 'pending', created_at TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (property_id) REFERENCES properties (id));
```

## 7. Create Performance Indexes (Run each separately)
```sql
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
```

```sql
CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state);
```

```sql
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
```

```sql
CREATE INDEX IF NOT EXISTS idx_properties_beds ON properties(beds);
```

```sql
CREATE INDEX IF NOT EXISTS idx_properties_baths ON properties(baths);
```

```sql
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
```

```sql
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
```

```sql
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON properties(is_featured);
```

```sql
CREATE INDEX IF NOT EXISTS idx_properties_is_new ON properties(is_new);
```

```sql
CREATE INDEX IF NOT EXISTS idx_properties_mls_number ON properties(mls_number);
```

```sql
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
```

```sql
CREATE INDEX IF NOT EXISTS idx_user_favorites_property_id ON user_favorites(property_id);
```

## 8. Insert Sample Agents (Run each separately)
```sql
INSERT OR IGNORE INTO agents (id, name, title, photo, phone, email, bio, specializations, social_media, languages, listings, experience) VALUES ('rm1', 'Roger Martinez', 'Senior Real Estate Agent', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg', '(714) 555-0101', 'roger@2020realtors.com', 'With over 15 years of experience in real estate, Roger specializes in residential properties and investment opportunities.', '["Residential", "Investment Properties", "First-time Buyers"]', '{"linkedin": "rogermartinez-realtor"}', '["English", "Spanish"]', 25, 15);
```

```sql
INSERT OR IGNORE INTO agents (id, name, title, photo, phone, email, bio, specializations, social_media, languages, listings, experience) VALUES ('ll1', 'Lina Levinthal', 'Luxury Property Specialist', 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg', '(714) 555-0102', 'lina@2020realtors.com', 'Lina brings expertise in luxury properties and high-end real estate transactions.', '["Luxury Homes", "Estate Properties", "Property Investment"]', '{"instagram": "linalevinthal.realestate", "linkedin": "linalevinthal"}', '["English", "Hebrew"]', 18, 12);
```

```sql
INSERT OR IGNORE INTO agents (id, name, title, photo, phone, email, bio, specializations, social_media, languages, listings, experience) VALUES ('js1', 'Javier Sosa', 'Commercial Real Estate Expert', 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg', '(714) 555-0103', 'javier@2020realtors.com', 'Javier specializes in commercial properties and business real estate solutions.', '["Commercial", "Retail Spaces", "Office Properties"]', '{"linkedin": "javiersosa-commercial"}', '["English", "Spanish"]', 20, 10);
```

## 9. Insert Sample Properties (Run each separately)
```sql
INSERT OR IGNORE INTO agents (id, name, title, photo, phone, email, bio, specializations, social_media, languages, listings, experience) VALUES ('hf1', 'Henry Humberto Ferrufino', 'Real Estate Agent', 'placeholder', '(714) 470-4444', 'henry@2020realtors.com', 'Henry specializes in helping families find their perfect homes with his deep understanding of local neighborhoods and market trends.', '["Residential", "Family Homes", "First-time Buyers"]', '{"instagram": "henryferrufino.homes"}', '["English", "Spanish"]', 22, 8);
```

```sql
INSERT OR IGNORE INTO properties (id, title, price, address, city, state, zip, beds, baths, sqft, description, property_type, year_built, features, images, is_featured, is_new, status, listing_date, latitude, longitude, mls_number, agent_id) VALUES ('7', 'Newly Built Modern Home in Orange', 1599000, '420 S Hill St', 'Orange', 'CA', '92869', 4, 3.5, 2949, 'This gorgeous newly built home is nestled in a tranquil residential street within the sought-after Orange neighborhood.', 'single-family', 2024, '["2-Car Garage", "Open Floor Plan", "Master Suite"]', '["https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://storage.googleapis.com/msgsndr/OOffS0euyreSp3x4Tzkn/media/685c8b9f2c6cb14867f86ed2.jpeg"]', 1, 1, 'for-sale', '2024-12-20', 33.7879, -117.8531, 'ORA24701', 'hf1');
```

```sql
INSERT OR IGNORE INTO properties (id, title, price, address, city, state, zip, beds, baths, sqft, description, property_type, year_built, features, images, is_featured, is_new, status, listing_date, latitude, longitude, mls_number, agent_id) VALUES ('8', 'Beautiful Family Home in Corona', 650000, '8035 Santa Rita St', 'Corona', 'CA', '92881', 4, 3, 2156, 'Welcome to this stunning 4-bedroom, 3-bathroom home located in the desirable Corona community.', 'single-family', 2005, '["2-Car Garage", "Open Floor Plan", "Updated Kitchen"]', '["https://photos.zillowstatic.com/fp/f67e3cbf0f8cb1672f1637920dc4ea16-cc_ft_768.webp"]', 1, 1, 'for-sale', '2024-12-15', 33.8753, -117.5664, 'COR24801', 'hf1');
```

## Execution Order:
1. Run queries 1-6 (create tables)
2. Run queries 7 (create indexes - each one separately)
3. Run queries 8-9 (insert sample data - each one separately)

Copy and paste each query individually into your D1 console!