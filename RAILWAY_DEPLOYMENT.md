# 🚀 Deploy Islamic Jobs to Railway (All-in-One Free)

Railway lets you deploy **Frontend + Backend + Database** all for FREE!

## Prerequisites
- GitHub account
- Railway account (free at [railway.app](https://railway.app))

---

## Step 1: Push Code to GitHub

```powershell
cd c:\Users\Rehan\__project__\molanaApp

# Initialize git
git init
git add .
git commit -m "Initial commit - Islamic Jobs Portal"

# Create GitHub repo and push
# Go to github.com, create new repo "islamic-jobs"
git remote add origin https://github.com/YOUR_USERNAME/islamic-jobs.git
git branch -M main
git push -u origin main
```

---

## Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Choose **"Deploy from GitHub repo"**
4. Select your `islamic-jobs` repository

---

## Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will create a free PostgreSQL instance
4. Click on the PostgreSQL service → **"Variables"** tab
5. Copy the `DATABASE_URL` value

---

## Step 4: Deploy Backend API

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repo again
3. Click on the new service → **"Settings"**
4. Set **Root Directory**: `src`
5. Set **Build Command**: Leave empty (uses Dockerfile)
6. Go to **"Variables"** tab and add:

```
ConnectionStrings__DefaultConnection = [paste DATABASE_URL from PostgreSQL]
DatabaseProvider = PostgreSQL
Jwt__Key = MolanaApp-Super-Secret-Key-For-JWT-Token-Generation-2024-Islamic-Job-Portal
Jwt__Issuer = MolanaApp
Jwt__Audience = MolanaAppUsers
ASPNETCORE_ENVIRONMENT = Production
```

7. Go to **"Settings"** → **"Networking"** → **"Generate Domain"**
8. Note your API URL: `https://xxxxx.railway.app`

---

## Step 5: Deploy Frontend

1. Click **"+ New"** → **"GitHub Repo"**  
2. Select your repo again
3. Click on the new service → **"Settings"**
4. Set **Root Directory**: `MolanaApp.Web`
5. Set **Build Command**: `npm install && npm run build -- --configuration=production`
6. Set **Start Command**: `npx serve dist/molana-app.web/browser -s -p $PORT`
7. Go to **"Variables"** tab and add:

```
NODE_VERSION = 20
```

8. Before deploying, update your `environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://YOUR-API-SERVICE.railway.app/api'
};
```

9. Push the change to GitHub - Railway will auto-deploy!

---

## Step 6: Configure CORS

Update `Program.cs` CORS to include your Railway frontend URL:

```csharp
policy.WithOrigins(
    "http://localhost:4200",
    "https://YOUR-FRONTEND.railway.app"
)
```

Push to GitHub → Railway auto-deploys!

---

## 🎉 Your App is Live!

- **Frontend**: `https://your-frontend.railway.app`
- **Backend API**: `https://your-api.railway.app`
- **Database**: Managed PostgreSQL (automatic)

---

## 💰 Railway Free Tier Limits

| Resource | Free Limit |
|----------|------------|
| **Execution Hours** | 500 hours/month |
| **Memory** | 512MB per service |
| **PostgreSQL** | Shared CPU, 1GB storage |

This is enough for a small production app!

---

## 🔧 Useful Railway Commands

Install Railway CLI:
```powershell
npm install -g @railway/cli
railway login
```

View logs:
```powershell
railway logs
```

Connect to database:
```powershell
railway connect postgres
```

---

## 🆘 Troubleshooting

**Build fails:**
- Check the build logs in Railway dashboard
- Ensure Dockerfile path is correct

**Database connection fails:**
- Verify `DATABASE_URL` is correctly copied
- Check `DatabaseProvider` is set to `PostgreSQL`

**CORS errors:**
- Add your Railway frontend URL to CORS origins
- Redeploy after changing `Program.cs`

**API returns 500:**
- Check logs: Railway dashboard → Service → Logs
- Verify all environment variables are set
