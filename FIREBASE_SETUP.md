# 🔥 Firebase Setup Guide — CodeArena Real Authentication

A production-grade auth system with email/password, Google Sign-In, email verification, password reset, login history, and new-device security alerts.

---

## ✅ What you get (in plain English)

| Scenario | Behavior |
|---|---|
| Sign up with `you@gmail.com` + password | Real account created, verification email sent |
| Sign in with **wrong** password | Error: "Invalid email or password." |
| Sign in with friend's email + random password | ❌ Access denied — Firebase rejects |
| Click "Continue with Google" | Real Google account picker appears |
| New device logs in | Email alert sent: "New login from Chrome, Windows, …" |
| Forgot password | Sends a real reset link to the email |
| View profile | See last 10 logins with device & "new device" badge |

**Passwords are bcrypt-hashed by Firebase** — you never see them. Even if someone steals your Firestore, they cannot read passwords.

---

## Step 1 — Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `codearena` → Continue
3. Disable Google Analytics (optional) → Create project

---

## Step 2 — Enable Authentication Methods

Firebase Console → **Authentication** → **Get started** → **Sign-in method**:

1. **Email/Password** → Enable → Save
2. **Google** → Enable → set support email → Save

---

## Step 3 — Create the Firestore Database

1. Firebase Console → **Firestore Database** → **Create database**
2. **Start in production mode** → Next
3. Pick a region → Enable

> We'll add proper security rules in Step 7 — don't worry about test mode.

---

## Step 4 — Register Your Web App & Get Config

1. Firebase Console → **Project Settings** (gear icon)
2. Scroll to **Your apps** → click the Web icon `</>`
3. App nickname: `codearena-web` → Register app
4. Copy the `firebaseConfig` values

---

## Step 5 — Fill in `.env.local`

Open `codearena/.env.local` and replace the placeholders with the values you just copied:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=codearena-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=codearena-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=codearena-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

---

## Step 6 — Add Authorized Domain

Firebase Console → **Authentication** → **Settings** → **Authorized domains**:
- `localhost` is added by default ✓
- When you deploy, add your Vercel domain (e.g. `codearena.vercel.app`)

---

## Step 7 — Apply Firestore Security Rules 🚨 CRITICAL

Without these, **anyone can read or modify any user's data**.

**Option A — Firebase Console (easiest)**
1. Firebase Console → Firestore Database → **Rules** tab
2. Open `codearena/firestore.rules` from this repo
3. Paste the entire contents → **Publish**

**Option B — CLI**
```bash
npm install -g firebase-tools
firebase login
firebase use --add         # select your project
firebase deploy --only firestore:rules
```

