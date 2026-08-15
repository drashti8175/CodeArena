"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { ArenaUser, getUserProfile, signOut } from "@/lib/firebase/auth";

interface AuthState {
  firebaseUser: FirebaseUser | null;
  arenaUser: ArenaUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [arenaUser, setArenaUser] = useState<ArenaUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const profile = await getUserProfile(fbUser.uid);
          setArenaUser(profile);
        } catch (err) {
          console.error("AuthContext getUserProfile error:", err);
          setArenaUser(null);
        }
      } else {
        setArenaUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const refreshProfile = async () => {
    if (firebaseUser) {
      try {
        const profile = await getUserProfile(firebaseUser.uid);
        setArenaUser(profile);
      } catch (err) {
        console.error("refreshProfile error:", err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, arenaUser, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
