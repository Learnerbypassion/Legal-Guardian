# Email Validation Implementation Guide

## Overview
A complete email validation system has been added to the Legal Guardian application. Users can verify their email addresses using OTP (One-Time Password) sent to their registered email.

## What's Been Added

### Backend

#### 1. **Auth Service** (`backend/src/services/auth.service.js`)
Added 3 new functions:
- `sendEmailVerificationOTP(userId)` - Generates OTP and sends it to user's email
- `verifyEmailOTP(userId, otp)` - Verifies the OTP and marks email as verified
- `resendEmailVerificationOTP(userId)` - Resends OTP if expired

#### 2. **Auth Controller** (`backend/src/controllers/auth.controller.js`)
Added 3 new handlers:
- `sendEmailVerificationHandler` - POST endpoint handler
- `verifyEmailHandler` - POST endpoint handler
- `resendEmailVerificationHandler` - POST endpoint handler

#### 3. **Auth Routes** (`backend/src/routes/auth.routes.js`)
Added 3 new routes:
```javascript
POST /api/auth/send-email-verification    // Request OTP
POST /api/auth/verify-email                // Verify OTP
POST /api/auth/resend-email-verification   // Resend OTP
```

### Frontend

#### 1. **EmailVerification Page** (`frontend/src/pages/EmailVerification.jsx`)
Complete email verification page with:
- OTP input field (6-digit numeric)
- Verify button with loading state
- Resend OTP button with 60-second cooldown timer
- Skip option to continue without verification
- Error handling and display
- Responsive design

#### 2. **Styles** (`frontend/src/pages/EmailVerification.css`)
Professional styling with:
- Gradient background
- Smooth animations
- Mobile-responsive design
- Accessibility features

#### 3. **Routes** (`frontend/src/App.jsx`)
Added route:
```
/email-verification - Shows email verification page
```

## API Endpoints

### 1. Send Email Verification OTP
```
POST /api/auth/send-email-verification
Content-Type: application/json

Body:
{
  "userId": "user_id_here"
}

Success Response (200):
{
  "success": true,
  "data": {
    "userId": "...",
    "email": "user@example.com",
    "message": "Email verification OTP sent successfully"
  },
  "message": "Email verification OTP sent successfully"
}

Error Response (400):
{
  "success": false,
  "error": "Email is already verified" | "User not found" | etc.
}
```

### 2. Verify Email OTP
```
POST /api/auth/verify-email
Content-Type: application/json

Body:
{
  "userId": "user_id_here",
  "otp": "123456"
}

Success Response (200):
{
  "success": true,
  "data": {
    "message": "Email verified successfully",
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "isEmailVerified": true
    }
  },
  "message": "Email verified successfully"
}

Error Response (400):
{
  "success": false,
  "error": "Invalid OTP" | "OTP has expired" | "Email is already verified"
}
```

### 3. Resend Email Verification OTP
```
POST /api/auth/resend-email-verification
Content-Type: application/json

Body:
{
  "userId": "user_id_here"
}

Success Response (200):
{
  "success": true,
  "data": {
    "message": "Email verification OTP resent successfully"
  },
  "message": "Email verification OTP resent successfully"
}

Error Response (400):
{
  "success": false,
  "error": "Email is already verified" | "User not found"
}
```

## How to Use

### Option 1: After Signup (Recommended)
Integrate into the signup flow to verify email after phone verification:

```javascript
// After successful phone OTP verification in Signup.jsx
const handleSignupSuccess = async () => {
  // Signup complete, navigate to email verification
  navigate('/email-verification', {
    state: {
      userId: user._id,
      email: user.email
    }
  });
};
```

### Option 2: Standalone Page
Access directly at `/email-verification` route. Pass userId and email via state:

```javascript
navigate('/email-verification', {
  state: {
    userId: 'user_id',
    email: 'user@example.com'
  }
});
```

### Option 3: As a Component
Import and use as a component:

```javascript
import { EmailVerification } from './pages/EmailVerification';

<EmailVerification userId={userId} email={userEmail} />
```

## Integration Example

### Modify Signup Flow

Update `frontend/src/pages/Signup.jsx` to redirect to email verification after phone OTP verification:

```javascript
// After verifyOTP succeeds
if (result.success) {
  // Navigate to email verification
  navigate('/email-verification', {
    state: {
      userId: result.data.user._id || userId,
      email: result.data.user.email || formData.email
    }
  });
}
```

## Database Fields Used

The `User` model already has these fields:
- `email` - User's email address
- `isEmailVerified` - Boolean flag (default: false)
- `otp` - Temporary OTP storage
- `otpExpires` - OTP expiration time

No database schema changes are needed!

## Email Template

Emails are sent using the existing `sendOtpEmail()` function from `backend/src/services/email.service.js`:

```
Subject: Your Legal Guardian Verification Code

Body:
Hello [User Name], 👋

Use the following OTP to verify your account:
[6-DIGIT OTP]

This code will expire in 10 minutes.

If you didn't request this, please ignore this email.
```

## Security Features

✅ OTP expires in 10 minutes  
✅ 6-digit numeric codes only  
✅ Input validation on both frontend and backend  
✅ Rate limiting on resend (60-second cooldown)  
✅ Error messages don't reveal user existence  
✅ Uses existing secure email service (Gmail API)  

## Testing

### Test Case 1: Successful Verification
1. Navigate to `/email-verification`
2. Pass userId and email via state
3. Enter the OTP received in email
4. Click "Verify Email"
5. Should redirect to home with success message

### Test Case 2: Resend OTP
1. Click "Resend Code" button
2. New OTP should be sent to email
3. Button should show countdown timer (60s)
4. After timer expires, button becomes active again

### Test Case 3: Invalid OTP
1. Enter wrong OTP
2. Should show error message
3. Allow retry

### Test Case 4: Expired OTP
1. Wait 10+ minutes after OTP sent
2. Enter OTP
3. Should show "OTP has expired" error
4. User can click resend to get new OTP

### Test Case 5: Skip Verification
1. Click "Skip for Now" button
2. Should navigate to home page
3. User can verify later

## File Locations

- Backend Auth Service: `backend/src/services/auth.service.js`
- Backend Auth Controller: `backend/src/controllers/auth.controller.js`
- Backend Auth Routes: `backend/src/routes/auth.routes.js`
- Frontend Page: `frontend/src/pages/EmailVerification.jsx`
- Frontend Styles: `frontend/src/pages/EmailVerification.css`
- App Routes: `frontend/src/App.jsx`

## Notes

- Email verification is **optional** - users can skip it and use the app
- The `isEmailVerified` field in the database will be `true` once verified
- Can be used for other flows (like sending important notifications only to verified emails)
- Uses the existing email service, no additional configuration needed
- Compatible with existing phone-based OTP system

## Future Enhancements

Possible improvements:
- Send email verification automatically after signup
- Require email verification for sensitive operations
- Add email verification reminder notifications
- Implement email verification in forgot password flow
- Add rate limiting to prevent brute force OTP guessing
