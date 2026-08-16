import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  reload,
  AuthError,
} from "firebase/auth";
import { doc, setDoc, getDoc, getDocs, collection, query, where, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "./config";

export interface ArenaUser {
  uid: string;
  username: string;
  email: string;
  avatar: string;
  rank: "Bronze" | "Silver" | "Gold" | "Diamond" | "Legend";
  level: number;
  xp: number;
  coins: number;
  streak: number;
  streakTheme: "fire" | "ice" | "galaxy";
  skills: Record<string, number>;
  solvedProblems: string[];
  joinedAt: string;
  provider: "email" | "google";
}

export interface LoginEvent {
  id?: string;
  uid: string;
  email: string;
  provider: "email" | "google";
  timestamp: string;
  userAgent: string;
  ip?: string;
  location?: string;
  isNewDevice: boolean;
}

// Map Firebase error codes to human-readable messages
export function getAuthErrorMessage(error: AuthError): string {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please sign in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/user-not-found":
      return "No account found with this email. Please sign up first.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/invalid-credential":
      return "Invalid email or password. Please check and try again.";
    case "auth/email-not-verified":
      return "Please verify your email before signing in. Check your inbox for the link.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Account temporarily locked. Try again later.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled. Please try again.";
    case "auth/popup-blocked":
      return "Popup was blocked by your browser. Please allow popups for this site.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    default:
      console.error("Auth error:", error);
      return error.message || "Something went wrong. Please try again.";
  }
}

// Create user profile in Firestore
async function createUserProfile(uid: string, data: Omit<ArenaUser, "uid">) {
  await setDoc(doc(db, "users", uid), {
    ...data,
    uid,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });
}

// Update last login timestamp on the user doc.
// NOTE: loginEvents are written only by the Cloud Function (Firestore rules block client writes).
async function recordLogin(uid: string, _email: string, _provider: "email" | "google") {
  try {
    await setDoc(doc(db, "users", uid), { lastLoginAt: serverTimestamp() }, { merge: true });
  } catch {
    // Non-fatal — don't block login if this fails
  }
}

// Get user profile from Firestore
export async function getUserProfile(uid: string): Promise<ArenaUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as ArenaUser) : null;
}

// Sign Up with Email + Password
export async function signUpWithEmail(
  email: string,
  password: string,
  username: string
): Promise<void> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: username });
  await sendEmailVerification(cred.user);
}

// Finalize Signup (creates profile with chosen avatar)
export async function finalizeEmailSignup(avatar: string): Promise<ArenaUser> {
  const user = auth.currentUser;
  if (!user) throw new Error("No user is signed in.");
  if (!user.emailVerified) throw new Error("Email must be verified to create a profile.");

  const profile: Omit<ArenaUser, "uid"> = {
    username: user.displayName || user.email!.split("@")[0],
    email: user.email!,
    avatar,
    rank: "Bronze",
    level: 1,
    xp: 0,
    coins: 100,
    streak: 0,
    streakTheme: "fire",
    skills: {},
    solvedProblems: [],
    joinedAt: new Date().toISOString().split("T")[0],
    provider: "email",
  };

  await createUserProfile(user.uid, profile);
  await recordLogin(user.uid, user.email!, "email");
  return { uid: user.uid, ...profile };
}

// Sign In with Email + Password
export async function signInWithEmail(email: string, password: string): Promise<ArenaUser> {
  const cred = await signInWithEmailAndPassword(auth, email, password);

  // Reject login if email is not verified (except for Google sign-in)
  if (!cred.user.emailVerified) {
    await firebaseSignOut(auth);
    throw {
      code: "auth/email-not-verified",
      message: "Please verify your email before signing in. Check your inbox.",
    } as AuthError;
  }

  let profile = await getUserProfile(cred.user.uid);

  // If the profile does not exist yet (e.g. user hasn't selected their emoji),
  // they will be prompted to create one in the app.
  if (profile) {
    // Record login ONLY after we are sure the user document exists, 
    // otherwise setDoc(..., merge:true) triggers a partial create which fails security rules.
    await recordLogin(cred.user.uid, email, "email");
  }

  return profile as ArenaUser; // could be null if not created yet
}

// Sign In / Sign Up with Google
export async function signInWithGoogle(): Promise<ArenaUser> {
  const cred = await signInWithPopup(auth, googleProvider);
  const { uid, email, displayName, photoURL } = cred.user;

  const existing = await getUserProfile(uid);
  if (existing) {
    await recordLogin(uid, email!, "google");
    return existing;
  }

  // New Google user — create profile
  const profile: Omit<ArenaUser, "uid"> = {
    username: displayName ?? email!.split("@")[0],
    email: email!,
    avatar: "🌐",
    rank: "Bronze",
    level: 1,
    xp: 0,
    coins: 100,
    streak: 0,
    streakTheme: "fire",
    skills: {},
    solvedProblems: [],
    joinedAt: new Date().toISOString().split("T")[0],
    provider: "google",
  };

  await createUserProfile(uid, profile);
  await recordLogin(uid, email!, "google");
  return { uid, ...profile };
}

// Sign Out
export async function signOut() {
  await firebaseSignOut(auth);
}

// Send a "reset your password" email — user clicks the link and picks a new one
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// Resend the email verification link (in case the first one expired)
export async function resendVerificationEmail(): Promise<void> {
  if (!auth.currentUser) throw new Error("No user is currently signed in.");
  await sendEmailVerification(auth.currentUser);
}

// Reload the current user to pick up the latest emailVerified status
export async function refreshCurrentUser(): Promise<void> {
  if (auth.currentUser) await reload(auth.currentUser);
}

// Fetch the last N login events for a user, newest first
export async function getLoginHistory(uid: string, max = 10): Promise<LoginEvent[]> {
  try {
    const q = query(
      collection(db, "loginEvents"),
      where("uid", "==", uid),
      orderBy("timestamp", "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<LoginEvent, "id">) }));
  } catch {
    return [];
  }
}