The rules enforce:
- A user can only read/write their own profile
- `loginEvents` is write-only by the Cloud Function (clients cannot create or read directly — they go through the app's API)
- `uid`, `email`, `provider` are immutable from the client
- Everything else is denied

---

## Step 8 — Deploy the New-Device Email Alert

This is what makes CodeArena send "New login to your account" emails.

### 8a. Upgrade to Blaze (pay-as-you-go)
Cloud Functions require the Blaze plan, but the free tier is generous:
- 2M invocations/month free
- 400k GB-seconds free

Firebase Console → ⚙️ **Project settings** → **Usage and billing** → **Modify plan** → **Blaze**.

> You won't be charged unless you exceed the free quota.

### 8b. Install Function dependencies
```bash
cd codearena/functions
npm install
```

### 8c. Set up Gmail as the mailer (free)
1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Go to https://myaccount.google.com/apppasswords
4. Create an app password for "Mail / Other (Cloud Function)"
5. Copy the 16-character password

### 8d. Save the secrets securely
```bash
firebase functions:secrets:set GMAIL_EMAIL
# paste your sending address, e.g. codearena.alerts@gmail.com

firebase functions:secrets:set GMAIL_APP_PASSWORD
# paste the 16-char app password
```

### 8e. Deploy
```bash
firebase deploy --only functions
```

### 8f. (Optional) Add location to login alerts
The Cloud Function reads `users/{uid}.lastLoginLocation`. Add a free geo lookup
in your client (e.g. https://ipapi.co/json/) and write the city/country to the
user doc after login.

### Alternative: Use Resend or SendGrid
Replace the `nodemailer.createTransport(...)` block in `functions/index.js`:

```js
// Resend
const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 465,
  secure: true,
  auth: { user: "resend", pass: process.env.RESEND_API_KEY },
});
```

---

## Step 9 — Run the App

```bash
cd codearena
npm run dev
```

Visit:
- http://localhost:3000/signup — create a real account
- http://localhost:3000/login — sign in
- http://localhost:3000/forgot-password — test password reset
- http://localhost:3000/profile — see login history
- http://localhost:3000/dashboard — main app (gated by email verification)

---

## 🧪 Testing the security

| Test | Expected result |
|---|---|
| Sign up `alice@gmail.com` | Verification email sent |
| Sign in `alice@gmail.com` + wrong password | "Invalid email or password." |
| Sign in `alice@gmail.com` + correct password (before verifying) | "Please verify your email." |
| Sign in `bob@gmail.com` (doesn't exist) + any password | "No account found with this email." |
| Sign in unverified user via Google | (skipped — Google already verified) |
| Click "Continue with Google" | Google account picker popup |
| Forgot password for `alice@gmail.com` | Reset email sent |
| Sign in on a new browser | "New device" badge in profile + email alert |

---

## 🚀 Deployment to Vercel

1. Push the repo to GitHub
2. Import the project in https://vercel.com
3. Add the same `NEXT_PUBLIC_FIREBASE_*` env vars in Vercel
4. Add the Vercel domain to **Authentication → Authorized domains**
5. Deploy the functions: `firebase deploy --only functions`

---

## 🛡️ Security Checklist

- [x] Passwords are bcrypt-hashed by Firebase
- [x] Email verification required for email/password accounts
- [x] Google accounts skip email verification (Google already verified)
- [x] Firestore security rules lock down per-user data
- [x] Login events are write-only by the Cloud Function
- [x] Wrong password = access denied
- [x] New device = email alert
- [x] Password reset link expires in 1 hour (Firebase default)
- [x] Generic error message on "forgot password" — doesn't reveal whether an email exists
- [x] Rate limiting via Firebase built-in protection (`auth/too-many-requests`)

---

## 📂 What was added in this upgrade

| File | Purpose |
|---|---|
| `src/app/forgot-password/page.tsx` | Real password-reset flow |
| `src/components/auth/EmailVerificationGate.tsx` | Blocks dashboard until email is verified |
| `src/components/profile/LoginHistory.tsx` | Shows last 10 logins with "new device" badges |
| `functions/index.js` | Cloud Function for new-device email alerts |
| `functions/package.json` | Function dependencies |
| `firestore.rules` | Production security rules |

Modified:
- `src/lib/firebase/auth.ts` — added `resetPassword`, `resendVerificationEmail`, `refreshCurrentUser`, `getLoginHistory`, device-fingerprint detection
- `src/app/login/page.tsx` — "Forgot password" now links to real page
- `src/app/dashboard/page.tsx` — gated behind email verification
- `src/app/profile/page.tsx` — login history section added

---

## ❓ FAQ

**Q: My friend has an account but I don't know her password. Can I sign in?**
A: No. Firebase only accepts the correct password. There is no "back door" — this is by design.

**Q: I clicked "Continue with Google" but it just opened Google's normal login. Where are all the accounts?**
A: Google only shows the account picker if you're already signed in to one or more Google accounts in the browser. If you only have one Google account signed in, that's what you'll see. If you have multiple, you can use Google's "Add another account" button.

**Q: Will I really get an email when someone signs in from a new device?**
A: Only after you complete Step 8 (deploy the Cloud Function). Until then, login events are still saved to Firestore — you can see them in the profile.

**Q: Can the Cloud Function use my real Gmail password?**
A: No — use a **Gmail App Password** (16 chars), not your real password. App passwords are designed exactly for this and can be revoked anytime.

**Q: I see "Email not verified" when I try to log in. What do I do?**
A: Check your inbox (and spam). The verification link is valid for 1 hour. You can click "Resend verification email" on the gate screen.
