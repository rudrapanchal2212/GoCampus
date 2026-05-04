# Backend URL Migration to Render

## Completed ✅
- [x] Create `frontend/.env.example` with `VITE_API_URL=https://gocampus-yxqb.onrender.com`
- [x] Plan confirmed by user

## Remaining ⏳
- Test: `cd frontend && npm run dev` - verify API calls use Render URL in Network tab
- Deploy frontend (Vercel/Netlify) with VITE_API_URL env var set

## Testing
```bash
cd frontend
echo "VITE_API_URL=https://gocampus-yxqb.onrender.com" > .env
npm run dev
```
Check Network tab in browser for API calls using Render URL.
