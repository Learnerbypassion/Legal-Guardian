# Setup Guide: Chat Authentication, Phone Login, & Password Reset

## ✅ Completed Features

### 1. **Chat Authentication (DONE)**
- Users can view analysis without signing in
- Chat feature is **locked for guests**
- Guests see a lock icon with "Sign in to chat with Legal Guardian"
- Clicking the lock prompts them to sign in or create account

**Frontend**: `ChatBox.jsx` - Added auth check before allowing messages

---

### 2. **Phone Number Login (DONE)**
- Phone login now accepts numbers **with or without country code**
- Automatically adds `+91` if no country code provided
- Works with formats like:
  - `9876543210` → `+919876543210`
  - `+91 98765 43210` → `+919876543210`
  - `+1 555 000 0000` → `+1 555 000 0000`

**Frontend**: `Login.jsx`, `Signup.jsx` - Added `normalizePhone()` function
**Backend**: `auth.service.js` - Updated login validation

---

### 3. **Forgot Password API (DONE)**

#### New Routes:
- `POST /api/auth/forgot-password` - Initiate password reset
- `POST /api/auth/verify-reset-otp` - Verify OTP during reset
- `POST /api/auth/reset-password` - Complete password reset
- `POST /api/auth/resend-reset-otp` - Resend OTP

#### Features:
- Reset by **email OR phone number**
- Sends OTP via email (Google API) or SMS (Twilio)
- 10-minute OTP expiration
- Validates new password (min 8 characters)

**Backend Files Modified**:
- `auth.service.js` - Added reset password methods with userName parameter
- `auth.controller.js` - Added password reset handlers
- `auth.routes.js` - Added reset routes
- `email.service.js` - Updated to use Google OAuth2 API with 4 email functions
- `user.model.js` - Added `resetOTP` and `resetOTPExpires` fields
- `config/env.js` - Updated to use CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, EMAIL_USER
- `package.json` - Added `googleapis` dependency

---

### 4. **Email Service with Google OAuth2 API (DONE)**
- Uses Google Gmail API with OAuth2 authentication
- Sends OTP emails for verification and password reset
- Includes branded HTML email templates
- Ready for signup email verification

**File**: `email.service.js`
- `sendOtpEmail(email, userName, otp)` - Email verification OTP
- `sendPasswordResetEmail(email, userName, otp)` - Password reset OTP
- `sendRegistrationEmail(email, userName)` - Welcome email
- `sendLoginEmail(email, userName)` - Login alert email

---

### 5. **Forgot Password Frontend (DONE)**
- 3-step process:
  1. Enter email or phone
  2. Verify OTP (with 60-second timer)
  3. Create new password
- Validates password (min 8 characters, must match confirmation)
- Works on mobile and desktop

**File**: `ForgotPassword.jsx`

---

## 🔧 Environment Variables Needed

Add these to your `.env` file:

```env
# Google OAuth2 Configuration (for sending emails)
CLIENT_ID=your-client-id.apps.googleusercontent.com
CLIENT_SECRET=your-client-secret
REFRESH_TOKEN=your-refresh-token
EMAIL_USER=your-email@gmail.com

# Twilio Configuration (for SMS OTP)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Other Configuration
MONGODB_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

### How to Get Google OAuth2 Credentials:

#### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" → "New Project"
3. Name it "Legal Guardian" (or anything you want)
4. Click "Create"

#### Step 2: Enable Gmail API
1. In the left sidebar, go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click on it and press "Enable"

#### Step 3: Create OAuth2 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Desktop application"
4. Click "Create"
5. Copy the **Client ID** and **Client Secret** (save these!)

#### Step 4: Get Refresh Token
1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click the gear icon ⚙️ in the top right → "Use your own OAuth credentials"
3. Paste your **Client ID** and **Client Secret**
4. On the left, find "Gmail API v1" → expand it
5. Select `https://www.googleapis.com/auth/gmail.send`
6. Click "Authorize APIs"
7. Sign in with your Gmail account
8. Click "Allow" when prompted
9. Click "Exchange authorization code for tokens"
10. Copy the **Refresh Token** (save this!)

#### Step 5: Add to .env
```env
CLIENT_ID=paste-your-client-id-here
CLIENT_SECRET=paste-your-client-secret-here
REFRESH_TOKEN=paste-your-refresh-token-here
EMAIL_USER=your-email@gmail.com
```

---

## 📦 Install Dependencies

After setting up credentials, install the new Google API package:

```bash
cd backend
npm install googleapis
npm run dev
```

---

## 🚀 API Endpoints

### 1. Initiate Password Reset
```bash
POST /api/auth/forgot-password
Body: 
{
  "email": "user@example.com"  // OR
  // "phone": "+919876543210"
}
Response:
{
  "success": true,
  "data": { "userId": "...", "message": "..." }
}
```

### 2. Verify Reset OTP
```bash
POST /api/auth/verify-reset-otp
Body:
{
  "userId": "user_id_from_step_1",
  "otp": "123456"
}
Response:
{
  "success": true,
  "data": { "message": "OTP verified successfully" }
}
```

### 3. Reset Password
```bash
POST /api/auth/reset-password
Body:
{
  "userId": "user_id",
  "otp": "123456",
  "newPassword": "NewPassword123"
}
Response:
{
  "success": true,
  "data": { "message": "Password reset successfully" }
}
```

### 4. Resend Reset OTP
```bash
POST /api/auth/resend-reset-otp
Body:
{
  "userId": "user_id"
}
Response:
{
  "success": true,
  "data": { "message": "OTP resent successfully" }
}
```

---

## 📱 Frontend Routes Added

- `/forgot-password` - Password reset page
- Added link from `/login` page (bottom of form)

---

## 🔐 Security Features

✅ OTP expires after 10 minutes
✅ Password hashing with bcrypt
✅ Phone number validation
✅ Email format validation
✅ Password length validation (min 8 chars)
✅ Unique email and phone constraints

---

## 📝 Testing the Features

### Test Chat Lock:
1. Go to Home page without login
2. Upload a document
3. View analysis
4. Try to click quick questions → should see lock icon
5. Click "Sign In Now" → redirects to login

### Test Phone Login:
1. Sign up with phone: `9876543210` (without country code)
2. Complete signup
3. Login with `9876543210` → should work

### Test Forgot Password:
1. Click "Forgot password?" on login page
2. Enter email or phone
3. Receive OTP
4. Verify OTP
5. Set new password
6. Login with new password

---

## ⚠️ Notes

- Phone numbers are normalized to include country code (+91 for India)
- OTP is sent via:
  - **Email**: Google Gmail API (for password reset)
  - **SMS**: Twilio (for signup and password reset)
- All OTPs are 6 digits
- Email service requires valid Google account with App Password

---

## 🎯 Next Steps (Optional)

1. ✅ Add email verification during signup
2. ✅ Save user analyses to database
3. ✅ Create user profile page to show history
4. ✅ Add social login (Google, GitHub)

---

Feel free to ask if you need help setting up the Google API credentials! 🚀
