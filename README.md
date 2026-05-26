# Diem - Daily Dashboard

Your daily morning dashboard hosted on GitHub Pages. Updates automatically at 7:30 AM ET every day.

## Setup Instructions

### 1. Create a New GitHub Repository

1. Go to **github.com** → **New Repository**
2. Name it: `diem`
3. Make it **Public** (required for GitHub Pages)
4. Click **Create repository**

### 2. Push This Code to GitHub

```bash
cd diem-github-setup
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/diem.git
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repo settings
2. Scroll to **Pages** (left sidebar)
3. **Source:** Select `main` branch
4. **Folder:** Select `/ (root)`
5. Click **Save**

Your site is now live at: `https://YOUR_USERNAME.github.io/diem`

### 4. Point Your Domain

1. Go to **GoDaddy** (your domain registrar)
2. Find **DNS Settings** for `consultusai.com`
3. Add a **CNAME record:**
   - **Name:** `diem`
   - **Value:** `YOUR_USERNAME.github.io`
4. Save and wait ~5 minutes for DNS to propagate

Now you can access: `https://diem.consultusai.com`

### 5. Add to Home Screen (iPhone/Android)

**iPhone:**
1. Open `diem.consultusai.com` in Safari
2. Tap Share → Add to Home Screen
3. Name it "Diem" and tap Add

**Android:**
1. Open `diem.consultusai.com` in Chrome
2. Tap Menu (⋮) → Install app
3. Follow prompts

## How It Works

- **Daily Updates:** GitHub Actions runs `generate-dashboard.js` every day at 7:30 AM ET
- **Fresh Content:** Each day gets new AI news, tips, actions, and article recommendations
- **Zero Server Cost:** Fully hosted on GitHub Pages (free)
- **Zero Security Risk:** No private data exposed, no firewall rules needed
- **Offline Capable:** Works as a PWA (Progressive Web App)

## Files

- `index.html` - Main dashboard page
- `data.json` - Daily content (auto-generated)
- `generate-dashboard.js` - Content generation script
- `manifest.json` - PWA manifest
- `.github/workflows/generate.yml` - Scheduled generation

## Customizing Content

Edit these arrays in `generate-dashboard.js`:
- `aiNews` - Add/remove AI stories
- `tips` - Add/remove daily tips
- `dailyActions` - Change daily actions
- `articles` - Change article recommendations

Then push to GitHub and the workflow will use your updated content.

## Updating the Schedule

To change the update time, edit `.github/workflows/generate.yml`:

```yaml
cron: '30 11 * * *'  # Current: 11:30 AM UTC (7:30 AM ET during daylight saving)
```

Use cron syntax. Examples:
- `'0 12 * * *'` = 12:00 PM UTC (8 AM ET roughly)
- `'30 14 * * *'` = 2:30 PM UTC
- `'0 0 * * *'` = Midnight UTC
