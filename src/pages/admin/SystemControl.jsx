import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

/* ---------- Reusable Toggle Component ---------- */
  const Toggle = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
    <span className="font-medium text-gray-700">{label}</span>

    <button
      type="button"
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
        value ? "bg-blue-600" : "bg-gray-300"
      }`}
      aria-pressed={value}
    >
      <span
        className="absolute top-0.5 h-5 w-5 bg-white rounded-full transition-all duration-300"
        style={{
          left: value ? "22px" : "2px",
        }}
      />
    </button>
  </div>
);


/* ---------- Main Component ---------- */
export default function SystemControl() {
  // Local state
  const [systemEnabled, setSystemEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [attendanceEnabled, setAttendanceEnabled] = useState(true);
  const [progressEnabled, setProgressEnabled] = useState(true);
  const [certificationEnabled, setCertificationEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  /* ---------- Load settings from Firestore ---------- */
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const ref = doc(db, "systemSettings", "global");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();

          setSystemEnabled(data.systemEnabled ?? true);
          setMaintenanceMode(data.maintenanceMode ?? false);
          setAttendanceEnabled(data.attendanceEnabled ?? true);
          setProgressEnabled(data.progressEnabled ?? true);
          setCertificationEnabled(data.certificationEnabled ?? true);
        } else {
          // Create default document if not exists
          await setDoc(ref, {
            systemEnabled: true,
            maintenanceMode: false,
            attendanceEnabled: true,
            progressEnabled: true,
            certificationEnabled: true,
            updatedAt: new Date(),
          });
        }
      } catch (err) {
        console.error("Failed to load system settings", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  /* ---------- Update single setting ---------- */
  const updateSetting = async (key, value) => {
    try {
      const ref = doc(db, "systemSettings", "global");
      await updateDoc(ref, {
        [key]: value,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error(`Failed to update ${key}`, err);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading system settings...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">System Control</h1>

      {/* -------- Global Controls -------- */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Global Controls</h2>
        <div className="grid gap-4">
          <Toggle
            label="System Enabled"
            value={systemEnabled}
            onChange={() => {
              const value = !systemEnabled;
              setSystemEnabled(value);
              updateSetting("systemEnabled", value);
            }}
          />

          <Toggle
            label="Maintenance Mode"
            value={maintenanceMode}
            onChange={() => {
              const value = !maintenanceMode;
              setMaintenanceMode(value);
              updateSetting("maintenanceMode", value);
            }}
          />
        </div>
      </section>

      {/* -------- Feature Controls -------- */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Feature Controls</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Toggle
            label="Attendance Module"
            value={attendanceEnabled}
            onChange={() => {
              const value = !attendanceEnabled;
              setAttendanceEnabled(value);
              updateSetting("attendanceEnabled", value);
            }}
          />

          <Toggle
            label="Progress Tracking"
            value={progressEnabled}
            onChange={() => {
              const value = !progressEnabled;
              setProgressEnabled(value);
              updateSetting("progressEnabled", value);
            }}
          />

          <Toggle
            label="Certification Module"
            value={certificationEnabled}
            onChange={() => {
              const value = !certificationEnabled;
              setCertificationEnabled(value);
              updateSetting("certificationEnabled", value);
            }}
          />
        </div>
      </section>

      {/* -------- Security Controls -------- */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Security Controls</h2>
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <button className="text-red-600 font-medium">
            Force Logout All Users
          </button>
        </div>
      </section>

      {/* -------- System Info -------- */}
      <section>
        <h2 className="text-lg font-semibold mb-4">System Information</h2>
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-2 text-sm text-gray-600">
          <p><strong>App Version:</strong> v1.0.0</p>
          <p><strong>Environment:</strong> Production</p>
          <p><strong>Last Updated:</strong> Jan 2026</p>
        </div>
      </section>
    </div>
  );
}
