import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const EmployeeGuard = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isEmployee, setIsEmployee] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      setIsEmployee(snap.exists() && snap.data().role === "employee");
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return null;
  if (!isEmployee) return <Navigate to="/" replace />;

  return children;
};

export default EmployeeGuard;
