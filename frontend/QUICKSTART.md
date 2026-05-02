# Quick Start Guide - Frontend

Get the Legal-Tech frontend running in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- Backend running on `http://localhost:5000`
- 5 minutes of your time

## Step 1: Install Dependencies (1 min)

```bash
cd frontend
npm install
```

## Step 2: Configure Environment (1 min)

```bash
# Copy example environment file
cp .env.example .env

# The .env file should look like:
# VITE_API_URL=http://localhost:5000/api
```

## Step 3: Start Development Server (1 min)

```bash
npm run dev
```

You should see:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

## Step 4: Open in Browser (1 min)

Visit: `http://localhost:5173`

You should see the login page!

## Step 5: Test the Flow (1 min)

### Option A: Test with Signup
1. Click "Sign up" link
2. Enter test credentials:
   - Name: `Test User`
   - Email: `test@example.com`
   - Phone: `+1234567890` (must be valid E.164 format)
3. Wait for OTP (check backend console for OTP in dev mode)
4. Enter OTP + password
5. Click "Create Account"
6. You're in the dashboard!

### Option B: Test with Login
1. Enter credentials from above
2. Click "Sign In"
3. You're in the dashboard!

## Common Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## File Structure Quick Overview

```
frontend/
├── src/
│   ├── pages/          # Page components
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Home.jsx
│   │   ├── Result.jsx
│   │   └── Profile.jsx
│   ├── components/     # Reusable components
│   │   ├── ProtectedRoute.jsx
│   │   └── UploadBox.jsx
│   ├── context/        # State management
│   │   └── AuthContext.jsx
│   └── services/       # API calls
│       └── api.js
├── index.html          # Entry HTML
├── App.jsx            # Main component
├── main.jsx           # App entry point
└── package.json       # Dependencies
```

## Key Routes

```
/login              → Login page
/signup             → Signup page
/                   → Dashboard (protected)
/result             → Results (protected)
/profile            → Profile (protected)
```

## What's Included

✅ Complete authentication system
✅ Login & signup with OTP
✅ Protected routes
✅ User profile management
✅ Document upload interface
✅ Analysis results dashboard
✅ Responsive mobile design
✅ Modern Tailwind UI

## Troubleshooting

### Port 5173 already in use?
```bash
npm run dev -- --port 3000
```

### Backend not connecting?
1. Verify backend is running: `http://localhost:5000`
2. Check `.env` file has correct `VITE_API_URL`
3. Check browser console for error messages

### Styles look broken?
1. Check browser console for Tailwind CSS errors
2. Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
3. Clear browser cache

### OTP not arriving?
1. Check backend console for OTP (development mode)
2. Verify Twilio credentials in backend `.env`
3. Check phone number format: `+1234567890`

## Next Steps

1. Explore the codebase
2. Read `IMPLEMENTATION_GUIDE.md` for detailed docs
3. Check `FRONTEND_README.md` for complete reference
4. Try uploading a test document
5. View analysis results

## Useful Tips

- **Hot Reload**: Changes save automatically
- **React DevTools**: Install browser extension for debugging
- **Network Tab**: Use to inspect API calls
- **Console**: Check for error messages
- **Local Storage**: Token stored at `localStorage.getItem('token')`

## Example Test Credentials

After signup, use these to login:
```
Email: test@example.com
Password: TestPassword123
```

## Production Deployment

```bash
# Build
npm run build

# Deploy 'dist' folder to:
# - Netlify
# - Vercel
# - GitHub Pages
# - Your own server
```

## Need Help?

1. Check error messages in browser console
2. Read `IMPLEMENTATION_GUIDE.md`
3. Review `FRONTEND_README.md`
4. Check backend logs for API errors

## Estimated Time

- Setup: ~5 minutes
- First test: ~2 minutes
- Total: ~7 minutes

**You're ready to go! 🚀**

---

Last Updated: 2026-05-01
