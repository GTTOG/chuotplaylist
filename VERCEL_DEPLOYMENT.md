# 🚀 Deploy to Vercel - Complete Guide

## ✨ What's Set Up

✅ Frontend (HTML, CSS, JS) in root directory  
✅ Backend (Node.js Express) in `/api` folder  
✅ Both deploy together on Vercel  
✅ API URL auto-detects environment  
✅ Database uses in-memory storage (persists during serverless execution)  

> **Note:** For production with persistent database, upgrade to MongoDB/Firebase (see "Next Steps")

---

## 📋 Pre-Deployment Checklist

Before pushing to GitHub:

- [ ] `.env` file created locally (never commit)
- [ ] `users_db.json` NOT committed (.gitignore has it)
- [ ] `node_modules` NOT committed
- [ ] `api/server.js` exists and is configured
- [ ] `vercel.json` exists and is configured
- [ ] `.vercelignore` exists
- [ ] `package.json` has all dependencies
- [ ] All frontend files (HTML, CSS, JS) in root directory

---

## 🔧 Step 1: Prepare Your Repository (Local)

### Verify File Structure
```
your-repo/
├── api/
│   └── server.js          ← Backend (serverless)
├── index.html             ← Frontend
├── style.css
├── player.js
├── auth.js
├── storage.js
├── device.js
├── package.json           ← Must have!
├── vercel.json            ← Vercel config
├── .vercelignore
├── .env.example
├── .gitignore
├── README.md
└── LICENSE
```

### Test Locally (Optional)

```bash
# Install dependencies
npm install

# Start backend
npm start

# In browser, open index.html
# Should work on http://localhost:3000
```

---

## 🌐 Step 2: Push to GitHub

### Initialize Git
```bash
cd c:\Users\qa\Documents\Tet

# First time only
git init
git add .
git commit -m "Initial commit: Device-locked music player ready for Vercel"
git remote add origin https://github.com/yourusername/xiecchuot-music-player.git
git branch -M main
git push -u origin main
```

### Regular Updates
```bash
git add .
git commit -m "Your changes here"
git push origin main
```

---

## 🚀 Step 3: Deploy to Vercel

### Option A: Using Vercel Web Dashboard (Easiest)

1. **Go to https://vercel.com**
2. **Sign up/Login** (can use GitHub account)
3. **Click "New Project"**
4. **Select your GitHub repository**
5. **Configure Project:**
   - Framework: "Other" (Node.js)
   - Root Directory: "./" (leave as default)
   - Build Command: `npm install` (leave as default)
   - Output Directory: (leave empty)
6. **Click "Deploy"**
7. **Wait for deployment** (~2-3 minutes)
8. **Get your URL:** `https://your-project.vercel.app`

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally (one-time)
npm install -g vercel

# Deploy from project folder
cd c:\Users\qa\Documents\Tet
vercel

# Answer the prompts:
# - Set up and deploy? → Yes
# - Which scope? → Your account
# - Link existing project? → No
# - Project name? → xiecchuot-music-player
# - Directory? → ./
```

---

## ✅ Step 4: Verify Deployment

### Check Deployment Status
1. Go to https://vercel.com/dashboard
2. Click on your project
3. View "Deployments" tab
4. Latest deployment should show "Ready"

### Test Your App

**Open:** `https://your-project.vercel.app`

**Test:**
1. Register a new account
2. Should NOT see "Cannot connect to server" error
3. After registration, should see main app (not frozen)
4. Try to upload a music file
5. Logout and login again
6. **Everything should work!** ✅

### Test Backend API (Optional)

In browser console:
```javascript
fetch('https://your-project.vercel.app/api/health')
  .then(r => r.json())
  .then(console.log)

// Should output:
// {status: "Server is running", environment: "production", dbType: "file"}
```

---

## 🔗 Get Your Live URL

After deployment completes, your URL is:

```
https://[your-project-name].vercel.app
```

You can:
- Share this URL with friends
- Use it for testing across devices
- Use it in resume/portfolio

---

## 📊 Database Information

