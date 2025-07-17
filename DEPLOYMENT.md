# RamSync Deployment Guide

## Frontend Deployment (Netlify)

### Step 1: Deploy Frontend to Netlify

1. **Build the frontend:**
   ```bash
   npm run build:frontend
   ```

2. **Deploy to Netlify:**
   - Push your code to GitHub
   - Go to [Netlify](https://netlify.com) and create account
   - Click "New site from Git"
   - Select your repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Click "Deploy site"

### Step 2: Deploy Backend (Choose one)

#### Option A: Railway (Recommended)
1. Go to [Railway](https://railway.app)
2. Create new project from GitHub
3. Select your repository
4. Set start command: `npm start`
5. Add environment variables if needed
6. Deploy

#### Option B: Render
1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Deploy

#### Option C: Heroku
1. Install Heroku CLI
2. Run: `heroku create your-app-name`
3. Run: `git push heroku main`

### Step 3: Update Frontend to Use Deployed Backend

1. **Create environment file:**
   ```bash
   # .env.production
   VITE_API_URL=https://your-backend-url.com
   ```

2. **Update API calls in store:**
   ```typescript
   // In src/store/clipboardStore.ts
   const API_URL = import.meta.env.VITE_API_URL || '';
   
   // Change fetch calls from:
   fetch('/api/clipboard/upload')
   // To:
   fetch(`${API_URL}/api/clipboard/upload`)
   ```

3. **Redeploy frontend** to Netlify with the updated API URL

## Local Development

```bash
# Install dependencies
npm install

# Start development server (both frontend and backend)
npm run dev

# Frontend only
npm run client

# Backend only
npm run server
```

## Environment Variables

### Backend (.env)
```
PORT=3001
NODE_ENV=production
```

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend-url.com
```

## File Structure for Deployment

```
project/
├── dist/                   # Built frontend (auto-generated)
├── server/                 # Backend code
├── src/                    # Frontend source
├── netlify.toml           # Netlify config
├── package.json           # Dependencies
└── DEPLOYMENT.md          # This file
```

## Quick Deploy Commands

```bash
# Build frontend
npm run build:frontend

# Test production build locally
npm run preview

# Deploy backend (if using Railway CLI)
railway up

# Deploy to Netlify (if using Netlify CLI)
netlify deploy --prod
```

## Important Notes

1. **CORS**: Make sure your backend allows requests from your Netlify domain
2. **File Uploads**: For production, consider using cloud storage (AWS S3, Cloudinary)
3. **Database**: Replace in-memory storage with a real database for production
4. **SSL**: Both frontend and backend should use HTTPS in production 