import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase"; // adjust if path differs
import { applyTheme } from "../utils/theme";

export function useUserAppearance() {
  const [theme, setTheme] = useState("system");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setTheme("system");
        applyTheme("system");
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        const t = snap.exists() ? (snap.data()?.appearance?.theme || "system") : "system";
        setTheme(t);
        applyTheme(t);
      } catch (e) {
        console.error("Theme load failed:", e);
        setTheme("system");
        applyTheme("system");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const saveTheme = async (nextTheme) => {
    const user = auth.currentUser;
    if (!user) return;

    setTheme(nextTheme);
    applyTheme(nextTheme);

    const ref = doc(db, "users", user.uid);
    await setDoc(ref, { appearance: { theme: nextTheme } }, { merge: true });
  };

  return { theme, saveTheme, loading };
}
