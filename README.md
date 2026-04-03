# ⚡ Premium Calculator — PWA

A beautiful, offline-capable scientific calculator. Installable on Android, iOS, and Desktop.

---

## 📁 File Structure

```
premium-calculator/
├── index.html              ← Main app
├── manifest.json           ← PWA identity (name, icons, colors)
├── sw.js                   ← Service Worker (offline + caching)
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable-192.png
│   └── icon-maskable-512.png
└── README.md
```

---

## 🚀 Deploy to GitHub Pages (Free HTTPS)

> PWAs **require HTTPS**. GitHub Pages provides it for free.

### Step 1 — Create a GitHub repo

1. Go to [github.com](https://github.com) → **New repository**
2. Name it anything, e.g. `premium-calculator`
3. Set it to **Public**
4. Click **Create repository**

### Step 2 — Upload all files

**Option A — via GitHub website (easiest):**
1. Click **Add file → Upload files**
2. Drag and drop the entire folder contents (index.html, manifest.json, sw.js, and the `icons/` folder)
3. Click **Commit changes**

**Option B — via Git CLI:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/premium-calculator.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select `main` branch, `/ (root)` folder
3. Click **Save**
4. Wait ~60 seconds → your app is live at:
   `https://YOUR_USERNAME.github.io/premium-calculator/`

---

## 📱 Install on Android

1. Open the URL in **Chrome**
2. A banner or **⬇ install button** (top-right) will appear
3. Tap → **Install** → done!

## 🍎 Install on iOS

1. Open the URL in **Safari**
2. Tap the **Share** icon (square with arrow)
3. Tap **"Add to Home Screen"**
4. Tap **Add**

## 💻 Install on Desktop (Chrome/Edge)

1. Open the URL
2. Click the **install icon** in the address bar
3. Click **Install**

---

## ✅ PWA Checklist

| Requirement | Status |
|---|---|
| HTTPS | ✅ GitHub Pages |
| manifest.json | ✅ |
| Service Worker | ✅ sw.js |
| Icons (192 + 512) | ✅ |
| Maskable icons | ✅ |
| Offline support | ✅ Cache-first strategy |
| Installable | ✅ beforeinstallprompt |
| iOS compatible | ✅ apple-touch-icon + hint |

---

## 🔧 Testing Locally

```bash
# Python 3
python3 -m http.server 8080
# Then open: http://localhost:8080
```

> Note: `localhost` counts as a secure origin, so the service worker will register correctly.
