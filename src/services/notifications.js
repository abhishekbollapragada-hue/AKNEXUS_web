import { db, auth } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

/**
 * Subscribe to notifications visible to the logged-in user.
 * ✔ Personal notifications (userId === uid)
 * ✔ Admin broadcasts (type === "admin")
 */
export function subscribeMyNotifications({ max = 20, onChange, onError }) {
  let unsub = null;

  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (!user) {
      onChange([]);
      return;
    }

    const uid = user.uid;
    const colRef = collection(db, "notifications");

    const q = query(
      colRef,
      orderBy("createdAt", "desc"),
      limit(50)
    );

    if (unsub) unsub();

    unsub = onSnapshot(
      q,
      (snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const visible = all.filter((n) => {
          // 1️⃣ personal
          if (n.userId && n.userId === uid) return true;

          // 2️⃣ admin broadcasts
          if (n.type === "admin") {
            return (
              n.target === "all" ||
              n.target === "employee" ||
              n.target === "mentor"
            );
          }

          return false;
        });

        visible.sort((a, b) => {
          const ta = a.createdAt?.toDate?.() || new Date(0);
          const tb = b.createdAt?.toDate?.() || new Date(0);
          return tb - ta;
        });

        onChange(visible.slice(0, max));
      },
      (err) => {
        console.error("[NOTIF] subscribe error:", err);
        onError?.(err);
      }
    );
  });

  return () => {
    unsubscribeAuth?.();
    unsub?.();
  };
}

// --------------------------------------------------
// Mark ONE notification read
// ❗ ONLY personal notifications are updated
// --------------------------------------------------
export async function markNotificationRead(notification) {
  // 🔐 Admin broadcasts have NO userId → do NOT update
  if (!notification?.userId) return;

  await updateDoc(doc(db, "notifications", notification.id), {
    isRead: true,
  });
}

// --------------------------------------------------
// Mark ALL notifications read (personal only)
// --------------------------------------------------
export async function markAllMyNotificationsRead(notifications) {
  const unreadPersonal = notifications.filter(
    (n) => !n?.isRead && n?.userId
  );

  if (unreadPersonal.length === 0) return;

  const batch = writeBatch(db);
  unreadPersonal.forEach((n) => {
    batch.update(doc(db, "notifications", n.id), { isRead: true });
  });

  await batch.commit();
}
