const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

// ----------------------------------------------------------------
// SECRETS — set with:
//   firebase functions:secrets:set GMAIL_EMAIL
//   firebase functions:secrets:set GMAIL_APP_PASSWORD
// (You can also use SendGrid / Resend by swapping the transporter.)
// ----------------------------------------------------------------
const GMAIL_EMAIL = defineSecret("GMAIL_EMAIL");
const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");

// ----------------------------------------------------------------
// onNewDeviceLogin
// Triggered whenever a new loginEvent document is created.
// If `isNewDevice === true`, email the user a security alert.
// ----------------------------------------------------------------
exports.onNewDeviceLogin = onDocumentCreated(
  {
    document: "loginEvents/{eventId}",
    secrets: [GMAIL_EMAIL, GMAIL_APP_PASSWORD],
    region: "us-central1",
  },
  async (event) => {
    const data = event.data?.data();
    if (!data || !data.isNewDevice) return null;

    const { uid, email, provider, userAgent, timestamp } = data;
    if (!email) return null;

    // Try to enrich with last known IP/location from user doc (optional)
    const userSnap = await db.collection("users").doc(uid).get();
    const userData = userSnap.exists ? userSnap.data() : {};
    const location = userData?.lastLoginLocation || "Unknown location";

    const loginTime = timestamp?.toDate
      ? timestamp.toDate().toUTCString()
      : new Date().toUTCString();

    const subject = "🔐 New login to your CodeArena account";
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#0d0d14;color:#fff;border-radius:16px">
        <h2 style="color:#fbbf24;margin-top:0">New device login detected</h2>
        <p>Hi,</p>
        <p>We noticed a new login to your <strong>CodeArena</strong> account from a device we don&apos;t recognize.</p>
        <table style="width:100%;background:#16161f;border-radius:12px;padding:16px;margin:16px 0;color:#e5e7eb">
          <tr><td style="padding:4px 0;color:#9ca3af">Time</td><td style="padding:4px 0">${loginTime}</td></tr>
          <tr><td style="padding:4px 0;color:#9ca3af">Method</td><td style="padding:4px 0">${provider === "google" ? "Google" : "Email + Password"}</td></tr>
          <tr><td style="padding:4px 0;color:#9ca3af">Device</td><td style="padding:4px 0">${userAgent}</td></tr>
          <tr><td style="padding:4px 0;color:#9ca3af">Location</td><td style="padding:4px 0">${location}</td></tr>
        </table>
        <p>If this was you, no action is needed.</p>
        <p>If you don&apos;t recognize this activity, please reset your password immediately.</p>
        <p style="margin-top:24px">— The CodeArena Team ⚔️</p>
      </div>
    `;

    // Build mailer (Gmail SMTP via app password)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_EMAIL.value(),
        pass: GMAIL_APP_PASSWORD.value(),
      },
    });

    try {
      await transporter.sendMail({
        from: `"CodeArena Security" <${GMAIL_EMAIL.value()}>`,
        to: email,
        subject,
        html,
      });
      console.log(`New-device alert sent to ${email}`);
    } catch (err) {
      console.error("Failed to send security email:", err);
    }

    return null;
  }
);
