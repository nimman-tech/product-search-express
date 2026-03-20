# Product Search Express.js - Setup & Deployment Guide

This document provides step-by-step instructions for local setup and deployment to Vercel.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Firebase Configuration](#firebase-configuration)
4. [Turso Database Setup](#turso-database-setup)
5. [Running Locally](#running-locally)
6. [Vercel Deployment](#vercel-deployment)
7. [Data Migration](#data-migration)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js**: 20.19.0 or higher
- **npm**: 10.0.0 or higher
- **Git**: For version control
- **Firebase Project**: Active Firebase project with service account
- **Turso Account**: Cloud SQLite database service (free tier available)
- **Vercel Account**: For deployment (free tier available)
- **Angular Frontend**: Already deployed (to point to new API)

---

## Local Development Setup

### 1. Clone Repository (if applicable)

```bash
git clone <repository-url>
cd product-search-express
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
TURSO_CONNECTION_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=<your-token>
CORS_ORIGINS=http://localhost:4200,http://localhost:3000
NODE_ENV=development
PORT=3000
```

---

## Firebase Configuration

### Step 1: Get Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to: **Settings** (gear icon) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Copy the entire JSON object

### Step 2: Add Service Account to `.env.local`

Paste the JSON as a single-line string in `FIREBASE_SERVICE_ACCOUNT`:

```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"my-project",...}
```

**Note**: Ensure the JSON is a valid string without newlines (or with `\n` escape sequences).

### Step 3: Verify Firebase Connection

Run the development server and check console for:

```
Firebase Admin SDK initialized successfully
```

---

## Turso Database Setup

### Step 1: Create Turso Account

1. Go to [Turso](https://turso.tech)
2. Sign up for free account
3. Create organization and database

### Step 2: Get Connection Details

From Turso dashboard:

1. Select your database
2. Click **Connect**
3. Copy the connection URL and auth token

### Step 3: Add to `.env.local`

```env
TURSO_CONNECTION_URL=libsql://your-db-name-your-org.turso.io
TURSO_AUTH_TOKEN=<your-token>
```

### Step 4: Create Database Tables

See [Database Schema](#database-schema) section below for DDL statements.

---

## Running Locally

### Development Server

Start the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

Endpoints:

- **Health Check**: `GET http://localhost:3000/api/health`
- **Product Search**: `POST http://localhost:3000/api/products/scan` (requires Firebase JWT)

### Build for Production

```bash
npm run build
```

This compiles TypeScript to `dist/` directory.

### Start Production Build

```bash
npm start
```

---

## Vercel Deployment

### Step 1: Prepare Repository

Ensure your code is committed and pushed to GitHub:

```bash
git add .
git commit -m "Express.js product search API"
git push origin main
```

### Step 2: Connect to Vercel

1. Log in to [Vercel](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Vercel should auto-detect it's a Node.js project

### Step 3: Configure Environment Variables

In Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add these variables for **Production**:
   - `FIREBASE_SERVICE_ACCOUNT`: Your Firebase service account JSON
   - `TURSO_CONNECTION_URL`: Your Turso connection URL
   - `TURSO_AUTH_TOKEN`: Your Turso auth token
   - `CORS_ORIGINS`: Your frontend domain (e.g., `https://nimman.co.in`)
   - `NODE_ENV`: `production`

**Important**: Ensure `CORS_ORIGINS` includes your frontend domain.

### Step 4: Configure Build Settings (Optional)

Vercel should auto-detect:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

If not auto-detected, set them manually.

### Step 5: Deploy

Click **Deploy**. Vercel will:

1. Install dependencies
2. Build TypeScript
3. Deploy to CDN

Wait for deployment to complete. You'll get a URL like:

```
https://product-search-express.vercel.app
```

### Step 6: Test Deployment

```bash
# Test health endpoint (public, no auth required)
curl https://product-search-express.vercel.app/api/health

# Test search endpoint (requires Firebase JWT token)
curl -X POST https://product-search-express.vercel.app/api/products/scan \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product":"cars","columns":["brand","price"]}'
```

---

## Data Migration

### Exporting Data from MySQL

If migrating from existing Spring Boot application with MySQL:

#### 1. Export MySQL Data

```bash
# Export cars table
mysqldump -u root -p products cars > cars.sql

# Export mobiles table
mysqldump -u root -p products mobiles > mobiles.sql
```

#### 2. Convert to SQLite Format

SQLite uses similar SQL syntax, but some adjustments may be needed:

```bash
# Create SQLite database and import
sqlite3 products.db < cars.sql
sqlite3 products.db < mobiles.sql
```

#### 3. Upload to Turso

Using Turso CLI:

```bash
# Install Turso CLI if not already installed
# then push data
turso db push <database-name>
```

Or import via Turso dashboard.

---

## Testing

### Unit Tests

```bash
npm test
```

### Watch Mode

```bash
npm run test:watch
```

### HTML Test Report

After running `npm test`, an HTML report is generated at `jest_html_reporters.html`. Open it in your browser to view pass/fail status, execution times, and detailed error information:

```bash
open jest_html_reporters.html
```

The report file and its attachments directory (`jest-html-reporters-attach/`) are excluded from version control via `.gitignore`.

###Manual API Testing

#### 1. Get Firebase Test Token

Use Firebase SDK to generate a test token, or use an existing token from your frontend.

#### 2. Test Health Endpoint

```bash
curl http://localhost:3000/api/health
```

Response:

```json
{
  "status": "UP",
  "others": {
    "version": "1.0.0",
    "service": "product-search-express",
    "timestamp": "2026-03-10T..."
  }
}
```

#### 3. Test Search Endpoint

```bash
curl -X POST http://localhost:3000/api/products/scan \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product": "cars",
    "columns": ["brand", "model", "price"],
    "conditions": [
      {"f": "price", "o": "EG", "v": 500000},
      {"f": "price", "o": "ES", "v": 2000000}
    ],
    "sort": [{"sortBy": "price", "order": "D"}],
    "limit": 10,
    "offset": 0
  }'
```

Response:

```json
{
  "total": 45,
  "data": [
    {
      "i": 1,
      "v": ["Toyota", "Innova", 1500000]
    },
    ...
  ]
}
```

---

## Troubleshooting

### Firebase Authentication Issues

**Problem**: "Token verification failed"

**Solutions**:

- Verify Firebase service account JSON is valid
- Check that token is not expired
- Ensure Authorization header format is `Bearer <token>`

### Database Connection Issues

**Problem**: "Database connection failed"

**Solutions**:

- Verify `TURSO_CONNECTION_URL` and `TURSO_AUTH_TOKEN` are correct
- Check Turso dashboard for database status
- Ensure tables exist: `cars`, `mobiles`
- For local dev: Verify `.env.local` is loaded

### CORS Errors

**Problem**: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solutions**:

- Add your frontend domain to `CORS_ORIGINS` in environment variables
- Format: `https://yourdomain.com` (no trailing slash)
- For multiple origins: `https://domain1.com,https://domain2.com`
- Local dev: `http://localhost:4200,http://localhost:3000`

### Column Mapping Errors

**Problem**: "Column 'xyz' does not exist for this product type"

**Solutions**:

- Verify column names match the mapper definitions
- Call `/api/products/scan` with valid columns for the product type
- Check column mapper definitions in `src/mappers/columnMapper.ts`

### Search Returns No Results

**Problem**: Query runs but returns empty data

**Solutions**:

- Verify data exists in Turso database
- Check database migration completed successfully
- Test with simpler query (no conditions) first
- Check condition values are correct data types

---

## Database Schema

### Cars Table

Key columns: `id`, `brand`, `model`, `year`, `price`, `engine_type`, `power`, `torque`, `transmission_type`, etc.

See [cars.ddl](../database/cars.ddl) in original Spring Boot project.

### Mobiles Table

Key columns: `id`, `brand`, `model`, `release_year`, `price`, `ram`, `internal_storage`, `rear_camera_mp`, `battery_capacity`, etc.

See [mobiles.ddl](../database/mobiles.ddl) in original Spring Boot project.

---

## Support & Resources

- **Turso Documentation**: https://docs.turso.tech
- **Vercel Documentation**: https://vercel.com/docs
- **Firebase Documentation**: https://firebase.google.com/docs
- **Express.js Guide**: https://expressjs.com
- **libSQL Client**: https://github.com/libsql/libsql-client-ts

---

## Migration Checklist

Before going production:

- [ ] Firebase service account configured and tested
- [ ] Turso database created and populated with data
- [ ] All environment variables set in Vercel
- [ ] CORS origins include frontend domain
- [ ] Health endpoint responds with UP status
- [ ] Search endpoint returns results with valid Firebase token
- [ ] Angular frontend updated to point to new API URL
- [ ] Frontend CORS requests include Authorization header
- [ ] Error handling tested (invalid token, missing columns, etc.)
- [ ] Performance tested under expected load
- [ ] Monitoring/alerts configured (optional but recommended)

---

**Last Updated**: March 20, 2026
