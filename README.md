# 20/20 Realtors - Cloudflare Worker Real Estate Platform

A modern real estate platform built with React frontend and Cloudflare Worker backend, featuring IDX Broker integration and D1 database.

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Cloudflare Worker with Hono framework
- **Database**: Cloudflare D1 (SQLite)
- **Cache**: Cloudflare KV
- **IDX Integration**: IDX Broker API for real estate MLS data
- **Deployment**: Cloudflare Pages + Workers

## Features

- 🏠 Property listings with advanced search and filtering
- 🔍 IDX Broker MLS integration for real-time property data
- 👤 User authentication and favorites
- 📧 Contact forms and tour requests
- 📱 Responsive design with modern UI
- ⚡ Edge-optimized performance with caching
- 🔒 Secure API with JWT authentication

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- Cloudflare account
- IDX Broker account and API access
- Wrangler CLI installed globally: `npm install -g wrangler`

### 2. Clone and Install

```bash
git clone <repository-url>
cd 2020-realtors
npm install
```

### 3. Cloudflare Setup

1. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

2. **Create D1 Database**:
   ```bash
   wrangler d1 create realtors_db
   ```
   Copy the database ID and update `wrangler.toml`

3. **Create KV Namespace**:
   ```bash
   wrangler kv:namespace create "CACHE"
   wrangler kv:namespace create "CACHE" --preview
   ```
   Update the KV namespace IDs in `wrangler.toml`

4. **Run Database Migrations**:
   ```bash
   npm run db:migrate
   ```

### 4. IDX Broker Setup

1. **Get IDX Broker API Credentials**:
   - Log into your IDX Broker account
   - Go to Account > API Keys
   - Generate a new API key
   - Note your Partner Key if required

2. **Set IDX Environment Variables**:
   ```bash
   wrangler secret put IDX_API_KEY
   # Enter your IDX API key when prompted
   
   wrangler secret put IDX_PARTNER_KEY
   # Enter your IDX Partner key if required
   ```

### 5. Additional Environment Variables

```bash
# Required for JWT authentication
wrangler secret put JWT_SECRET
# Enter a secure random string

# Optional for email notifications
wrangler secret put RESEND_API_KEY
# Enter your Resend API key if you want email notifications
```

### 6. Development

```bash
# Start frontend development server
npm run dev

# Start worker development server (in another terminal)
npm run worker:dev
```

### 7. Deployment

```bash
# Build and deploy
npm run build
npm run worker:deploy
```

## IDX Broker Integration

### API Endpoints

The platform integrates with IDX Broker's API using the following endpoints:

- `GET /api/idx/featured` - Get featured properties from IDX
- `GET /api/idx/search` - Search IDX properties with filters
- `GET /api/idx/property/:listingId` - Get single property details
- `GET /api/idx/property/:listingId/photos` - Get property photos
- `GET /api/idx/listings` - Get all active listings
- `GET /api/idx/soldpending` - Get sold/pending properties
- `POST /api/idx/sync` - Sync IDX properties to local database
- `GET /api/idx/system-info` - Get IDX system information

### IDX Broker API Methods Used

