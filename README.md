# 🚧 Fix Karachi — Pothole Tracker

A full-stack community platform for reporting, tracking, and resolving potholes across Karachi. Built with the MERN stack, TypeScript on the frontend, and a smart geospatial prioritisation engine.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18 + **TypeScript**, Vite, React Router v6 |
| Styling   | Pure CSS with CSS custom properties     |
| Maps      | React-Leaflet + OpenStreetMap (free)    |
| i18n      | i18next (English + Urdu / RTL support)  |
| Backend   | Node.js + Express.js (ES Modules)       |
| Database  | MongoDB (local) + Mongoose              |
| Auth      | JWT + bcrypt                            |
| Uploads   | Multer (local disk storage)             |
| Package   | pnpm                                    |

---

## Project Structure

```
fix-karachi/
├── backend/
│   ├── src/
│   │   ├── config/           # DB & Multer config
│   │   ├── features/
│   │   │   ├── potholes/     # Model, controller, routes, prioritisation engine
│   │   │   └── admin/        # Admin model, controller, routes
│   │   ├── locales/          # en & ur API response messages
│   │   ├── middleware/        # i18n, auth (JWT), error handler
│   │   └── utils/            # DB seeder
│   ├── uploads/              # Saved pothole images
│   └── .env
└── frontend/
    ├── src/
    │   ├── types/            # Shared TypeScript interfaces
    │   ├── utils/            # Typed Axios API client
    │   ├── context/          # AuthContext (JWT session)
    │   ├── hooks/            # useGeolocation
    │   ├── i18n/             # i18next config + EN/UR JSON
    │   ├── components/
    │   │   ├── common/       # Navbar, Badges, ProtectedRoute, LanguageSwitcher
    │   │   ├── forms/        # ReportForm (multipart + geo)
    │   │   └── map/          # PotholeMap, HeatmapLayer (Leaflet)
    │   ├── pages/
    │   │   ├── public/       # HomePage, ReportPage, MapPage
    │   │   └── admin/        # AdminLoginPage, AdminDashboard
    │   └── styles/           # global.css (design system)
    ├── tsconfig.json
    └── vite.config.ts
```

---

## Prerequisites

- **Node.js** ≥ 18
- **pnpm** (`npm install -g pnpm`)
- **MongoDB** running locally on port 27017

Start MongoDB:
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
net start MongoDB
```

---

## Setup & Run

### 1. Install dependencies

```bash
# Backend
cd fix-karachi/backend
pnpm install

# Frontend
cd ../frontend
pnpm install
```

### 2. Configure environment

Backend `.env` is pre-configured for local MongoDB. Edit `backend/.env` if needed:
```
MONGO_URI=mongodb://localhost:27017/fix_karachi
JWT_SECRET=fix_karachi_super_secret_jwt_key_2024
PORT=5000
```

Frontend `.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_UPLOADS_URL=http://localhost:5000/uploads
```

### 3. Seed the database (creates admin user)

```bash
cd backend
pnpm seed
```

This creates:
- **Email:** `admin@fixkarachi.pk`
- **Password:** `Admin@1234`

### 4. Start both servers

```bash
# Terminal 1 — Backend
cd backend
pnpm dev

# Terminal 2 — Frontend
cd frontend
pnpm dev
```

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:5173      |
| Backend  | http://localhost:5000      |
| API      | http://localhost:5000/api  |
| Health   | http://localhost:5000/api/health |

---

## API Reference

### Public Endpoints

| Method | Endpoint                   | Description                         |
|--------|----------------------------|-------------------------------------|
| POST   | `/api/potholes`            | Submit a pothole report (multipart) |
| GET    | `/api/potholes`            | List all reports (paginated)        |
| GET    | `/api/potholes/:id`        | Get a single report                 |
| GET    | `/api/potholes/nearby`     | Reports within radius (lat/lng/radius) |

### Admin Endpoints (JWT required)

| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| POST   | `/api/admin/login`                | Get JWT token            |
| GET    | `/api/admin/me`                   | Current admin profile    |
| GET    | `/api/admin/stats`                | Dashboard statistics     |
| GET    | `/api/admin/heatmap`              | Geospatial heatmap data  |
| GET    | `/api/admin/potholes`             | All reports (admin view) |
| PATCH  | `/api/admin/potholes/:id/status`  | Update status            |
| PATCH  | `/api/admin/potholes/:id/flag`    | Flag as spam/duplicate   |
| DELETE | `/api/admin/potholes/:id`         | Delete (superadmin only) |

### Report Body (multipart/form-data)

| Field            | Type   | Required |
|------------------|--------|----------|
| `latitude`       | number | ✅        |
| `longitude`      | number | ✅        |
| `images`         | files  | ✅ (1–5)  |
| `reportedSeverity` | 1/2/3 | optional |
| `description`    | string | optional |
| `address`        | string | optional |
| `reporterName`   | string | optional |
| `reporterContact`| string | optional |

---

## Key Features

### 🔥 Smart Prioritisation Engine
Every new report triggers a cluster check: if other active reports exist within **50 metres**, the severity score is automatically boosted.

```
finalScore = (reportedSeverity × 10) + (clusterCount × 5)
```

Score ranges: **1–20 Low** | **21–40 Medium** | **41–100 High**

### 🌍 Urdu / English i18n
- Frontend: `i18next` toggles EN ↔ UR with RTL layout support
- Backend: `Accept-Language` header returns all messages in the correct language

### 🗺️ Maps
- **Public map**: All pothole markers sized by severity score
- **Admin heatmap**: Density visualisation with status colour coding

### 🔒 Role-Based Auth
- `admin`: Can update status, flag reports
- `superadmin`: Can also permanently delete reports

---

## TypeScript

The entire frontend is strictly typed:
- All API responses use generic wrapper types (`ApiResponse<T>`, `PaginatedResponse<T>`)
- All props, state, and event handlers have explicit types
- Shared interfaces live in `src/types/index.ts`
- Run `pnpm typecheck` to validate without building

---

## Production Build

```bash
cd frontend
pnpm build        # Output in dist/

cd ../backend
pnpm start        # NODE_ENV=production
```
