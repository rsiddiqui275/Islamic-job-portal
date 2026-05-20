# 🚀 Islamic Jobs - Deployment Guide (Vercel + Azure)

## Prerequisites
- [Node.js](https://nodejs.org/) installed
- [.NET 8 SDK](https://dotnet.microsoft.com/) installed
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed
- [Vercel CLI](https://vercel.com/cli) installed
- GitHub account
- Azure account (free tier available)

---

## Part 1: Deploy Backend to Azure (Free Tier)

### Step 1: Login to Azure
```powershell
az login
```

### Step 2: Create Resource Group
```powershell
az group create --name IslamicJobsRG --location "East US"
```

### Step 3: Create Azure SQL Database (Free Tier)
```powershell
# Create SQL Server
az sql server create --name islamicjobsserver --resource-group IslamicJobsRG --location "East US" --admin-user sqladmin --admin-password "YourStrongPassword123!"

# Create Free Database (32GB, limited vCores)
az sql db create --resource-group IslamicJobsRG --server islamicjobsserver --name IslamicJobsDb --edition GeneralPurpose --compute-model Serverless --family Gen5 --capacity 1 --auto-pause-delay 60

# Allow Azure services to access
az sql server firewall-rule create --resource-group IslamicJobsRG --server islamicjobsserver --name AllowAzure --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
```

### Step 4: Get Connection String
```powershell
az sql db show-connection-string --server islamicjobsserver --name IslamicJobsDb --client ado.net
```
Copy the output and replace `<username>` with `sqladmin` and `<password>` with your password.

### Step 5: Deploy API to Azure App Service (Free F1 Tier)
```powershell
cd src/MolanaApp.API

# Create and deploy in one command
az webapp up --name islamic-jobs-api --resource-group IslamicJobsRG --sku F1 --runtime "DOTNET|8.0"
```

### Step 6: Configure App Settings
```powershell
# Set connection string
az webapp config connection-string set --resource-group IslamicJobsRG --name islamic-jobs-api --settings DefaultConnection="Server=tcp:islamicjobsserver.database.windows.net,1433;Database=IslamicJobsDb;User ID=sqladmin;Password=YourStrongPassword123!;Encrypt=True;TrustServerCertificate=False;" --connection-string-type SQLAzure

# Set JWT settings
az webapp config appsettings set --resource-group IslamicJobsRG --name islamic-jobs-api --settings Jwt__Key="MolanaApp-Super-Secret-Key-For-JWT-Token-Generation-2024-Islamic-Job-Portal" Jwt__Issuer="MolanaApp" Jwt__Audience="MolanaAppUsers"

# Enable CORS for Vercel
az webapp cors add --resource-group IslamicJobsRG --name islamic-jobs-api --allowed-origins "https://your-app.vercel.app" "https://*.vercel.app"
```

### Step 7: Apply Database Migrations
```powershell
# Update connection string temporarily for migration
dotnet ef database update --connection "Server=tcp:islamicjobsserver.database.windows.net,1433;Database=IslamicJobsDb;User ID=sqladmin;Password=YourStrongPassword123!;Encrypt=True;"
```

✅ **Your API is now live at:** `https://islamic-jobs-api.azurewebsites.net`

---

## Part 2: Deploy Frontend to Vercel (Free)

### Step 1: Update API URL
Edit `MolanaApp.Web/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://islamic-jobs-api.azurewebsites.net/api'
};
```

### Step 2: Install Vercel CLI
```powershell
npm install -g vercel
```

### Step 3: Build and Deploy
```powershell
cd MolanaApp.Web

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

### Step 4: Answer Vercel Prompts
```
? Set up and deploy? Yes
? Which scope? (Select your account)
? Link to existing project? No
? What's your project's name? islamic-jobs
? In which directory is your code located? ./
? Want to override settings? No
```

✅ **Your frontend is now live at:** `https://islamic-jobs.vercel.app`

---

## Part 3: Final Configuration

### Update Azure CORS with Actual Vercel URL
```powershell
az webapp cors add --resource-group IslamicJobsRG --name islamic-jobs-api --allowed-origins "https://islamic-jobs.vercel.app"
```

### Update Frontend Environment with Actual API URL
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_API_URL` = `https://islamic-jobs-api.azurewebsites.net/api`

Or update the file and redeploy:
```typescript
// environment.prod.ts
apiUrl: 'https://islamic-jobs-api.azurewebsites.net/api'
```

---

## 📱 Test Your PWA

1. Open `https://islamic-jobs.vercel.app` on your phone
2. **Android:** Chrome menu → "Add to Home Screen"
3. **iPhone:** Safari Share → "Add to Home Screen"
4. The mosque icon 🕌 will appear on your home screen!

---

## 💰 Free Tier Limits

| Service | Free Limit |
|---------|------------|
| **Azure App Service F1** | 60 min CPU/day, 1GB RAM |
| **Azure SQL Free** | 100K vCore seconds/month, 32GB |
| **Vercel** | 100GB bandwidth, unlimited deploys |

---

## 🔧 Useful Commands

```powershell
# View API logs
az webapp log tail --resource-group IslamicJobsRG --name islamic-jobs-api

# Restart API
az webapp restart --resource-group IslamicJobsRG --name islamic-jobs-api

# Redeploy frontend
cd MolanaApp.Web && vercel --prod

# Redeploy backend
cd src/MolanaApp.API && az webapp up --name islamic-jobs-api
```

---

## 🆘 Troubleshooting

**API returns 500 error:**
- Check connection string in App Settings
- View logs: `az webapp log tail --resource-group IslamicJobsRG --name islamic-jobs-api`

**CORS error:**
- Add your Vercel URL to Azure CORS settings

**Database connection failed:**
- Ensure firewall allows Azure services
- Verify connection string password

**PWA not installing:**
- Ensure HTTPS is used
- Check manifest.json is loading (F12 → Application → Manifest)
