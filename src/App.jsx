import { useEffect } from "react";
import Routes from "./Routes";
import usePresenceHeartbeat from "./hooks/usePresenceHeartbeat";

import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase/firebase";

function App() {
  // ✅ existing heartbeat logic (DO NOT TOUCH)
  usePresenceHeartbeat();

  // ✅ global presence handling
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      // 🔥 MARK USER ONLINE ON LOGIN / REFRESH
      try {
        await updateDoc(doc(db, "users", user.uid), {
          isOnline: true,
          lastSeen: serverTimestamp(),
        });
      } catch (err) {
        console.error("Failed to mark user online:", err);
      }

      // 🔻 MARK USER OFFLINE ON TAB CLOSE / BROWSER CLOSE
      const handleBeforeUnload = async () => {
        try {
          await updateDoc(doc(db, "users", user.uid), {
            isOnline: false,
            lastSeen: serverTimestamp(),
          });
        } catch (err) {
          // browser may block async calls here — safe to ignore
          console.warn("Presence cleanup failed:", err);
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    });

    return () => unsubscribe();
  }, []);

  return <Routes />;
}

export default App;
