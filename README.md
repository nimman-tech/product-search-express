# Product Search - Express.js + Vercel

A modern Express.js REST API for searching products across multiple categories (cars, mobiles), migrated from Spring Boot. Designed for serverless deployment on Vercel with Turso Cloud SQLite backend.

## Features

- **Dynamic Product Search**: Filter cars and mobiles by various specifications
- **Firebase Authentication**: Secure JWT-based authentication
- **Flexible Filtering**: Support for multiple conditions (=, >=, <=, <, >, IN)
- **Sorting & Pagination**: Order results and paginate through large datasets
- **Serverless Deployment**: Ready for Vercel Functions
- **CORS Enabled**: Configured for Angular frontend integration
- **Production Ready**: Comprehensive error handling and validation

## Project Structure

```
src/
  ├── api/                 # Vercel Functions (endpoints)
  │   ├── health.ts       # GET /api/health
  │   └── products/
  │       └── scan.ts     # POST /api/products/scan
  ├── config/             # Configuration files
  │   ├── firebase.ts     # Firebase initialization
  │   ├── database.ts     # Turso database setup
  │   └── cors.ts         # CORS configuration
  ├── middleware/         # Express middleware
  │   └── auth.ts         # Firebase authentication filter
  ├── services/           # Business logic
  │   └── productService.ts  # Product search service
  ├── mappers/            # Column name mapping
  │   ├── columnMapper.ts
  │   └── columnMapperFactory.ts
  ├── types/              # TypeScript interfaces
  │   └── index.ts        # API models
  ├── utils/              # Utility functions
  │   └── errorHandler.ts # Error handling
  └── index.ts            # Express app initialization (dev)
```

## Prerequisites

- Node.js 20+
- npm or yarn
- Turso Cloud account (for database)
- Firebase project with service account

## Installation

```bash
npm install
```

## Environment Setup

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Fill in your environment variables:
   - Firebase service account JSON
   - Turso database URL and token (see **Local Turso Development** below)
   - CORS origins

### Local Turso Development (Option A)

For local development without syncing to the Turso cloud, run a local Turso/libsql server and point the app to it.

1. Install the Turso CLI (macOS):

```bash
brew install tursodatabase/tap/turso
```

2. Start a local Turso server:

```bash
turso dev --db-file ./sqlite/products-local.db
```

This prints a local endpoint (usually `http://127.0.0.1:8000`).

3. Update `.env.local` to use the local endpoint:

```env
TURSO_CONNECTION_URL=http://127.0.0.1:8000
```

4. Confirm the local server is running (optional):

```bash
turso local status
```

> ✅ The app will connect locally and will not sync to Turso cloud unless you explicitly run `turso sync`.

## Development

```bash
npm run dev
```

Server runs on `http://localhost:3000`

## Building

```bash
npm run build
```

## Testing

```bash
npm test
npm run test:watch
```

### HTML Test Report

This project uses [`jest-html-reporters`](https://github.com/Hazyzh/jest-html-reporters) to generate a visual HTML report after each test run.

After running `npm test`, open the generated report in your browser:

```bash
open jest_html_reporters.html
```

The report shows pass/fail status, execution times, and error details for every test suite. The report file and its attachments directory (`jest-html-reporters-attach/`) are ignored by git.

## Deployment to Vercel

1. Connect repository to Vercel
2. Set environment variables in Vercel project settings
3. Deploy:

```bash
vercel deploy
```

## API Endpoints

### POST /api/products/scan

Search products with filters, sorting, and pagination.

**Authentication**: Required (Firebase JWT)

**Request**:

```typescript
{
  product: 'car' | 'mobile',
  columns: string[],
  conditions?: [{
    f: string,           // field name
    o: 'E' | 'EG' | 'ES' | 'S' | 'G' | 'IN',  // operation
    v: string | number | string[]
  }],
  sort?: [{
    sortBy: string,
    order: 'ASC' | 'DESC'
  }],
  limit?: number,        // max 200
  offset?: number
}
```

**Response**:

```typescript
{
  total: number,
  data: [{
    i: string | number,  // item ID
    v: (string | number)[]  // column values
  }]
}
```

### GET /api/health

Health check endpoint.

**Authentication**: Not required

**Response**:

```typescript
{
  status: 'UP',
  version: '1.0.0'
}
```

## Database Schema

### cars table

Automotive specifications including:

- Basic: brand, model, year, price
- Engine: power, torque, displacement
- Transmission: type, gearbox
- Features: seats, airbags, sunroof, etc.
- Safety, Fuel, Infotainment, Aesthetics columns

### mobiles table

Mobile device specifications including:

- Basic: brand, model, price, release_year
- Display: screen_size, resolution, refresh_rate
- Camera: rear_mp, front_mp, video_recording
- Battery: capacity, charging_speed
- Memory: ram, storage
- Connectivity: 5g, nfc, etc.

## Migration Notes

This project is a migration from Spring Boot to Express.js:

- **Database**: MySQL → Turso SQLite
- **Runtime**: Java 21 → Node.js 20+
- **Framework**: Spring Boot 3.x → Express.js 5.x
- **Deployment**: Google Cloud Run → Vercel Functions
- **Authentication**: Firebase Admin SDK (maintained)

## Security Considerations

- Firebase JWT validation required for all endpoints except `/api/health`
- CORS restricted to configured origins
- Parameterized queries prevent SQL injection
- Environment variables for sensitive credentials
- Request validation and error handling for invalid inputs

## Performance

- Turso SQLite optimized for serverless: low latency, minimal cold starts
- Connection pooling for database efficiency
- Target response time: <500ms for typical searches
- Supports concurrent requests via Vercel Function scaling

## Troubleshooting

### Database Connection Issues

- Verify `TURSO_CONNECTION_URL` and `TURSO_AUTH_TOKEN` are correct
- Check Turso dashboard for database status
- Ensure tables (cars, mobiles) exist with correct schema

### Firebase Authentication Errors

- Validate Firebase service account JSON format
- Verify project ID matches Firebase console
- Check token expiration and claims

### CORS Errors

- Confirm origin is in `CORS_ORIGINS` comma-separated list
- Verify deployment origin exactly matches configured origin
- Check browser console for specific error messages

## License

Proprietary - Nimman Technology
