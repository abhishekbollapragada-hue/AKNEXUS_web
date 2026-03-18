import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

const MentorGuard = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isMentor, setIsMentor] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsMentor(false);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists() && snap.data().role === "mentor") {
          setIsMentor(true);
        } else {
          setIsMentor(false);
        }
      } catch (err) {
        console.error("Mentor role check failed:", err);
        setIsMentor(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Checking mentor access...</p>
      </div>
    );
  }

  if (!isMentor) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default MentorGuard;