### Current Setup
- **Type:** File-based JSON storage
- **Location:** `/tmp/users_db.json` (temporary)
- **Persistence:** Lost on Vercel redeploy or after ~15 minutes of inactivity

### For Production (Recommended)

Replace file-based storage with a real database:

1. **MongoDB (Free tier)**
   - Sign up: https://www.mongodb.com/cloud/atlas
   - Create free 512MB database
   - Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
   - Update `api/server.js` to use MongoDB driver

2. **Firebase (Free tier)**
   - Sign up: https://firebase.google.com
   - Create Realtime Database
   - Use firebase SDK in backend

3. **Supabase (Free tier)**
   - Sign up: https://supabase.com
   - Create PostgreSQL database
   - Use Supabase SDK in backend

---

## 🚨 Troubleshooting Deployment

### Error: "Cannot find module 'express'"

**Solution:** 
```bash
# Ensure package.json has all dependencies
npm install express cors bcryptjs dotenv

# Push to GitHub
git add package.json package-lock.json
git commit -m "Update dependencies"
git push origin main

# Redeploy on Vercel (auto-redeploys on push)
```

### Error: "Cannot connect to server"

**Cause:** API URL not configured correctly

**Solution in auth.js:**
```javascript
// Should auto-detect:
// localhost:3000 → http://localhost:3000  (local)
// vercel.app → https://your-project.vercel.app  (production)

// Test in console:
console.log(API_BASE_URL)  // Should show correct URL
```

### Error: "CORS error"

**Solution:** CORS is enabled in `api/server.js`
```javascript
app.use(cors({
    origin: '*',  // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));
```

If still fails, check Network tab in DevTools to see actual error.

### Accounts not persisting

**Expected behavior:** With current file-based DB, accounts persist for current Vercel deployment instance but may be lost on redeploy.

**Solution:** Use MongoDB/Firebase (see "For Production" section above)

---

## 📝 Environment Variables (Optional)

If you need to set environment variables in Vercel:

1. Go to Project Settings → Environment Variables
2. Add variable: `DB_TYPE=file` (or `mongodb`, etc.)
3. Save and redeploy

Current variables used:
- `DB_TYPE` - `file` (default) or `mongodb`
- `NODE_ENV` - automatically set to `production`
- `PORT` - automatically set by Vercel

---

## 🔄 Continuous Deployment

Every time you push to GitHub:

```bash
git add .
git commit -m "Your change description"
git push origin main
```

Vercel will:
1. ✅ Detect the push
2. ✅ Run `npm install`
3. ✅ Build and deploy
4. ✅ Show status in dashboard

No extra steps needed!

---

## 🎯 Next Steps (Future Improvements)

1. **Add MongoDB** - Persistent database across redeployments
2. **Email Verification** - Verify emails during registration
3. **Password Reset** - Allow users to reset forgotten passwords
4. **2FA Authentication** - Two-factor security
5. **Multi-Device Support** - Allow additional devices with verification
6. **CDN for Files** - Store music files in cloud storage (AWS S3, etc.)

---

## ✨ Success Indicators

After deployment, you should see:

✅ Site loads at `https://your-project.vercel.app`  
✅ Can register new account (no server errors)  
✅ Can login with registered account  
✅ Can use music player features  
✅ UI is interactive (not frozen)  
✅ No "Cannot connect to server" errors  

---

## 📞 Support

If deployment fails:

1. **Check Vercel Dashboard**
   - Click project → Deployments → Latest deployment → Logs
   - Look for red error messages

2. **Check GitHub Integration**
   - Vercel Settings → Git → Ensure main branch selected

3. **Common Issues**
   ```bash
   # Too many dependencies? Clean and reinstall
   rm package-lock.json
   npm install
   git add package-lock.json
   git commit -m "Update dependencies"
   git push
   ```

4. **Need help?**
   - Check Vercel docs: https://vercel.com/docs
   - Check our DEBUG_GUIDE.md for frontend issues

---

## 🎉 Enjoy Your Deployment!

Your device-locked music player is now live on the internet! 🌍

**Share your URL:** `https://your-project.vercel.app`

