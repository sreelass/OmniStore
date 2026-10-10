# Deploying OmniStore to Microsoft Azure via GitHub Actions

This repository includes automated CI/CD workflows configured for **Microsoft Azure**:
* **Backend:** ASP.NET Core 8 Web API deployed to **Azure App Service (Linux)**.
* **Frontend:** Next.js 14 App Router deployed to **Azure Static Web Apps**.

Workflow file: [`.github/workflows/deploy-azure.yml`](.github/workflows/deploy-azure.yml)

---

## Step 1: Create Azure Resources

### 1. Create Backend (Azure App Service)
1. Go to the [Azure Portal](https://portal.azure.com).
2. Click **Create a resource** $\to$ **Web App**.
3. Configure:
   * **Name:** `omnistore-api` *(or any unique name)*
   * **Publish:** Code
   * **Runtime stack:** .NET 8 (LTS)
   * **Operating System:** Linux
   * **Pricing Plan:** Free F1 or Basic B1
4. Click **Review + create** $\to$ **Create**.

### 2. Create Frontend (Azure Static Web Apps)
1. In the Azure Portal, click **Create a resource** $\to$ **Static Web App**.
2. Configure:
   * **Name:** `omnistore-web`
   * **Plan type:** Free
   * **Deployment details:** Select **Other** (since GitHub Actions will manage deployment via token).
3. Click **Review + create** $\to$ **Create**.

---

## Step 2: Retrieve Deployment Secrets from Azure

### Secret 1: `AZURE_WEBAPP_PUBLISH_PROFILE`
1. Navigate to your newly created **Azure Web App** (`omnistore-api`).
2. In the top toolbar of the Overview page, click **Download publish profile**.
3. Open the downloaded `.PublishSettings` file in a text editor (Notepad, VS Code).
4. Copy the entire XML content.

### Secret 2: `AZURE_STATIC_WEB_APPS_API_TOKEN`
1. Navigate to your **Azure Static Web App** (`omnistore-web`).
2. In the top toolbar of the Overview page, click **Manage deployment token**.
3. Copy the deployment token string.

---

## Step 3: Add Secrets to Your GitHub Repository

1. Navigate to your GitHub repository:
   👉 **[https://github.com/sreelass/OmniStore/settings/secrets/actions](https://github.com/sreelass/OmniStore/settings/secrets/actions)**
2. Click **New repository secret** and add the following:

| Secret Name | Value | Description |
| :--- | :--- | :--- |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | *(Paste XML from Step 2.1)* | Allows GitHub Actions to push code to Azure App Service |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | *(Paste token from Step 2.2)* | Allows GitHub Actions to deploy Next.js to Azure Static Web Apps |
| `NEXT_PUBLIC_API_URL` | `https://<your-app-name>.azurewebsites.net/api` | The public URL of your deployed Azure API backend |

---

## Step 4: Configure App Name in Workflow

In [`.github/workflows/deploy-azure.yml`](.github/workflows/deploy-azure.yml), ensure the `AZURE_WEBAPP_NAME` matches your Web App name:
```yaml
env:
  AZURE_WEBAPP_NAME: 'your-actual-app-service-name'
```

---

## Step 5: Trigger Deployment

Once your secrets are set in GitHub:
* Any `git push` to `main` will automatically trigger the deployment.
* Or manually trigger it anytime:
  1. Go to **[https://github.com/sreelass/OmniStore/actions](https://github.com/sreelass/OmniStore/actions)**
  2. Select **Deploy to Microsoft Azure** on the left.
  3. Click **Run workflow** $\to$ **Run workflow**.
