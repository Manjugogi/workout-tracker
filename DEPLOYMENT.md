# Deployment Guide - Render.com

## Prerequisites
- GitHub account
- Render.com account (free)

## Step 1: Push Code to GitHub

1. Initialize git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a new repository on GitHub

3. Push your code:
```bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

## Step 2: Deploy PostgreSQL Database on Render

1. Go to https://render.com and sign in
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `workout-tracker-db`
   - **Database**: `workout_tracker_db`
   - **User**: `workout_user`
   - **Region**: Singapore (or closest to you)
   - **Plan**: Free
4. Click "Create Database"
5. **IMPORTANT**: Copy the "Internal Database URL" - you'll need this later

## Step 3: Deploy Backend Server on Render

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `workout-tracker-api`
   - **Region**: Singapore (same as database)
   - **Branch**: main
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `DATABASE_URL` = (paste the Internal Database URL from Step 2)
   - `JWT_SECRET` = `your_super_secret_jwt_key_change_this_in_production`

5. Click "Create Web Service"

## Step 4: Initialize Database Schema

After deployment completes:

1. Go to your database on Render dashboard
2. Click "Connect" → "External Connection"
3. Use a PostgreSQL client (like pgAdmin or DBeaver) to connect
4. Run the contents of `server/schema.sql` to create tables

**OR** use Render's built-in shell:
1. Go to your web service dashboard
2. Click "Shell" tab
3. Run:
```bash
cd server
node -e "require('./dist/db/index.js').initDb()"
```

## Step 5: Get Your API URL

Your API will be available at:
```
https://workout-tracker-api.onrender.com
```

The full API base URL will be:
```
https://workout-tracker-api.onrender.com/api
```

## Step 6: Update Your React Native App

Update all API_URL constants in your app to use the new URL:
- `src/store/authStore.ts`
- `src/store/protocolStore.ts`
- `src/store/profileStore.ts`
- `src/store/historyStore.ts`
- `src/screens/WorkoutDetailScreen.tsx`

Change from:
```typescript
const API_URL = 'http://192.168.29.215:5000/api';
```

To:
```typescript
const API_URL = 'https://workout-tracker-api.onrender.com/api';
```

## Step 7: Rebuild APK

```bash
cd android
.\gradlew assembleRelease
```

Your APK will be at:
```
android\app\build\outputs\apk\release\app-release.apk
```

## Notes

- **Free tier limitations**: 
  - Database: 1GB storage, expires after 90 days
  - Web service: Spins down after 15 minutes of inactivity (first request may be slow)
  
- **Alternative platforms**:
  - Railway.app (similar to Render)
  - Vercel (for backend) + Supabase (for database)
  - AWS Free Tier
  - Google Cloud Free Tier

## Troubleshooting

### Database connection issues
- Ensure DATABASE_URL is correctly set
- Check that database is in the same region as web service

### CORS errors
- The server already has CORS enabled (`app.use(cors())`)
- If issues persist, update to: `app.use(cors({ origin: '*' }))`

### Build fails
- Check Render logs in the dashboard
- Ensure all dependencies are in package.json
- Verify build command is correct
