# Signup Retry & OTP Re-verification Fix

## Problem Fixed ✅
**Before:** If user didn't complete OTP verification, they couldn't:
- Re-register with the same email/phone
- Get a new OTP sent
- Verify their number later

**Now:** Users can:
- Try registering again with same email/phone
- Get a fresh OTP
- Complete verification at their own pace

## How It Works

### Step 1: First Registration Attempt
```
User enters: email, phone, name
→ System creates user in DB (unverified)
→ Sends OTP to phone
→ User gets userId to enter OTP
```

### Step 2: User Closes App / Doesn't Verify
```
User leaves without entering OTP
→ User record stays in DB with isPhoneVerified = false
→ OTP expires after 10 minutes
```

### Step 3: User Tries to Register Again
**Before (BROKEN):** ❌ Error: "Email or phone already registered"

**Now (FIXED):** ✅ System detects user is unverified
→ Generates NEW OTP
→ Sends NEW OTP to same phone
→ Allows user to complete verification

## Implementation Details

### Modified Functions

#### `registerWithPhone()` - Smart Re-registration
```javascript
// Check if user exists
const existingUser = await User.findOne({
  $or: [{ email }, { phone }],
});

// If verified → Block (already has account)
if (existingUser && existingUser.isPhoneVerified) {
  throw new Error("Already registered. Please login.");
}

// If unverified → Allow new OTP
if (existingUser) {
  existingUser.otp = newOTP;
  existingUser.otpExpires = newExpiry;
  existingUser.name = updatedName;
  await existingUser.save();
}

// If doesn't exist → Create new user
else {
  const user = new User({ ... });
  await user.save();
}
```

#### `verifyOTPAndSignup()` - Proper Verification
```javascript
// After OTP is verified:
user.isPhoneVerified = true;
user.password = hashedPassword;
user.otp = null;  // Clear OTP
user.otpExpires = null;
await user.save();
```

#### `resendOTP()` - For Impatient Users
```javascript
// User can request new OTP while on signup screen:
if (user.isPhoneVerified) {
  throw "Already verified";
}
// Generate new OTP and resend
```

## User Flow - Timeline

### Scenario: User Starts Signup But Abandons It

```
Day 1, 2:00 PM
├─ User enters email, phone, name
├─ System creates user (unverified)
├─ OTP sent to phone (expires at 2:10 PM)
├─ User closes app
└─ User never enters OTP ❌

Day 3, 5:00 PM
├─ User tries to sign up again with SAME email/phone
├─ System detects: Account exists but UNVERIFIED
├─ NEW OTP sent to phone (expires at 5:10 PM)
├─ User enters OTP
├─ User creates password
└─ Account is now VERIFIED ✅ & ready to use
```

## Testing the Fix

### Test Case 1: New User Signup
```
1. Phone: 9876543210, Email: test@example.com
2. Receive OTP → Enter it → Verify ✅
3. Set password → Login works ✅
```

### Test Case 2: Incomplete Signup Retry
```
1. Phone: 9876543210, Email: test@example.com
2. Receive OTP → Don't enter it → Close app
3. 10 minutes later...
4. Try signup again with SAME phone/email
5. Receive NEW OTP ✅
6. Enter OTP → Verify → Set password ✅
```

### Test Case 3: Already Verified User Tries to Register Again
```
1. User already verified and logged in
2. They clear cookies and try to signup again
3. System says: "Already registered. Please login." ✅
```

## Database Changes

### User Model Fields
```javascript
isPhoneVerified: Boolean  // Track verification status
otp: String              // Current OTP
otpExpires: Date         // OTP expiry time
password: String         // Only set after verification
```

### User States

| State | isPhoneVerified | otp | password | Can Do |
|-------|-----------------|-----|----------|--------|
| New (incomplete) | false | "123456" | null | Re-register, Resend OTP |
| Complete (verified) | true | null | hashed | Login |
| Needs password reset | true | null | hashed | Reset via forgot-password |

## Benefits

✅ Users can retry if they miss OTP
✅ No data loss - partial signup attempts are preserved
✅ Better UX - users don't get blocked by old registration
✅ Prevents duplicate account creation
✅ Tracks verification properly

## Error Messages

### When User Can't Register Again:
```json
{
  "success": false,
  "error": "Email or phone number already registered. Please login instead."
}
```
→ This means they VERIFIED an account before. They should login, not register.

### When User CAN Retry:
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "message": "New OTP sent to your phone number. Please verify."
  }
}
```
→ Their old signup was incomplete. New OTP sent!

## Code Summary

**File:** `backend/src/services/auth.service.js`
**Function:** `registerWithPhone()`

**Key Logic:**
```javascript
if (existingUser && existingUser.isPhoneVerified) {
  // Verified user - block re-registration
  throw new Error("Already registered. Please login.");
}

if (existingUser && !existingUser.isPhoneVerified) {
  // Unverified user - allow retry with new OTP
  existingUser.otp = generateOTP();
  existingUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await existingUser.save();
}
```

## Next Steps

✅ **Already Fixed** - No additional changes needed
✅ **Test the flow** - Try signing up, not verifying, then signing up again
✅ **Monitor logs** - Check that OTP is resent properly

## Troubleshooting

### User says "I can't sign up again"
→ Check if `isPhoneVerified = true` in database
→ If yes, they're verified - direct them to login
→ If no, system should allow retry

### OTP not being resent
→ Check if user exists in database
→ Check if `isPhoneVerified = false`
→ Check Twilio logs for SMS delivery issues

