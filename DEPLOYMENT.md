# Yatri.in Deployment

## 1. MongoDB Atlas

Create a MongoDB Atlas cluster and add this database URL to Render:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/yatriin
```

Allow Render access in Atlas Network Access. For quick testing use `0.0.0.0/0`, then restrict later.

## 2. Backend on Render

Create a Render Web Service from this repository.

Settings:

```txt
Root Directory: backend
Build Command: npm install
Start Command: npm start
Health Check Path: /api/health
```

Environment variables:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=use_a_long_random_secret
JWT_REFRESH_SECRET=use_another_long_random_secret
CLIENT_URLS=http://localhost:5173,https://your-vercel-app.vercel.app
CSRF_PROTECTION=false
```

After the backend is live, test:

```txt
https://your-render-service.onrender.com/api/health
```

Seed Atlas data from your machine:

```bash
cd backend
npm run seed
```

Make sure `backend/.env` temporarily points to the Atlas `MONGODB_URI` before seeding.

## 3. Frontend on Vercel

Create a Vercel project from this repository.

Settings:

```txt
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Environment variable:

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

After Vercel gives you a production URL, add it to Render:

```env
CLIENT_URLS=http://localhost:5173,https://your-vercel-app.vercel.app
```

Redeploy the Render backend after updating `CLIENT_URLS`.

## Final Checks

Open these URLs:

```txt
https://your-render-service.onrender.com/api/health
https://your-vercel-app.vercel.app
```

Then test:

- Login with `demo@yatri.in / password123`
- Search hotels, buses, trains, packages
- Book hotel/bus/train/package
- Admin login with `admin@yatri.in / password123`
