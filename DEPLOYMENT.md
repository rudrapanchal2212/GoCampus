# GoCampus Deployment Guide 🚀

This guide provides instructions on how to deploy the GoCampus project to **Railway** (Backend) and **Vercel** (Frontend).

## 1. Backend: Railway Deployment

### **Prerequisites**
- A [Railway](https://railway.app/) account.
- Your project pushed to a GitHub repository.

### **Steps**
1. Log in to Railway and click **"New Project"**.
2. Select **"Deploy from GitHub repo"** and choose your repository.
3. Railway will detect the `backend` folder (if you've pointed to it) or the root. Ensure you are deploying the `backend` subdirectory.
4. Go to the **Variables** tab in Railway and add the following environment variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random string.
   - `EMAIL_SERVICE`: e.g., `gmail`.
   - `EMAIL_USER`: Your email address.
   - `EMAIL_PASS`: Your Gmail App Password.
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://gocampus.vercel.app`).
   - `NODE_ENV`: `production`.
5. Railway will automatically deploy. Ensure it provides a public URL (e.g., `https://gocampus-production.up.railway.app`).

---

## 2. Frontend: Vercel Deployment

### **Prerequisites**
- A [Vercel](https://vercel.com/) account.

### **Steps**
1. Log in to Vercel and click **"Add New"** -> **"Project"**.
2. Import your GitHub repository.
3. **Configure the Project**:
   - **Root Directory**: Select `frontend`.
   - **Build Settings**: Vercel should automatically detect **Vite** settings.
4. **Environment Variables**:
   - Add a variable `VITE_API_URL` and set its value to your **Railway Backend URL** (e.g., `https://gocampus-production.up.railway.app`).
5. Click **Deploy**.

---

## 3. Important Tips 💡

- **CORS**: Make sure the `FRONTEND_URL` in Railway precisely matches your Vercel URL (including `https://` but no trailing slash).
- **Google Auth**: If using Google Login, update your [Google Cloud Console](https://console.cloud.google.com/) with the new production redirect URIs and origins.
- **Database**: Ensure your MongoDB Atlas Cluster has a network permission for `0.0.0.0/0` (allow access from anywhere) or specific IP addresses if you have a static IP.

Happy Deploying! 🎉
