import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";

const AddUser = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("employee");
  const [department, setDepartment] = useState("3D");
  const [active, setActive] = useState(true);

  // ✅ mentor assign
  const [mentors, setMentors] = useState([]);
  const [selectedMentorId, setSelectedMentorId] = useState("");

  const [loading, setLoading] = useState(false);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  // ---- Load mentors list ----
  useEffect(() => {
    const loadMentors = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "mentor"));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
        setMentors(list);
      } catch (err) {
        console.error("Failed to load mentors:", err);
      }
    };

    loadMentors();
  }, []);

  // ---- helper: find existing firestore user doc by email ----
  const findUserDocByEmail = async (emailLower) => {
    const q = query(
      collection(db, "users"),
      where("email", "==", emailLower),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, data: d.data() };
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setRole("employee");
    setDepartment("3D");
    setActive(true);
    setSelectedMentorId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const name = fullName.trim();
    const mail = normalizedEmail;
    const pwd = password;

    if (!name || !mail) {
      alert("Please fill Full Name and Email.");
      return;
    }

    // optional: only required when creating new auth account
    if (pwd && pwd.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    // If role is employee, mentor is optional (you can make required if you want)
    const mentorName =
      mentors.find((m) => m.id === selectedMentorId)?.fullName || null;

    setLoading(true);

    try {
      // 1) If user already exists in Firestore by email, just update that doc
      const existing = await findUserDocByEmail(mail);
      if (existing) {
        await updateDoc(doc(db, "users", existing.id), {
          fullName: name,
          email: mail,
          phone: phone.trim(),
          role,
          department,
          active,

          // ✅ mentor assignment
          mentorId: role === "employee" ? (selectedMentorId || null) : null,
          mentorName: role === "employee" ? mentorName : null,

          updatedAt: serverTimestamp(),
        });

        alert("User profile updated (already existed).");
        resetForm();
        return;
      }

      // 2) If not in Firestore, try create Auth user (needs password)
      if (!pwd) {
        alert("Password is required to create a new account.");
        return;
      }

      let createdUid = null;

      try {
        const cred = await createUserWithEmailAndPassword(auth, mail, pwd);
        createdUid = cred.user.uid;
      } catch (err) {
        // If email already exists in AUTH, still create Firestore profile (fallback)
        if (err?.code === "auth/email-already-in-use") {
          const emailKey = mail.replaceAll(".", "_");
          await setDoc(doc(db, "users", emailKey), {
            fullName: name,
            email: mail,
            phone: phone.trim(),
            role,
            department,
            active,

            // ✅ mentor assignment
            mentorId: role === "employee" ? (selectedMentorId || null) : null,
            mentorName: role === "employee" ? mentorName : null,

            authUid: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            note: "Auth account exists; created by admin without uid link",
          });

          alert(
            "Auth account already exists for this email. Created Firestore profile (not linked to uid)."
          );
          resetForm();
          return;
        }

        throw err;
      }

      // 3) Create Firestore user doc using uid
      await setDoc(doc(db, "users", createdUid), {
        fullName: name,
        email: mail,
        phone: phone.trim(),
        role,
        department,
        active,

        // ✅ mentor assignment
        mentorId: role === "employee" ? (selectedMentorId || null) : null,
        mentorName: role === "employee" ? mentorName : null,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      alert("User created successfully.");
      resetForm();
    } catch (error) {
      console.error("Add user failed:", error);
      alert(error?.message || "Failed to add user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
        Add User
      </h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: 900 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <div>
            <label>Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              style={{ width: "100%", padding: 10, marginTop: 6 }}
            />
          </div>

          <div>
            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              style={{ width: "100%", padding: 10, marginTop: 6 }}
            />
          </div>

          <div>
            <label>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="(Only required for NEW auth user)"
              type="password"
              style={{ width: "100%", padding: 10, marginTop: 6 }}
            />
          </div>

          <div>
            <label>Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              style={{ width: "100%", padding: 10, marginTop: 6 }}
            />
          </div>

          <div>
            <label>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: "100%", padding: 10, marginTop: 6 }}
            >
              <option value="employee">Employee</option>
              <option value="mentor">Mentor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* ✅ BELOW ROLE: Assign mentor dropdown */}
          {role === "employee" && (
            <div>
              <label>Assign Mentor</label>
              <select
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
                style={{ width: "100%", padding: 10, marginTop: 6 }}
              >
                <option value="">Select Mentor</option>
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName || "Unnamed Mentor"}{" "}
                    {m.email ? `(${m.email})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label>Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={{ width: "100%", padding: 10, marginTop: 6 }}
            >
              <option value="3D">3D</option>
              <option value="UI/UX">UI/UX</option>
              <option value="Development">Development</option>
              <option value="HR">HR</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Active User
          </label>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              background: "#2f8f83",
              color: "white",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
