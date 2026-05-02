# Complete Frontend Implementation Guide

## Overview

The frontend has been completely restructured to support the backend authentication system. This guide explains all the changes, new components, and how to integrate with the backend.

## Architecture

### Core Components

#### 1. **AuthContext** (`src/context/AuthContext.jsx`)
Manages authentication state globally using React Context API.

**Features:**
- Login/Signup/Logout functionality
- JWT token management
- User data persistence
- Automatic auth check on app load
- Error handling

**Usage:**
```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, token, isAuthenticated, login, logout } = useAuth();
}
```

#### 2. **ProtectedRoute** (`src/components/ProtectedRoute.jsx`)
Wrapper component that protects routes requiring authentication.

**Features:**
- Redirects to login if not authenticated
- Shows loading spinner while checking auth
- Re-authentication on page refresh

**Usage:**
```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Pages

#### 1. **Login** (`src/pages/Login.jsx`)
Email and password based login form.

**Features:**
- Email validation
- Show/hide password toggle
- Error messages
- Responsive design
- Link to signup page

**Form Fields:**
- Email (required)
- Password (required, min 8 chars)

#### 2. **Signup** (`src/pages/Signup.jsx`)
Two-step registration process with OTP verification.

**Step 1 - Register:**
- Full Name
- Email
- Phone Number (for OTP)

**Step 2 - Verify OTP:**
- 6-digit OTP code
- Password (min 8 chars)
- Confirm Password
- Resend OTP with 60-second timer

**Features:**
- Form validation at each step
- OTP countdown timer
- Resend OTP functionality
- Back button to change details
- Inline error messages

#### 3. **Home** (`src/pages/Home.jsx`)
Main authenticated dashboard.

**Sections:**
- Welcome message with user name
- Feature cards (Upload, AI Analysis, Results)
- Document upload interface
- How it works guide
- Supported formats info
- Navigation header with user profile
- Responsive footer

**Features:**
- Mobile menu support
- Quick navigation to profile
- Logout functionality
- Responsive grid layout

#### 4. **Result** (`src/pages/Result.jsx`)
Displays analysis results with multiple tabs.

**Tabs:**
1. **Summary** - Executive summary and key points
2. **Clauses** - Individual clause breakdown
3. **Risks** - Identified risks with severity
4. **Recommendations** - Suggested actions

**Features:**
- Risk score visualization
- Statistics cards
- Color-coded risk levels
- Download report functionality
- New analysis button
- Responsive tab layout

#### 5. **Profile** (`src/pages/Profile.jsx`)
User profile and account management.

**Displays:**
- User avatar with initials
- Name and email
- Phone number
- Phone verification status
- Member ID
- Account creation date
- Logout and back buttons

### Components

#### 1. **UploadBox** (`src/components/UploadBox.jsx`)
Drag-and-drop file upload component.

**Features:**
- Drag and drop support
- Click to browse
- Multiple format support (PDF, TXT, DOC, DOCX)
- Max file size validation (10MB)
- User type selection
- Language selection
- Upload progress tracking
- Error handling
- Responsive design

**File Formats:**
- PDF (application/pdf)
- Text files (.txt)
- Word documents (.doc, .docx)

**User Types:**
- General
- Freelancer
- Business Owner
- Student

**Languages:**
- English
- Hindi
- Bengali

### Services

#### API Service (`src/services/api.js`)
Axios instance with interceptors for API communication.

**Features:**
- Base URL configuration
- Auth token injection
- 401 error handling
- Request/response logging
- Error handling middleware

**API Methods:**
```javascript
// Auth endpoints (handled by AuthContext)
api.post('/auth/login', { email, password })
api.post('/auth/register', { email, phone, name })
api.post('/auth/verify-otp', { userId, otp, password })
api.post('/auth/logout')
api.get('/auth/me')

// Document endpoints
uploadPDF(file, options, onProgress)
analyzeContract(payload)
askQuestion(payload)
```

## Authentication Flow

### Complete User Journey

#### 1. **New User - Signup**

```
Signup Page (Step 1)
├── User enters: Name, Email, Phone
├── Click "Continue"
└── API: POST /auth/register
    └── Receives: userId
    └── Twilio sends OTP to phone

Signup Page (Step 2)
├── User enters: OTP, Password, Confirm Password
├── Click "Create Account"
└── API: POST /auth/verify-otp
    └── Receives: JWT token + user data
    └── Stored in localStorage
    └── Redirected to Dashboard

Dashboard
└── Now authenticated, can upload documents
```

#### 2. **Existing User - Login**

```
Login Page
├── User enters: Email, Password
├── Click "Sign In"
└── API: POST /auth/login
    └── Receives: JWT token + user data
    └── Stored in localStorage
    └── Redirected to Dashboard
```

#### 3. **Token Management**

- Token stored in `localStorage` as 'token'
- Attached to all API requests via interceptor
- Automatically cleared on logout
- Re-check on app load

### Protected Routes

All routes except `/login` and `/signup` require authentication:

```
/ → Dashboard (ProtectedRoute)
/profile → Profile (ProtectedRoute)
/result → Results (ProtectedRoute)
/login → Login (Public)
/signup → Signup (Public)
```

## Backend Integration

### Environment Setup

Frontend `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Backend `.env` (example):
```env
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### API Integration Points

#### 1. Registration Flow

```javascript
// Step 1: Register user
POST /api/auth/register
{
  "email": "user@example.com",
  "phone": "+1234567890",
  "name": "John Doe"
}

