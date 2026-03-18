// ✅ Path: src/hooks/useUserProfile.js

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { ensureUserProfile } from "../utils/ensureUserProfile";

export default function useUserProfile() {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setAuthUser(u);

      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // ✅ Ensure users/{uid} exists + joinedAt is set (for employee/admin too)
        await ensureUserProfile(u);

        // ✅ Fetch user profile
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setProfile({ id: snap.id, ...snap.data() });
        } else {
          // Fallback (should rarely happen because ensureUserProfile creates doc)
          setProfile({
            name: u.displayName || "User",
            email: u.email || "",
            role: "employee",
            department: "",
            joinedAt: null,
            photoURL: u.photoURL || "",
          });
        }
      } catch (e) {
        console.error("Failed to load user profile:", e);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return { authUser, profile, loading };
}
