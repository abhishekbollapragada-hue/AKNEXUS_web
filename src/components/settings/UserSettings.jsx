import React, { useMemo, useState, useEffect } from "react";
import Icon from "../AppIcon"; // 🔧 CHANGED path
import Button from "../ui/Button"; // 🔧 CHANGED path
import useUserProfile from "../../hooks/useUserProfile"; // 🔧 CHANGED path

import { auth, db } from "../../firebase/firebase"; // 🔧 CHANGED path
import {
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { applyTheme } from "../../utils/theme"; // 🔧 CHANGED path

/* ======================= UI HELPERS ======================= */

const TabButton = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition
      ${
        active
          ? "bg-primary text-primary-foreground border-primary/30"
          : "bg-card hover:bg-muted border-border"
      }`}
    type="button"
  >
    <Icon name={icon} size={18} />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const Field = ({ label, value, onChange, placeholder, disabled = false }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-foreground">{label}</label>
    <input
      disabled={disabled}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={`w-full h-11 px-4 rounded-xl border outline-none transition
        ${
          disabled
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-card"
        }
        border-border focus:border-primary/60`}
    />
  </div>
);

const Toggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border bg-card">
    <div className="space-y-1">
      <p className="text-sm font-medium">{label}</p>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>

    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full transition border
        ${checked ? "bg-primary border-primary/40" : "bg-muted border-border"}`}
      type="button"
    >
      <span
        className={`absolute top-0.5 w-6 h-6 rounded-full bg-card shadow transition
          ${checked ? "left-5" : "left-0.5"}`}
      />
    </button>
  </div>
);

const Card = ({ title, subtitle, children, right }) => (
  <div className="bg-card rounded-2xl border border-border shadow-warm-md">
    <div className="p-5 border-b border-border flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Banner = ({ type, title, message, onClose }) => {
  const styles =
    type === "success"
      ? "border-success/30 bg-success/10"
      : "border-error/30 bg-error/10";

  return (
    <div className={`rounded-xl border p-4 flex justify-between ${styles}`}>
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <button onClick={onClose}>
        <Icon name="X" size={16} />
      </button>
    </div>
  );
};

/* ======================= MAIN COMPONENT ======================= */

// 🔧 CHANGED: accepts role as prop
const UserSettings = ({ role }) => {
  const { profile, loading } = useUserProfile();

  const user = useMemo(() => ({
    name: profile?.name || "",
    email: profile?.email || "",
    role: profile?.role || role,
    department: profile?.department || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
  }), [profile, role]);

  const [tab, setTab] = useState("profile");

  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  const [inAppNotifs, setInAppNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);

  const [theme, setTheme] = useState("system");
  const [themeLoaded, setThemeLoaded] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [banner, setBanner] = useState(null);

  /* ===== hydrate profile ===== */
  useEffect(() => {
    setFullName(user.name);
    setDepartment(user.department);
    setPhone(user.phone);
    setLocation(user.location);
  }, [user]);

  /* ===== load theme + notifications ===== */
  useEffect(() => {
    const load = async () => {
      const u = auth.currentUser;
      if (!u) return;

      const snap = await getDoc(doc(db, "users", u.uid));
      const data = snap.data() || {};

      setTheme(data?.appearance?.theme || "system");
      applyTheme(data?.appearance?.theme || "system");

      setInAppNotifs(data?.notifications?.inApp ?? true);
      setEmailNotifs(data?.notifications?.email ?? false);

      setThemeLoaded(true);
    };
    load();
  }, []);

  const handleSaveProfile = async () => {
    const u = auth.currentUser;
    if (!u) return;

    setIsSaving(true);
    await updateDoc(doc(db, "users", u.uid), {
      name: fullName,
      department,
      phone,
      location,
      updatedAt: serverTimestamp(),
    });

    setIsSaving(false);
    setBanner({ type: "success", title: "Saved", message: "Profile updated" });
  };

  const saveTheme = async (t) => {
    setTheme(t);
    applyTheme(t);
    await setDoc(doc(db, "users", auth.currentUser.uid), {
      appearance: { theme: t },
    }, { merge: true });
  };

  const saveNotifications = async (n) => {
    await setDoc(doc(db, "users", auth.currentUser.uid), {
      notifications: n,
    }, { merge: true });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {banner && (
        <Banner {...banner} onClose={() => setBanner(null)} />
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT */}
        <div className="col-span-12 lg:col-span-3 space-y-2">
          <TabButton active={tab === "profile"} icon="User" label="Profile" onClick={() => setTab("profile")} />
          <TabButton active={tab === "notifications"} icon="Bell" label="Notifications" onClick={() => setTab("notifications")} />
          <TabButton active={tab === "appearance"} icon="Palette" label="Appearance" onClick={() => setTab("appearance")} />
        </div>

        {/* RIGHT */}
        <div className="col-span-12 lg:col-span-9">
          {tab === "profile" && (
            <Card title="Profile">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full name" value={fullName} onChange={setFullName} />
                <Field label="Email" value={user.email} disabled />
                <Field label="Department" value={department} onChange={setDepartment} />
                <Field label="Role" value={user.role} disabled />
                <Field label="Phone" value={phone} onChange={setPhone} />
                <Field label="Location" value={location} onChange={setLocation} />
              </div>

              <div className="mt-4">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </Card>
          )}

          {tab === "notifications" && (
            <Card title="Notifications">
              <Toggle
                label="In-app notifications"
                checked={inAppNotifs}
                onChange={(v) => {
                  setInAppNotifs(v);
                  saveNotifications({ inApp: v, email: emailNotifs });
                }}
              />
              <Toggle
                label="Email notifications"
                checked={emailNotifs}
                onChange={(v) => {
                  setEmailNotifs(v);
                  saveNotifications({ inApp: inAppNotifs, email: v });
                }}
              />
            </Card>
          )}

          {tab === "appearance" && themeLoaded && (
            <Card title="Appearance">
              <div className="grid grid-cols-3 gap-3">
                {["system", "light", "dark"].map((t) => (
                  <button
                    key={t}
                    onClick={() => saveTheme(t)}
                    className={`p-4 border rounded-xl ${
                      theme === t ? "bg-primary/10 border-primary" : ""
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
