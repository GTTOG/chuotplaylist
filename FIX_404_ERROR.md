# Fix 404 Error on Vercel - DEBUG GUIDE

## ✅ What Was Fixed

Updated `vercel.json` to properly serve:
- ✅ Static files (HTML, CSS, JS) from root
- ✅ API routes from `/api/server.js`
- ✅ Index.html for all unknown routes (SPA fallback)

---

## 🔄 How to Redeploy

### Method 1: Push to GitHub (Auto-redeploy)

```powershell
cd c:\Users\qa\Documents\Tet

git add vercel.json
git commit -m "Fix Vercel routing - serve static files and API"
git push origin main
```

**Then:**
1. Go to https://vercel.com/dashboard
2. Click your project
3. Watch the deployment complete (2-3 minutes)
4. Try your URL again

### Method 2: Force Redeploy in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click your project
3. Click **Deployments** tab
4. Click the 3-dots on latest deployment
5. Click **Redeploy**
6. Wait for new deployment

---

## 🧪 Test After Redeployment

Open your browser to:
```
https://xiecchuot-music-player.vercel.app
```

You should now see:
✅ Login/Register page (HTML loads)
✅ No 404 error
✅ UI displays correctly

---

## 🔍 If Still Getting 404

### Check 1: Verify Files in Repo

```powershell
# Check if files exist locally
Get-ChildItem -Path "c:\Users\qa\Documents\Tet" -Include "index.html", "*.js", "*.css"

# Should show:
# - index.html
# - auth.js
# - style.css
# - device.js
# - storage.js
# - player.js
# - api/server.js
# - vercel.json
```

### Check 2: Verify Git Committed Everything

```powershell
# Check git status
git status

# Should show: "nothing to commit, working tree clean"

# If files showing as modified or untracked:
git add .
git commit -m "Add all files"
git push origin main
```

### Check 3: Check Vercel Logs

1. Go to https://vercel.com/dashboard
2. Click your project
3. Click latest **Deployment**
4. Click **View Build Logs**
5. Look for errors (red text)
6. Common errors:
   - "Cannot find module" → Missing dependency
   - "File not found" → vercel.json path issue
   - "Build failed" → Check full error message

### Check 4: Clear Vercel Cache

1. Go to Settings → **Project Settings**
2. Scroll down to **Environment**
3. Click **Override Environment Variables** (if you have any)
4. Go to **Deployments**
5. Redeploy latest commit

---

## 📊 Vercel Project Structure (How It Should Look)

In Vercel (after deployment), your project should have:

```
/
├── index.html (served at /)
├── auth.js
├── device.js
├── storage.js
├── player.js
├── style.css
├── api/
│   └── server.js (serverless function)
└── vercel.json (configuration)
```

---

## 🔗 API Routes That Should Work

Test these in browser console:

**Health Check:**
```javascript
fetch('/api/health').then(r => r.json()).then(console.log)
// Should return: {status: "Server is running", ...}
```

**Register:**
```javascript
fetch('/api/register', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    username: 'test',
    email: 'test@example.com',
    password: 'password123',
    deviceId: 'dev123',
    deviceName: 'Firefox'
  })
}).then(r => r.json()).then(console.log)
```

If getting 404 on these → API routes not working
If getting 404 on main page → Static files not working

---

## 🆘 Quick Troubleshooting by Symptom

| Symptom | Cause | Fix |
|---------|-------|-----|
| All pages show 404 | Files not deployed | Redeploy from dashboard |
| Main page missing | index.html not served | Check vercel.json routes |
| API endpoints 404 | api/server.js not deployed | Check api/ folder exists in git |
| Cannot connect to server | API_BASE_URL wrong | Check `/api/health` in console |
| CSS/JS not loading | Static files not served | Clear browser cache (Ctrl+Shift+Del) |

---

## 📝 vercel.json Explanation

```json
{
  "version": 2,
  
  "builds": [
    // Build Node.js app (for /api routes)
    {
      "src": "package.json",
      "use": "@vercel/node"
    },
    // Serve static files
    {
      "src": "index.html",
      "use": "@vercel/static"
    },
    {
      "src": "*.{js,css}",
      "use": "@vercel/static"
    }
  ],
  
  "routes": [
    // API routes go to Express app
    {
      "src": "/api/(.*)",
      "dest": "api/server.js"
    },
    // All other routes serve index.html (for SPA routing)
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

## ✅ Success Indicators

If working correctly:

✅ Main page loads without 404
✅ Can see login/register form
✅ API endpoints respond
✅ No errors in browser console (F12)
✅ Registration works without server error

---

## 🚀 Next Steps After Fix

1. **Push changes:**
   ```powershell
   git push origin main
   ```

2. **Wait for redeploy** (watch https://vercel.com/dashboard)

3. **Test your app** on new deployment

4. **If still failing**, run the debug checks above

---

## 💡 How to Avoid This in Future

- Always test locally first: `npm start`
- Check Vercel logs immediately after deployment
- Verify all files committed to GitHub: `git status`
- Keep vercel.json simple and clear
- Use Vercel documentation for your specific setup

---

**Try the fix and let me know if still getting 404!**
