# GoCampus Deployment Guide 🚀

This guide provides instructions on how to deploy the GoCampus project to **Render** (Backend) and **Vercel/Netlify** (Frontend).

## 1. Backend: Render Deployment

### **Prerequisites**
- Backend deployed to [Render](https://render.com/): `https://gocampus-yxqb.onrender.com`

### **Environment Variables** (set in Render dashboard):
- `MONGO_URI`: Your MongoDB Atlas connection string.
- `JWT_SECRET`: A secure random string.
- `EMAIL_SERVICE`: e.g., `gmail`.
- `EMAIL_USER`: Your email address.
- `EMAIL_PASS`: Your Gmail App Password.
- `FRONTEND_URL`: Your frontend deploy URL.
- `NODE_ENV`: `production`.

**Backend URL**: `https://gocampus-yxqb.onrender.com`

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
  - Add a variable `VITE_API_URL` and set its value to **Render Backend URL**: `https://gocampus-yxqb.onrender.com`
5. Click **Deploy**.

---

## 3. Important Tips 💡

- **CORS**: Make sure the `FRONTEND_URL` in Railway precisely matches your Vercel URL (including `https://` but no trailing slash).
- **Google Auth**: If using Google Login, update your [Google Cloud Console](https://console.cloud.google.com/) with the new production redirect URIs and origins.
- **Database**: Ensure your MongoDB Atlas Cluster has a network permission for `0.0.0.0/0` (allow access from anywhere) or specific IP addresses if you have a static IP.
---

## 4. Troubleshooting: "Login Failed" Error 🛠️

If you see a red "Login Failed" toast:
1.  **Open Browser Console (F12)**: Check the `Network` tab or `Console`.
2.  If you see `http://localhost:5000/api/users/login`, **Vercel is not using your environment variable!**.
3.  **Fix**: Go to Vercel -> Settings -> Environment Variables. Add `VITE_API_URL` -> `https://gocampus-production.up.railway.app`. **Ensure it starts with `https://`**.
4.  **Redeploy**: You **must** trigger a new deployment for the changes to take effect! (Go to "Deployments" tab -> click three dots -> "Redeploy").
5.  **Relative Pathing Debug**: If the console shows a 404 error at `your-app.vercel.app/your-backend.railway.app/...`, it means the `https://` is missing, and the browser thinks it's a local folder!
6.  Check **Railway Logs**: Ensure the `JWT_SECRET` matches your local secret or `secret123`.

Happy Deploying! 🎉
