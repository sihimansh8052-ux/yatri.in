# Yatri.in

Yatri.in is a full-stack travel web application for discovering hotels, restaurants, tourist attractions, and local experiences around a city or your current location.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB with Mongoose
- Auth: JWT
- Maps: Google Maps JavaScript API

## Features

- Search by city, keyword, or current location
- Nearby hotels, restaurants, attractions, and local experiences
- Filters for budget, rating, distance, and sort order
- Responsive results page with list on the left and map on the right
- Details pages with reviews and map location
- Wishlist / saved places
- Admin dashboard for creating, editing, and deleting listings
- Fallback in-memory demo mode when MongoDB is not running locally

## Demo Accounts

- User: `demo@yatri.in` / `password123`
- Admin: `admin@yatri.in` / `password123`

## Folder Structure

```text
yatri.in/
  backend/
    src/
      config/
      controllers/
      data/
      middleware/
      models/
      routes/
      utils/
    server.js
  frontend/
    src/
      components/
      hooks/
      pages/
      utils/
  docs/
    API.md
```

## Environment Variables

### Backend `backend/.env`

```bash
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/yatriin
JWT_SECRET=replace_with_a_strong_secret
JWT_REFRESH_SECRET=replace_with_a_second_strong_secret
CLIENT_URL=http://localhost:5173
GOOGLE_MAPS_API_KEY=your_google_places_api_key
```

### Frontend `frontend/.env`

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Local Setup

```bash
npm install
npm run dev
```

This starts both backend and frontend servers concurrently. If you want to run them individually, use:
```bash
npm run dev:backend
npm run dev:frontend
```

If MongoDB is available, you can seed the database:

```bash
npm run seed
```

If MongoDB is not running, the backend still starts in fallback mode so auth and search flows work during local UI development.

If `GOOGLE_MAPS_API_KEY` is set in the backend, hotel/restaurant/place discovery uses live Google Places data for city and nearby searches.

## Sample Data

- JavaScript seeds: [backend/src/data/sampleData.js](C:\Users\Administrator\Desktop\yatri.in\backend\src\data\sampleData.js)
- JSON sample: [backend/src/data/sample-data.json](C:\Users\Administrator\Desktop\yatri.in\backend\src\data\sample-data.json)

## Deployment

- Frontend: Vercel
- Backend: Render or Railway
- Database: MongoDB Atlas

Set `VITE_API_BASE_URL` in the frontend deployment to your hosted backend URL.
