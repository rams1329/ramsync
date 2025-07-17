# Complete Deployment Guide: Netlify + Render

## 🎯 Overview
- **Frontend**: Deploy to Netlify (free tier available)
- **Backend**: Deploy to Render (free tier available)

---

## 📋 Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
3. **Render Account** - Sign up at [render.com](https://render.com)

---

## 🚀 Step 1: Prepare Your Code

### 1.1 Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 1.2 Create Environment Configuration
Create `.env.production` in your project root:
```env
VITE_API_URL=https://your-backend-name.onrender.com
```
*(Replace with your actual Render URL later)*

---

## 🌐 Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Click "Get Started for Free"
3. Sign up with GitHub

### 2.2 Create New Web Service
1. Click "New +" button
2. Select "Web Service"
3. Connect your GitHub repository
4. Click "Connect" next to your repo

### 2.3 Configure Web Service
Fill in these settings:
- **Name**: `ramsync-backend` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave empty
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### 2.4 Environment Variables (Optional)
Add these if needed:
- `NODE_ENV`: `production`
- `PORT`: `3001`

### 2.5 Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://your-backend-name.onrender.com`

---

## 💻 Step 3: Update Frontend for Production

### 3.1 Update API URLs
Edit `src/store/clipboardStore.ts`:

```typescript
// Add at the top of the file
const API_URL = import.meta.env.VITE_API_URL || '';

// Update all fetch calls from:
fetch('/api/clipboard/upload')
// To:
fetch(`${API_URL}/api/clipboard/upload`)

// Update all API endpoints:
const response = await fetch(`${API_URL}/api/clipboard/upload`, {
  method: 'POST',
  body: formData,
});

const response = await fetch(`${API_URL}/api/clipboard/pin/${pin}`);

const response = await fetch(`${API_URL}/api/clipboard/latest`);
```

### 3.2 Update Environment File
Update `.env.production` with your actual Render URL:
```env
VITE_API_URL=https://your-actual-backend-name.onrender.com
```

### 3.3 Update CORS in Backend
Edit `server/index.js` to allow your Netlify domain:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-netlify-app.netlify.app'
  ]
}));
```

### 3.4 Commit Changes
```bash
git add .
git commit -m "Update for production deployment"
git push origin main
```

---

## 🎨 Step 4: Deploy Frontend to Netlify

### 4.1 Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Click "Sign up"
3. Sign up with GitHub

### 4.2 Create New Site
1. Click "New site from Git"
2. Choose "GitHub"
3. Authorize Netlify to access your repositories
4. Select your repository

### 4.3 Configure Build Settings
- **Branch**: `main`
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Environment variables**: 
  - Key: `VITE_API_URL`
  - Value: `https://your-backend-name.onrender.com`

### 4.4 Deploy
1. Click "Deploy site"
2. Wait for deployment (2-5 minutes)
3. Note your frontend URL: `https://random-name.netlify.app`

### 4.5 Customize Domain (Optional)
1. Go to Site settings → Domain management
2. Click "Change site name"
3. Enter your preferred name: `ramsync-app`
4. Your URL becomes: `https://ramsync-app.netlify.app`

---

## 🔧 Step 5: Update Backend CORS

### 5.1 Update CORS Settings
Edit `server/index.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-netlify-app.netlify.app'  // Add your actual Netlify URL
  ]
}));
```

### 5.2 Redeploy Backend
```bash
git add .
git commit -m "Update CORS for production"
git push origin main
```

Render will automatically redeploy your backend.

---

## ✅ Step 6: Test Your Deployment

### 6.1 Test Frontend
1. Visit your Netlify URL
2. Try uploading text/files
3. Check if sharing works

### 6.2 Test Backend
1. Visit `https://your-backend-name.onrender.com/api/health`
2. Should return JSON with status

### 6.3 Test Full Flow
1. Upload content on frontend
2. Try retrieving with PIN/latest
3. Test file downloads

---

## 🛠️ Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Check backend CORS settings
   - Ensure frontend URL is allowed

2. **API Not Found**
   - Verify VITE_API_URL is correct
   - Check if backend is running

3. **Build Fails**
   - Check dependencies in package.json
   - Verify build command is correct

4. **Files Not Uploading**
   - Check file size limits
   - Verify backend upload endpoint

---

## 🔄 Updating Your App

### Update Process:
1. Make changes locally
2. Test with `npm run dev`
3. Commit and push to GitHub
4. Both Netlify and Render will auto-deploy

### Manual Redeploy:
- **Netlify**: Site dashboard → "Trigger deploy"
- **Render**: Service dashboard → "Manual Deploy"

---

## 📝 Final URLs

After deployment, you'll have:
- **Frontend**: `https://your-app-name.netlify.app`
- **Backend**: `https://your-backend-name.onrender.com`
- **Health Check**: `https://your-backend-name.onrender.com/api/health`

---

## 💡 Production Tips

1. **Monitor Usage**: Check Render and Netlify dashboards
2. **Custom Domain**: Both services support custom domains
3. **SSL**: Automatically provided by both services
4. **Scaling**: Upgrade to paid plans for better performance
5. **Database**: Consider adding a real database for production

---

## 🆘 Need Help?

If you encounter issues:
1. Check the deployment logs on both platforms
2. Verify environment variables are set correctly
3. Test API endpoints directly
4. Check browser console for errors

That's it! Your RamSync app should now be live on the internet! 🎉 