Based on the [IDX Broker API documentation](https://middleware.idxbroker.com/docs/api/methods/index.html):

- **featured** - Get featured listings
- **listings** - Get all active listings
- **search** - Search properties with filters
- **listing/{listingID}** - Get single property details
- **listing/{listingID}/images** - Get property photos
- **soldpending** - Get sold and pending properties
- **systemlinks** - Get system information

### Search Parameters

The IDX search supports the following parameters:
- `city` - City name
- `state` - State abbreviation
- `zipcode` - ZIP code
- `minPrice` / `maxPrice` - Price range (mapped to minListPrice/maxListPrice)
- `beds` - Minimum bedrooms (mapped to bedrooms)
- `baths` - Minimum bathrooms (mapped to bathrooms)
- `propertyType` - Property type filter
- `sqftMin` / `sqftMax` - Square footage range (mapped to minSqft/maxSqft)
- `limit` / `offset` - Pagination

### Property Data Mapping

IDX properties are automatically mapped to our internal format:
- **listingID** → id
- **listPrice** → price
- **address/streetName** → address
- **cityName** → city
- **state/stateAbbreviation** → state
- **zipcode/postalCode** → zip
- **bedrooms** → beds
- **totalBaths** → baths
- **sqFt/livingArea** → sqft
- **remarksConcat/publicRemarks** → description
- **propType/propertyType** → propertyType
- **yearBuilt** → yearBuilt
- **propStatus/status** → status
- **listingDate/dateAdded** → listingDate
- **latitude/longitude** → coordinates

### Caching Strategy

- **Featured Properties**: 15 minutes
- **Search Results**: 5 minutes
- **Property Details**: 10 minutes
- **Property Photos**: 30 minutes
- **All Listings**: 10 minutes
- **Sold/Pending**: 30 minutes

## API Endpoints

### Properties
- `GET /api/properties` - Get properties with filtering
- `GET /api/properties/:id` - Get single property
- `GET /api/properties/featured/list` - Get featured properties
- `POST /api/properties/favorites` - Toggle favorite
- `GET /api/properties/favorites/:userId` - Get user favorites

### IDX Integration
- `GET /api/idx/featured` - Get IDX featured properties
- `GET /api/idx/search` - Search IDX properties
- `GET /api/idx/property/:listingId` - Get IDX property details
- `GET /api/idx/listings` - Get all IDX listings
- `GET /api/idx/soldpending` - Get sold/pending properties
- `POST /api/idx/sync` - Sync IDX properties to local DB

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/signout` - User logout

### Contact
- `POST /api/contact/submit` - Submit contact form
- `POST /api/contact/tour-request` - Request property tour
- `GET /api/contact/submissions` - Get contact submissions (admin)
- `GET /api/contact/tour-requests` - Get tour requests (admin)

## Database Schema

The D1 database includes tables for:
- `users` - User accounts
- `agents` - Real estate agents
- `properties` - Property listings (local + synced from IDX)
- `user_favorites` - User favorite properties
- `contact_submissions` - Contact form submissions
- `tour_requests` - Property tour requests

## Frontend Integration

### Using IDX Data

```typescript
import { useIDXFeatured, useIDXSearch } from '../hooks/useIDX';

// Get featured properties
const { data: featured, loading, error } = useIDXFeatured();

// Search properties
const { data: searchResults, search } = useIDXSearch();

// Perform search
search({
  city: 'Los Angeles',
  state: 'CA',
  minPrice: 500000,
  maxPrice: 1000000,
  beds: 3
});
```

### Property Display

Properties from IDX are automatically formatted to match the existing Property interface, so they work seamlessly with existing components like `PropertyCard` and `PropertyPage`.

## Performance Optimizations

- **Edge Caching**: Static assets and API responses cached at Cloudflare edge
- **Image Optimization**: Lazy loading with intersection observer
- **Code Splitting**: Dynamic imports for better loading performance
- **Database Indexing**: Optimized queries with proper indexes
- **KV Caching**: Frequently accessed IDX data cached in KV store
- **Request Deduplication**: Prevents duplicate API calls

## Security Features

- JWT-based authentication with HTTP-only cookies
- CORS protection for API endpoints
- Input validation with Zod schemas
- SQL injection prevention with prepared statements
- Rate limiting (configurable with Cloudflare Workers)
- Secure IDX API key management

## Monitoring and Analytics

- Built-in health check endpoint: `/api/health`
- Error logging and monitoring
- Performance metrics via Cloudflare Analytics
- IDX API usage tracking
- Custom metrics for business intelligence

## Troubleshooting

### IDX API Issues

1. **Invalid API Key**: Verify your IDX API key is correct and active
2. **Rate Limiting**: IDX Broker has rate limits - implement proper caching
3. **Property Not Found**: Some properties may not be available via API
4. **Image Loading**: IDX images may have CORS restrictions

### Common Errors

- `IDX API key not configured`: Set the `IDX_API_KEY` secret
- `Failed to fetch IDX properties`: Check API key and network connectivity
- `Property not found`: Listing may have been removed or is not public

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.