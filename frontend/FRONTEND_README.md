# Legal-Tech Frontend

AI-Powered Document Analysis Platform with authentication and analysis dashboard.

## Features

✅ **User Authentication**
- Phone number based signup with OTP verification via Twilio
- Secure JWT token-based authentication
- Password reset and profile management

✅ **Document Analysis**
- Upload PDF, TXT, DOC, DOCX files
- AI-powered analysis with Gemini API
- Multi-language support (English, Hindi, Bengali)
- Risk scoring and assessment

✅ **Dashboard**
- Authenticated user dashboard
- Document history and management
- Analysis results with detailed insights
- Download reports

✅ **User Experience**
- Responsive design (mobile, tablet, desktop)
- Modern UI with Tailwind CSS
- Real-time upload progress
- Intuitive navigation

## Tech Stack

- **Frontend Framework**: React 18+
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **File Upload**: React Dropzone
- **Build Tool**: Vite

## Setup Instructions

### 1. Prerequisites

- Node.js 16+ and npm/yarn installed
- Backend server running (see backend README)
- Environment variables configured

### 2. Installation

```bash
cd frontend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Or copy from the example:

```bash
cp .env.example .env
```

### 4. Run Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ProtectedRoute.jsx       # Route protection wrapper
│   │   ├── UploadBox.jsx            # File upload component
│   │   ├── ChatBox.jsx              # Chat interface
│   │   ├── RiskScore.jsx            # Risk score display
│   │   ├── SummaryPanel.jsx         # Summary view
│   │   └── PDFViewer.jsx            # PDF viewer
│   ├── context/
│   │   └── AuthContext.jsx          # Auth state management
│   ├── pages/
│   │   ├── Home.jsx                 # Dashboard
│   │   ├── Login.jsx                # Login page
│   │   ├── Signup.jsx               # Signup with OTP
│   │   ├── Profile.jsx              # User profile
│   │   └── Result.jsx               # Analysis results
│   ├── services/
│   │   ├── api.js                   # API client with interceptors
│   │   └── formatResponse.js        # Response formatting
│   ├── hooks/
│   │   └── useUpload.js             # Upload hook
│   ├── utils/
│   │   └── formatResponse.js        # Utility functions
│   ├── App.jsx                      # Main app component
│   └── main.jsx                     # Entry point
├── index.html                       # HTML template
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind CSS config
├── package.json                     # Dependencies
└── .env.example                     # Environment template
```

## Authentication Flow

### Signup (2-Step Process)

1. **Step 1: Register**
   - User enters name, email, phone
   - OTP sent to phone number via Twilio
   - Backend returns userId

2. **Step 2: Verify OTP**
   - User enters 6-digit OTP
   - Sets password (min 8 characters)
   - Confirms password
   - JWT token returned on success

### Login

- Email + Password authentication
- JWT token stored in localStorage
- Used for all subsequent API requests

### Protected Routes

All routes except `/login` and `/signup` require authentication:

- GET `/` → Dashboard (Home page)
- GET `/profile` → User profile
- GET `/result` → Analysis results
- POST `/upload` → Upload document
- POST `/analyze` → Analyze document

## API Integration

### Authentication Endpoints

```javascript
// Login
POST /api/auth/login
{ email, password }

// Signup
POST /api/auth/register
{ email, phone, name }

// Verify OTP
POST /api/auth/verify-otp
{ userId, otp, password }

// Get Current User
GET /api/auth/me
Authorization: Bearer <token>

// Logout
POST /api/auth/logout
Authorization: Bearer <token>
```

### Document Endpoints

```javascript
// Upload document
POST /api/upload
FormData: { file, userType, language }
Authorization: Bearer <token>

// Analyze document
POST /api/ai/analyze
{ contractText, filename, userType, language }
Authorization: Bearer <token>

// Chat/Questions
POST /api/chat
{ contractText, question, history, language }
Authorization: Bearer <token>
```

## Component Usage

### Protected Route

```jsx
import { ProtectedRoute } from './components/ProtectedRoute';

<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>
```

### Using Auth Context

```jsx
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, logout, isAuthenticated } = useAuth();
  
  return (
    <div>
      {isAuthenticated && <p>Welcome, {user.name}!</p>}
    </div>
  );
}
```

### File Upload

```jsx
import { UploadBox } from './components/UploadBox';

export function Dashboard() {
  return <UploadBox />;
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Common Issues

### 1. API Connection Failed

**Problem**: Cannot connect to backend API

**Solution**:
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `.env`
- Verify CORS settings in backend

### 2. Token Expiration

**Problem**: Getting 401 unauthorized

**Solution**:
- Token might have expired
- Re-login to get new token
- Check token expiration in localStorage

### 3. File Upload Fails

**Problem**: File upload returns error

**Solution**:
- Check file size (max 10MB)
- Verify file format is supported
- Ensure backend `/upload` endpoint is running

## Security Considerations

1. **Token Storage**: JWT stored in localStorage (consider httpOnly cookies in production)
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure backend CORS to allow frontend domain
4. **Rate Limiting**: Implement on backend to prevent abuse
5. **Input Validation**: All inputs validated on frontend and backend

## Performance Optimization

- Lazy loading of routes
- Image optimization
- CSS minification via Tailwind
- Code splitting with dynamic imports

## Deployment

### Netlify

```bash
npm run build
# Connect Git repo to Netlify
# Set build command: npm run build
# Set publish directory: dist
```

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/new-feature`
4. Submit pull request

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
1. Check GitHub Issues
2. Review documentation
3. Contact development team

## Changelog

### v1.0.0 (Initial Release)
- User authentication with OTP
- Document upload and analysis
- User dashboard
- Profile management
- Analysis results with risk scoring
