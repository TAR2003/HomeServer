# Fix: JavaScript Module MIME Type Error

## Error Message
```
Failed to load module script: Expected a JavaScript module script 
but the server responded with a MIME type of "text/html".
```

## Root Cause
1. Nginx proxy was stripping the trailing slash causing path mismatches
2. Frontend nginx wasn't explicitly defining MIME types for `.js` and `.mjs` files
3. Browser was receiving HTML (404 page or index.html) instead of JavaScript files

## Fixes Applied

### 1. Main Nginx (`nginx/nginx.conf`)
**Changed:**
```nginx
proxy_pass http://$frontend_upstream/;  # ❌ Strips path
```

**To:**
```nginx
proxy_pass http://$frontend_upstream;   # ✅ Preserves path
```

Also added header to preserve full URI:
```nginx
proxy_set_header X-Forwarded-Uri $request_uri;
```

### 2. Frontend Nginx (`frontend/nginx.conf`)
**Added explicit MIME types:**
```nginx
types {
    application/javascript js mjs;
    text/css css;
    text/html html;
}
```

This ensures `.js` and `.mjs` files are served with correct `Content-Type: application/javascript` header.

## Deploy on Debian Server

### Step 1: Pull Changes
```bash
cd ~/projects/HomeServer
git pull origin main
```

### Step 2: Rebuild Frontend (MIME types in nginx.conf)
```bash
sudo docker compose build frontend
```

### Step 3: Restart Services
```bash
sudo docker compose down
sudo docker compose up -d
```

### Step 4: Verify Fix

**Test 1: Check if files exist**
```bash
sudo docker exec media-server-frontend ls -la /usr/share/nginx/html/assets/
```
Should show `index-*.js` and other asset files.

**Test 2: Check MIME type**
```bash
curl -I http://localhost/assets/index-[TAB_COMPLETE].js
```
Should show: `Content-Type: application/javascript`

**Test 3: Open in browser**
```bash
# Get your server IP
ip addr show | grep "inet "

# Then open in browser:
http://YOUR_SERVER_IP
```

Should load without errors!

## If Still Not Working

### Debug 1: Check Frontend Container Logs
```bash
sudo docker compose logs frontend | tail -30
```

### Debug 2: Check What Browser is Requesting
Open browser DevTools (F12) → Network tab → Look for failed requests.

If you see:
- ❌ `/index-abc123.js` returning HTML → Path issue
- ❌ `/assets/index-abc123.js` returning 404 → Build issue
- ✅ `/assets/index-abc123.js` returning 200 with `text/html` → MIME type issue (fixed by this update)

### Debug 3: Rebuild Frontend from Scratch
```bash
cd ~/projects/HomeServer
sudo docker compose down
sudo docker compose build --no-cache frontend
sudo docker compose up -d
```

### Debug 4: Check Build Output
```bash
# Enter frontend container
sudo docker exec -it media-server-frontend sh

# Check files
ls -la /usr/share/nginx/html/
ls -la /usr/share/nginx/html/assets/

# Check nginx config
cat /etc/nginx/conf.d/default.conf

# Exit
exit
```

## Expected File Structure in Container

```
/usr/share/nginx/html/
├── index.html           # Main HTML file
├── vite.svg            # Favicon
└── assets/
    ├── index-[hash].js      # Main JS bundle (ES module)
    ├── index-[hash].css     # Styles
    └── [other assets]
```

## Common Issues

### Issue 1: Empty /assets/ folder
**Cause:** Vite build failed during Docker build
**Fix:** Check build logs, rebuild with `--no-cache`

### Issue 2: Files exist but wrong MIME type
**Cause:** Nginx not loading updated config
**Fix:** Restart container or rebuild image

### Issue 3: 404 on all /assets/* requests
**Cause:** Main nginx proxy stripping path
**Fix:** Remove trailing slash from `proxy_pass` (already fixed)

## Verification Checklist

- ✅ Frontend container is running: `sudo docker ps | grep frontend`
- ✅ Files exist in container: `sudo docker exec media-server-frontend ls /usr/share/nginx/html/assets/`
- ✅ Nginx config has MIME types: `sudo docker exec media-server-frontend grep "application/javascript" /etc/nginx/conf.d/default.conf`
- ✅ Browser DevTools shows no 404 errors
- ✅ Browser DevTools shows `Content-Type: application/javascript` for JS files
- ✅ Application loads and displays UI

## Success!
Once all checks pass, you should see the Home Media Server interface load successfully in your browser! 🎉
