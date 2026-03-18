import { useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import {
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function usePresenceHeartbeat() {
  useEffect(() => {
    let intervalId;
    let unsubscribeForceLogout;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // ---------- USER LOGGED OUT ----------
      if (!user) {
        if (intervalId) clearInterval(intervalId);
        if (unsubscribeForceLogout) unsubscribeForceLogout();
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const systemRef = doc(db, "systemSettings", "global");

      // 🔍 READ ROLE ONCE
      const userSnap = await getDoc(userRef);
      const role = userSnap.data()?.role;

      // ---------- MARK ONLINE ----------
      await updateDoc(userRef, {
        isOnline: true,
        lastSeen: serverTimestamp(),
      });

      // ---------- HEARTBEAT ----------
      intervalId = setInterval(() => {
        updateDoc(userRef, {
          lastSeen: serverTimestamp(),
        });
      }, 30_000);

      // ---------- FORCE LOGOUT LISTENER ----------
      unsubscribeForceLogout = onSnapshot(systemRef, async (snap) => {
        if (!snap.exists()) return;
        if (!snap.data()?.forceLogout) return;

        // ❌ DO NOT LOG OUT ADMINS
        if (role === "admin") return;

        try {
          await updateDoc(userRef, {
            isOnline: false,
            lastSeen: serverTimestamp(),
          });
        } finally {
          await signOut(auth);
        }
      });
    });

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (unsubscribeForceLogout) unsubscribeForceLogout();
      unsubscribeAuth();
    };
  }, []);
}
