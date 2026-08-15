"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Globe, Mail, Loader2, MapPin, Monitor } from "lucide-react";
import { getLoginHistory, type LoginEvent } from "@/lib/firebase/auth";
import { useAuth } from "@/store/AuthContext";

// Best-effort: turn a UA string into a friendly "Chrome on Windows" label
function parseUserAgent(ua: string): { os: string; browser: string } {
  const os =
    /Windows/i.test(ua) ? "Windows" :
      /Mac OS X|macOS/i.test(ua) ? "macOS" :
        /Android/i.test(ua) ? "Android" :
          /iPhone|iPad/i.test(ua) ? "iOS" :
            /Linux/i.test(ua) ? "Linux" : "Unknown OS";

  const browser =
    /Edg\//i.test(ua) ? "Edge" :
      /Chrome\//i.test(ua) ? "Chrome" :
        /Firefox\//i.test(ua) ? "Firefox" :
          /Safari\//i.test(ua) ? "Safari" :
            /OPR\//i.test(ua) ? "Opera" : "Unknown Browser";

  return { os, browser };
}

function formatTimestamp(ts: string | undefined): string {
  if (!ts) return "Just now";
  // Firestore timestamps come back as objects { seconds, nanoseconds } in some flows
  // or as ISO strings. Normalize both.
  let date: Date;
  if (typeof ts === "string") {
    date = new Date(ts);
  } else {
    return "Recently";
  }
  if (isNaN(date.getTime())) return "Recently";
  return date.toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function LoginHistory() {
  const { arenaUser } = useAuth();
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!arenaUser?.uid) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const history = await getLoginHistory(arenaUser.uid, 10);
      if (!cancelled) {
        setEvents(history);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [arenaUser?.uid]);

  return (
    <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-5">
      <h2 className="font-bold text-white mb-4 flex items-center gap-2">
        <Shield size={15} className="text-yellow-400" /> Recent Login Activity
      </h2>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
          <Loader2 size={14} className="animate-spin" /> Loading login history...
        </div>
      ) : events.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No login activity yet.</p>
      ) : (
        <div className="space-y-2">
          {events.map((e, i) => {
            const { os, browser } = parseUserAgent(e.userAgent ?? "");
            return (
              <motion.div
                key={e.id ?? i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 py-2.5 px-3 rounded-lg border text-sm ${e.isNewDevice
                    ? "bg-yellow-900/10 border-yellow-500/30"
                    : "bg-[#0d0d14] border-[#1e1e2a]"
                  }`}
              >
                {e.provider === "google"
                  ? <Globe size={14} className="text-blue-400 shrink-0" />
                  : <Mail size={14} className="text-yellow-400 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-200 font-medium truncate">
                    {browser} on {os}
                    {e.isNewDevice && (
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-yellow-300 bg-yellow-500/20 border border-yellow-500/30 rounded-full px-2 py-0.5">
                        New device
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                    <Monitor size={10} /> {e.provider === "google" ? "Google Sign-In" : "Email + Password"}
                    {e.location && <><span>•</span><MapPin size={10} /> {e.location}</>}
                  </p>
                </div>
                <span className="text-gray-600 text-xs shrink-0">{formatTimestamp(e.timestamp)}</span>
              </motion.div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-600 mt-4 leading-relaxed">
        🛡️ We&apos;ll email you whenever a new device signs in. If you see a session you don&apos;t recognize,
        change your password immediately.
      </p>
    </div>
  );
}
