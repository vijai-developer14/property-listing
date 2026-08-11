# Property Listing Platform

A full-stack, multi-tenant property listing platform. Owners list properties with photos; buyers search, filter, and send inquiries.

- **Backend**: Node.js, Express 5, TypeScript, PostgreSQL, Cloudinary (image storage), JWT auth via httpOnly cookies, Swagger docs
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, react-hook-form + Zod

---

## Project Structure

```
server/   → Express + TypeScript API
client/   → Next.js frontend
```

---

## Features

- **Auth** — register/login, JWT access token (30 min) + refresh token (7 days), both as httpOnly cookies
- **Properties** — owner-scoped CRUD, public detail view, "similar properties" recommendations
- **Search** — filter by city, type, BHK, price range; sort by newest/price; cursor-based pagination
- **Images** — up to 10 photos per property via Cloudinary, first upload auto-marked primary
- **Inquiries** — buyers contact owners; rate-limited to 5 per 15 minutes per user; re-sending updates the existing inquiry
- **API docs** — Swagger UI at `/api-docs`

---

## Prerequisites

- Node.js 18+
- PostgreSQL database
- A [Cloudinary](https://cloudinary.com/) account (cloud name, API key, API secret)

---

## Backend Setup (`server/`)

### 1. Install dependencies
```bash
cd server
npm install
```

### 2. Environment variables
Create a `.env` file in `server/`:

```env
# Server
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=property_listing
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Auth
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Database
Set up a PostgreSQL database with tables for `users`, `property`, `property_type`, `property_images`, and `inquiries` matching the columns referenced in the controllers (e.g. `property_name`, `property_price`, `cloudinary_public_id`, `sender_user_id`, etc. — see `swagger.ts` schemas for the full field list per resource).

### 4. Run
The current `package.json` only defines a `test` script placeholder. Since `nodemon` and `tsx` are already dependencies, add scripts like:

```json
"scripts": {
  "dev": "nodemon --exec tsx src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js"
}
```

Then:
```bash
npm run dev
```

API will be available at `http://localhost:3000/api`, docs at `http://localhost:3000/api-docs`.

---

## Frontend Setup (`client/`)

### 1. Install dependencies
```bash
cd client
npm install
```

### 2. Environment variables
Create a `.env.local` file in `client/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Run
```bash
npm run dev
```

App will be available at `http://localhost:3001` (or the port Next.js picks — make sure it matches `CLIENT_URL` in the backend `.env` for CORS to work).

---

## Key API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register a new user |
| POST | `/api/auth/login` | — | Log in, sets cookies |
| POST | `/api/auth/refresh` | refresh cookie | Exchange refresh token for a new access token |
| GET | `/api/auth/me` | required | Get current user |
| POST | `/api/properties` | required | Create property |
| GET | `/api/properties/mine` | required | List own properties |
| PUT | `/api/properties/:id` | required (owner) | Update property |
| DELETE | `/api/properties/:id` | required (owner) | Delete property |
| GET | `/api/properties/:id` | — | Get property detail |
| GET | `/api/properties/:id/similar` | — | Get similar properties |
| GET | `/api/properties/search` | — | Search with filters + cursor pagination |
| GET | `/api/property-types` | — | List property types |
| POST | `/api/property-images/:propertyId` | required (owner) | Upload images (max 10 total) |
| GET | `/api/property-images/:propertyId` | — | List images |
| DELETE | `/api/property-images/:imageId` | required (owner) | Delete an image |
| POST | `/api/inquiries/:propertyId` | required | Send/update an inquiry (rate-limited) |
| GET | `/api/inquiries/mine` | required | Inquiries received on your properties |

Full request/response schemas: `/api-docs` (Swagger UI).

---

## Known Issues / TODO

- Frontend doesn't yet call `/api/auth/refresh` — access tokens expire after 30 min with no silent renewal.
- `uploadPropertyImages` can mark more than one image `is_primary: true` when multiple files are uploaded in the same batch for a property with no existing photos.
- `PUT /api/properties/:id` overwrites all fields from the request body with no per-field defaulting — omitted fields get nulled out.
- Backend `package.json` needs `dev`/`build`/`start` scripts added.
