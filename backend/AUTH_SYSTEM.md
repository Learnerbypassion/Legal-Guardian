# Authentication System Documentation

## Overview
This authentication system uses JWT (JSON Web Tokens) for session management, bcrypt for password hashing, and Twilio for SMS-based phone verification during signup.

## Features
- ✅ Phone number-based signup with OTP verification via Twilio
- ✅ Secure password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Email and phone uniqueness validation
- ✅ Resendable OTP functionality
- ✅ Protected routes with authentication middleware

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

Dependencies added:
- `jsonwebtoken` - JWT generation and verification
- `bcrypt` - Password hashing
- `twilio` - SMS OTP delivery

### 2. Configure Environment Variables
Create a `.env` file in the backend directory with the following:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d

# Other configs
MONGODB_URI=your-mongodb-uri
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your-gemini-key
```

### 3. Get Twilio Credentials
1. Sign up at [Twilio.com](https://www.twilio.com)
2. Get your Account SID and Auth Token from the dashboard
3. Get a verified phone number (or use a Twilio number)
4. Add the phone number to `TWILIO_PHONE_NUMBER` in `.env`

## API Endpoints

### 1. Register (Initiate Signup with Twilio OTP)
**POST** `/api/auth/register`

Request:
```json
{
  "email": "user@example.com",
  "phone": "+1234567890",
  "name": "John Doe"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "userId": "user_id_here",
    "email": "user@example.com",
    "phone": "+1234567890",
    "message": "OTP sent to your phone number"
  }
}
```

### 2. Verify OTP & Complete Signup
**POST** `/api/auth/verify-otp`

Request:
```json
{
  "userId": "user_id_from_register",
  "otp": "123456",
  "password": "SecurePassword123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "phone": "+1234567890",
      "name": "John Doe",
      "isPhoneVerified": true
    }
  }
}
```

### 3. Login
**POST** `/api/auth/login`

Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "phone": "+1234567890",
      "name": "John Doe",
      "userType": "general",
      "preferredLanguage": "English"
    }
  }
}
```

### 4. Resend OTP
**POST** `/api/auth/resend-otp`

Request:
```json
{
  "userId": "user_id_from_register"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "message": "OTP resent to your phone number"
  }
}
```

### 5. Get Current User (Protected)
**GET** `/api/auth/me`

Headers:
```
Authorization: Bearer <your_jwt_token>
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "email": "user@example.com",
    "phone": "+1234567890",
    "name": "John Doe",
    "userType": "general",
    "preferredLanguage": "English",
    "isPhoneVerified": true,
    "createdAt": "2026-04-30T10:00:00Z",
    "updatedAt": "2026-04-30T10:00:00Z"
  }
}
```

### 6. Logout
**POST** `/api/auth/logout`

Headers:
```
Authorization: Bearer <your_jwt_token>
```

Response:
```json
{
  "success": true,
  "message": "Logged out successfully! Please remove the token from client."
}
```

## How to Use Protected Routes

To protect any route, use the `authenticate` middleware:

```javascript
const { authenticate } = require("../middlewares/auth.middleware");

// Example protected route
router.get("/protected-endpoint", authenticate, (req, res) => {
  const userId = req.userId; // Available after authentication
  res.json({ message: "This is a protected route", userId });
});
```

## Signup Flow (Complete Example)

### Step 1: User submits phone and email
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","phone":"+1234567890","name":"John Doe"}'
```
→ User receives OTP via SMS from Twilio

### Step 2: User receives OTP and sets password
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"userId":"<user_id>","otp":"123456","password":"SecurePass123"}'
```
→ User receives JWT token

### Step 3: User can now login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123"}'
```

## Frontend Integration

Store the JWT token in localStorage or sessionStorage:

```javascript
// After signup
const response = await fetch('/api/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, otp, password })
});

const data = await response.json();
localStorage.setItem('token', data.data.token);

// For subsequent requests
fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
});
```

## Security Considerations

1. **JWT_SECRET**: Change this to a strong random string in production
2. **HTTPS**: Always use HTTPS in production
3. **Token Storage**: Consider httpOnly cookies for token storage in production
4. **Password**: Minimum 8 characters enforced
5. **OTP**: Expires in 10 minutes
6. **Rate Limiting**: Consider adding rate limiting to auth endpoints in production

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── auth.controller.js      # Auth endpoints logic
│   ├── middlewares/
│   │   └── auth.middleware.js      # JWT verification
│   ├── routes/
│   │   └── auth.routes.js          # Auth routes
│   ├── services/
│   │   └── auth.service.js         # Auth business logic & Twilio
│   ├── models/
│   │   └── user.model.js           # User schema (updated)
│   └── config/
│       └── env.js                  # Environment config (updated)
├── .env.example                    # Environment template
└── package.json                    # Dependencies (updated)
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common errors:
- `Email or phone number already registered` - User exists
- `Invalid OTP` - Wrong OTP provided
- `OTP has expired` - OTP older than 10 minutes
- `Invalid or expired token` - JWT verification failed
- `User not authenticated` - Missing Authorization header

## Testing the System

### Using Twilio Trial Account
If using a Twilio trial account, you can only send SMS to verified phone numbers. Add your test phone number in the Twilio console.

### Mock Testing (Optional)
For testing without Twilio, modify `auth.service.js` to skip actual SMS:

```javascript
const sendOTP = async (phoneNumber, otp) => {
  // In development, just log it
  if (process.env.NODE_ENV === 'development') {
    console.log(`📱 [DEV] OTP for ${phoneNumber}: ${otp}`);
    return true;
  }
  // Production - actual Twilio
  // ... existing code
};
```

## Future Enhancements

- Add refresh token mechanism
- Implement token blacklisting for logout
- Add rate limiting
- Add email verification
- Add OAuth integrations (Google, GitHub)
- Add two-factor authentication
- Add password reset functionality
