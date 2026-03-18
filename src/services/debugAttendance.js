import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

export async function debugTopLevelAttendance() {
  const snap = await getDocs(collection(db, "attendance"));
  console.log("TOP-LEVEL attendance docs:", snap.size);
  if (snap.size > 0) {
    console.log("Sample doc:", snap.docs[0].id, snap.docs[0].data());
  }
}
