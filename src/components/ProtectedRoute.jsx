import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);
    });

    return () => unsub();
  }, []);

  // while checking auth state
  if (checking) return null;

  // not logged in → redirect immediately
  if (!user) {
    return <Navigate to="/authentication-portal" replace />;
  }

  return children;
}
