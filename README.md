# 20/20 Realtors - Separated Frontend & Backend

A modern real estate platform with separated frontend (Cloudflare Pages) and backend (Cloudflare Workers) architecture.

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS (Cloudflare Pages)
- **Backend**: Cloudflare Worker with Hono framework (Cloudflare Workers)
- **Database**: Cloudflare D1 (SQLite)
- **Cache**: Cloudflare KV
- **IDX Integration**: IDX Broker API for real estate MLS data

## Project Structure

```
├── src/                    # Frontend React application
├── worker/                 # Backend Cloudflare Worker
│   ├── src/
│   │   ├── api/           # API route handlers
│   │   └── index.ts       # Worker entry point
│   ├── package.json       # Worker dependencies
│   ├── wrangler.toml      # Worker configuration
│   └── tsconfig.json      # Worker TypeScript config
├── supabase/migrations/   # Database migrations
└── package.json           # Frontend dependencies
```

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

# Install frontend dependencies
npm install

# Install worker dependencies
cd worker
npm install
cd ..
```

### 3. Backend Setup (Cloudflare Worker)

1. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

2. **Database is already configured** in `worker/wrangler.toml`

3. **Run Database Migrations**:
   ```bash
   cd worker
   npm run db:migrate
   ```

4. **Set Environment Variables**:
   ```bash
   cd worker
   wrangler secret put IDX_API_KEY
   # Enter your IDX API key when prompted
   
   wrangler secret put JWT_SECRET
   # Enter a secure random string
   
   wrangler secret put RESEND_API_KEY
   # Enter your Resend API key (optional for emails)
   ```

5. **Deploy Worker**:
   ```bash
   cd worker
   npm run deploy
   ```

### 4. Frontend Setup (Cloudflare Pages)

1. **Update API URL**: The frontend is configured to use:
   - Development: `http://localhost:8787`
   - Production: `https://2020-realtors-api.workers.dev`

2. **Deploy to Cloudflare Pages**:
   - Connect your GitHub repository to Cloudflare Pages
   - Set build command: `npm run build`
   - Set build output directory: `dist`
   - Deploy automatically on git push

### 5. Development

```bash
# Start frontend development server
npm run dev

# Start worker development server (in another terminal)
cd worker
npm run dev
```

## API Endpoints

The backend worker provides the following API endpoints:

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

### Health Check
- `GET /api/health` - API health status

## Deployment URLs

- **Frontend**: Will be deployed to Cloudflare Pages (e.g., `https://2020realtors.pages.dev`)
- **Backend**: Deployed to Cloudflare Workers (`https://2020-realtors-api.workers.dev`)

## Environment Variables

### Worker Secrets (set with `wrangler secret put`)
- `IDX_API_KEY` - Your IDX Broker API key
- `JWT_SECRET` - Secret for JWT token signing
- `RESEND_API_KEY` - Resend API key for email notifications (optional)

### Frontend Environment Variables
The frontend automatically detects the environment and uses the appropriate API URL.

## CORS Configuration

The worker is configured to allow requests from:
- `http://localhost:5173` (development)
- `https://2020realtors.pages.dev` (production)
- `https://2020-realtors.pages.dev` (production)
- `https://www.2020realtors.com` (custom domain)
- `https://2020realtors.com` (custom domain)

## Database

The database is shared between both environments and includes tables for:
- `users` - User accounts
- `agents` - Real estate agents
- `properties` - Property listings
- `user_favorites` - User favorite properties
- `contact_submissions` - Contact form submissions
- `tour_requests` - Property tour requests

## Benefits of Separated Architecture

1. **Independent Scaling**: Frontend and backend can scale independently
2. **Better Performance**: Static frontend served from CDN, API from edge workers
3. **Easier Deployment**: Separate deployment pipelines for frontend and backend
4. **Development Flexibility**: Teams can work on frontend and backend independently
5. **Cost Optimization**: Pay only for what you use with serverless architecture

## Security Features

- JWT-based authentication with HTTP-only cookies
- CORS protection for API endpoints
- Input validation with Zod schemas
- SQL injection prevention with prepared statements
- Secure cookie settings for cross-origin requests

## Monitoring

- Built-in health check endpoint: `/api/health`
- Cloudflare Analytics for both Pages and Workers
- Error logging and monitoring
- Performance metrics

## License

This project is licensed under the MIT License.