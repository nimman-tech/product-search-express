# Product Search - Express.js + Vercel

A modern Express.js REST API for searching products across multiple categories (cars, mobiles), vendor listing lookups, affiliate link monetization/redirection, and versioned database migrations. Designed for serverless deployment on Vercel with Turso Cloud SQLite backend.

---

## Features

- **Dynamic Product Search**: Filter and search cars and mobiles across extensive technical specifications.
- **Automatic Year Filtering**: Configurable minimum launch year threshold (`year >= 2020`) with category-level environment overrides.
- **Vendor Listings & Purchase Links**: Multi-vendor product pricing and links (Official, Amazon, Flipkart, etc.).
- **Affiliate Monetization & Redirects**: Transparent redirect service with Cuelinks affiliate wrapping and click tracking (`/api/redirect`).
- **Automated Database Migrations**: Versioned, sequential SQL migrations executed automatically on deployment builds.
- **Firebase Authentication**: Secure JWT-based authentication for product search endpoints.
- **Flexible Querying**: Multi-field condition support (`=`, `>=`, `<=`, `<`, `>`, `IN`), ordering, and pagination.
- **Serverless Ready**: Fully configured for Vercel Functions and local development.

---

## Project Structure

```
product-search-express/
├── database/
│   ├── migrations/             # Versioned SQL migration scripts (0001 - 0006)
│   └── seed-product-vendor-listings.ts  # Vendor listing seeder
├── src/
│   ├── api/                    # Vercel Serverless Function entrypoints
│   ├── config/                 # Configuration (database, firebase, cors, product, redirect)
│   ├── db/                     # Migration engine & CLI runner
│   │   ├── migrator.ts         # Core migration logic & checksum validation
│   │   └── cli.ts              # CLI interface
│   ├── middleware/             # Express middlewares (auth, validation)
│   ├── routes/                 # Express route handlers (products, redirect, health)
│   ├── services/               # Business logic services (productService, redirectService)
│   ├── mappers/                # Column name mappings and value normalizers
│   ├── types/                  # TypeScript interfaces & API models
│   ├── utils/                  # Utility helpers & centralized error handling
│   └── index.ts                # Express application initialization
├── api/                        # Vercel entrypoint
├── test-reports/               # Jest HTML test reports
└── vercel.json                 # Vercel deployment configuration
```

---

## Prerequisites

- **Node.js**: 20.19.0 or higher
- **npm**: 10.0.0 or higher
- **Turso Cloud account** (or local SQLite)
- **Firebase Project** (with Service Account credentials)

---

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Turso credentials, Firebase service account, and CORS origins.

3. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

4. **Start local development server:**
   ```bash
   npm run dev
   ```
   The server starts at `http://localhost:3000`.

---

## Database Upgrade & Migration Strategy on Deployment

Database schema changes across local, staging, and production environments follow an industry-standard **Versioned Evolutionary Database Migration** strategy.

### Core Architecture

1. **Versioned SQL Scripts (`database/migrations/`)**:
   - Numbered, sequential SQL migration files (e.g. `0001_create_versions.sql`, `0002_create_cars.sql`, `0006_add_performance_indexes.sql`).
   - All migrations are executed atomically inside write transactions.

2. **State Tracking (`_schema_migrations` Table)**:
   - Tracks executed migrations with `id`, `name`, `checksum`, and `applied_at`.
   - Uses SHA-256 checksums to verify integrity and detect tampering of previously applied migrations.

3. **Auto-Baselining for Existing Databases**:
   - On first run against an existing database, the migrator automatically detects legacy tables and records baseline migrations without throwing duplicate execution errors.

4. **Automated Pre-Deploy / Build Execution**:
   - `npm run vercel-build` automatically executes `npm run db:migrate && tsc`.
   - Migrations are applied in the release phase before the compiled application serves traffic.

---

### Migration CLI Commands

| Command | Description |
| :--- | :--- |
| `npm run db:migrate` | Apply all pending migrations sequentially inside write transactions. |
| `npm run db:migrate:status` | Display a formatted status table of applied and pending migrations. |
| `npm run db:migrate:baseline <name \| --all>` | Mark migration(s) as applied without running SQL (for baseline syncing). |
| `npm run db:migrate:create <description>` | Scaffold a new sequential migration template file. |

---

## API Endpoints

### 1. POST `/api/products/scan`
Search products with specification filters, sorting, and pagination.

- **Auth**: Required (`Authorization: Bearer <Firebase_JWT>`)
- **Request Body**:
  ```json
  {
    "product": "mobile",
    "columns": ["name", "brand", "price", "ram", "storage"],
    "conditions": [
      { "f": "ram", "o": "EG", "v": 8 },
      { "f": "price", "o": "ES", "v": 40000 }
    ],
    "sort": [{ "sortBy": "price", "order": "ASC" }],
    "limit": 20,
    "offset": 0
  }
  ```
- **Response**:
  ```json
  {
    "total": 15,
    "data": [
      {
        "i": "mob-123",
        "v": ["Galaxy S24", "Samsung", 39999, 8, 128],
        "u": [
          { "vendor": "Official", "url": "https://samsung.com/...", "price": 39999 },
          { "vendor": "Amazon", "url": "https://amazon.in/...", "price": 38999 }
        ]
      }
    ]
  }
  ```

### 2. GET `/api/redirect`
Redirects user to monetized vendor URLs and logs click analytics.

- **Query Parameters**:
  - `url` *(required)*: Destination product URL
  - `productId` *(optional)*: Product ID
  - `productType` *(optional)*: `car` | `mobile`
  - `vendor` *(optional)*: Merchant vendor name
  - `subid` *(optional)*: Affiliate sub-tracking ID

### 3. GET `/api/health`
Health check endpoint.
- **Response**: `{ "status": "UP", "version": "1.0.0" }`

---

## Testing & Quality

- **Run unit test suite**:
  ```bash
  npm test
  ```
- **Watch mode**:
  ```bash
  npm run test:watch
  ```
- **Linting & Formatting**:
  ```bash
  npm run lint
  npm run format
  ```

### HTML Test Report
After running tests, view the visual test report in `test-reports/jest_html_reporters.html`.

---

## Deployment to Vercel

1. Push your changes to your Git repository.
2. In Vercel Project Settings, add all production Environment Variables:
   - `FIREBASE_SERVICE_ACCOUNT`
   - `TURSO_CONNECTION_URL`
   - `TURSO_AUTH_TOKEN`
   - `CORS_ORIGINS`
   - `ALLOWED_MERCHANT_DOMAINS`
   - `CUELINKS_API_KEY`
   - `NODE_ENV=production`
3. Build command: `npm run vercel-build` (triggers `npm run db:migrate && tsc`).

---

## License

Proprietary - Nimman Technology