Response:
{
  "success": true,
  "data": {
    "userId": "user_id",
    "email": "user@example.com",
    "phone": "+1234567890",
    "message": "OTP sent to your phone number"
  }
}

// Step 2: Verify OTP
POST /api/auth/verify-otp
{
  "userId": "user_id_from_register",
  "otp": "123456",
  "password": "SecurePassword123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "isPhoneVerified": true
    }
  }
}
```

#### 2. Login

```javascript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "userType": "general",
      "preferredLanguage": "English"
    }
  }
}
```

#### 3. Document Upload & Analysis

```javascript
POST /api/upload (with auth header)
{
  file: File,
  language: "English",
  userType: "general"
}

Response:
{
  "success": true,
  "data": {
    "documentId": "doc_id",
    "analysis": {
      "summary": "...",
      "riskScore": { "score": 7, "level": "High" },
      "clauses": [...],
      "risks": [...],
      "recommendations": [...]
    }
  }
}
```

## Styling

### Tailwind CSS

The entire frontend uses Tailwind CSS for styling.

**Color Scheme:**
- Primary: Indigo/Blue (`from-indigo-600 to-blue-600`)
- Secondary: Gray tones (`gray-50` to `gray-900`)
- Success: Green (`green-600`)
- Warning: Yellow (`yellow-600`)
- Error: Red (`red-600`)

**Component Examples:**
```jsx
// Button
<button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
  Click me
</button>

// Card
<div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
  Content
</div>

// Gradient
<div className="bg-gradient-to-r from-blue-600 to-indigo-600">
  Gradient background
</div>
```

## Installation & Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
# Edit .env with your backend URL
```

### Step 3: Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:5173`

### Step 4: Build for Production

```bash
npm run build
npm run preview
```

## Development Workflow

### Adding a New Page

```jsx
// src/pages/NewPage.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const NewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Page content */}
    </div>
  );
};
```

### Adding a New Component

```jsx
// src/components/NewComponent.jsx
export const NewComponent = ({ prop1, prop2 }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Component content */}
    </div>
  );
};
```

### Using Protected Routes

```jsx
// In App.jsx
<Route
  path="/new-page"
  element={
    <ProtectedRoute>
      <NewPage />
    </ProtectedRoute>
  }
/>
```

## Testing

### Manual Testing Checklist

- [ ] Signup flow (both steps)
- [ ] OTP verification
- [ ] Login
- [ ] Dashboard loads
- [ ] File upload
- [ ] Analysis results display
- [ ] Profile page
- [ ] Logout
- [ ] Protected routes redirect to login
- [ ] Mobile responsive

### Common Test Cases

```javascript
// Valid signup
Email: test@example.com
Phone: +1234567890
Name: Test User
Password: Test@1234

// Invalid inputs
Empty fields → Shows error
Invalid email → Shows error
Phone too short → Shows error
Password < 8 chars → Shows error
Passwords don't match → Shows error
```

## Troubleshooting

### Issue: "Cannot GET /api/auth/login"

**Solution**: Backend not running or wrong API URL in `.env`

```bash
# Check if backend is running
npm run dev # in backend folder
# Check VITE_API_URL in frontend .env
```

### Issue: "Unauthorized (401)"

**Solution**: Token expired or missing

```javascript
// Clear localStorage and login again
localStorage.removeItem('token');
// Navigate to login
```

### Issue: File upload fails

**Solution**: Check file size, format, and backend

```javascript
// Max file size: 10MB
// Supported formats: PDF, TXT, DOC, DOCX
// Ensure backend /upload endpoint exists
```

### Issue: Styles not loading

**Solution**: Ensure Tailwind CSS is configured

```html
<!-- index.html should include -->
<script src="https://cdn.tailwindcss.com"></script>
```

## Performance Tips

1. **Lazy Loading**: Use React.lazy() for routes
2. **Code Splitting**: Dynamic imports for components
3. **Memoization**: Use React.memo() for expensive components
4. **Image Optimization**: Compress images before upload
5. **Caching**: API responses can be cached

## Security Best Practices

1. **Never expose secrets** in frontend code
2. **Always use HTTPS** in production
3. **Validate all inputs** before sending to API
4. **Sanitize user data** from API responses
5. **Set secure cookie flags** for tokens (httpOnly)
6. **Implement CSRF protection** for forms
7. **Use Content Security Policy** headers

## Deployment Options

### Netlify

```bash
npm run build
# Push to GitHub
# Connect repo to Netlify
# Set publish directory: dist
```

### Vercel

```bash
npm i -g vercel
vercel
```

### Docker

```bash
docker build -t frontend .
docker run -p 3000:3000 frontend
```

### AWS S3 + CloudFront

```bash
npm run build
# Upload dist folder to S3
# Create CloudFront distribution
```

## Next Steps

1. ✅ Backend setup and authentication
2. ✅ Frontend authentication UI
3. ⏳ Document analysis features
4. ⏳ Advanced analytics dashboard
5. ⏳ Mobile app development
6. ⏳ Internationalization (i18n)
7. ⏳ Advanced caching strategies

## Support & Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com)
- [Axios Docs](https://axios-http.com)

## License

MIT License - See LICENSE file

## Contact

For questions or issues: [contact information]

---

**Last Updated**: 2026-05-01
**Version**: 1.0.0
