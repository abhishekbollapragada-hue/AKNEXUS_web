import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

export async function debugUsersRead() {
  try {
    const snap = await getDocs(collection(db, "users"));
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { ok: true, count: docs.length, first: docs[0] || null, error: null };
  } catch (e) {
    return { ok: false, count: 0, first: null, error: e?.message || String(e) };
  }
}
