import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";

/**
 * Ensures users/{uid} exists and has joinedAt.
 * - Creates doc if missing
 * - Adds joinedAt only if missing
 * - Uses merge so it won't overwrite existing fields
 */
export async function ensureUserProfile(authUser, defaults = {}) {
  if (!authUser?.uid) return;

  const userRef = doc(db, "users", authUser.uid);
  const snap = await getDoc(userRef);

  // If doc doesn't exist -> create it with joinedAt
  if (!snap.exists()) {
    await setDoc(
      userRef,
      {
        name: authUser.displayName || defaults.name || "User",
        email: authUser.email || defaults.email || "",
        role: defaults.role || "employee",
        department: defaults.department || "",
        photoURL: authUser.photoURL || defaults.photoURL || "",
        joinedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return;
  }

  // If doc exists -> add joinedAt only if missing
  const data = snap.data() || {};
  const hasJoinDate =
    !!data.joinedAt || !!data.joinDate || !!data.joiningDate || !!data.createdAt;

  if (!hasJoinDate) {
    await setDoc(userRef, { joinedAt: serverTimestamp() }, { merge: true });
  }
}
