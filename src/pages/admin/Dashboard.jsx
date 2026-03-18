import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { saveAs } from "file-saver";
import Icon from "../../components/AppIcon";

/* ---------- UTIL ---------- */
const today = new Date().toISOString().slice(0, 10);

/* ---------- MAIN ---------- */
export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubAttendance = onSnapshot(
      query(collection(db, "attendance"), where("date", "==", today)),
      (snap) => {
        setAttendance(snap.docs.map((d) => d.data()));
        setLoading(false);
      }
    );

    return () => {
      unsubUsers();
      unsubAttendance();
    };
  }, []);

  const metrics = useMemo(() => {
    const employees = users.filter((u) => u.role === "employee");
    const mentors = users.filter((u) => u.role === "mentor").length;
    const activeUsers = users.filter((u) => u.isOnline === true).length;

    const present = attendance.filter(
      (a) => (a.status || "").toLowerCase() === "present"
    ).length;

    const late = attendance.filter(
      (a) => (a.status || "").toLowerCase() === "late"
    ).length;

    const absent = Math.max(employees.length - (present + late), 0);

    return {
      totalUsers: users.length,
      employees: employees.length,
      mentors,
      activeUsers,
      present,
      late,
      absent,
      needsAttention: late + absent,
    };
  }, [users, attendance]);

  const exportAttendanceExcel = async () => {
    const XLSX = await import("xlsx");

    const attendanceMap = {};
    attendance.forEach((a) => (attendanceMap[a.userId] = a));

    const rows = users
      .filter((u) => u.role === "employee")
      .map((u, index) => {
        const a = attendanceMap[u.id];
        return {
          "S.No": index + 1,
          "Employee Name": u.fullName || "",
          Email: u.email || "",
          Department: u.department || "",
          Status: a?.status || "Absent",
          "Check In": a?.checkIn || "",
          "Check Out": a?.checkOut || "",
          "Work Minutes": a?.workMinutes || 0,
          Date: today,
        };
      });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), `AK-Nexus-Attendance-${today}.xlsx`);
  };

  /* ---------- ✅ FIXED FORCE LOGOUT ---------- */
  const forceLogoutAllUsers = async () => {
    const ref = doc(db, "systemSettings", "global");

    // ensure document exists
    await setDoc(ref, { forceLogout: false }, { merge: true });

    // trigger logout
    await updateDoc(ref, {
      forceLogout: true,
      forcedAt: new Date().toISOString(),
    });

    // reset after 3 seconds
    setTimeout(async () => {
      await updateDoc(ref, { forceLogout: false });
    }, 3000);

    alert("Force logout triggered for all users.");
  };

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading dashboard…</div>;
  }

  return (
    <div className="p-8 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold">
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time system overview • {today}
          </p>
        </div>

        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-subtle" />
          LIVE
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={metrics.totalUsers} icon="Users" />
        <StatCard title="Employees" value={metrics.employees} icon="User" />
        <StatCard title="Mentors" value={metrics.mentors} icon="GraduationCap" />
        <StatCard
          title="Active Users"
          value={metrics.activeUsers}
          icon="Activity"
        />
      </div>

      {/* Attendance */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatusCard title="Present Today" value={metrics.present} />
        <StatusCard title="Late Today" value={metrics.late} />
        <StatusCard title="Absent Today" value={metrics.absent} />
      </div>

      {/* Admin Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ActionCard
          title="Export Attendance"
          description="Download today's attendance report"
          button="Export Excel"
          onClick={exportAttendanceExcel}
          icon="Download"
        />

        <ActionCard
          title="Force Logout"
          description="Immediately sign out all users"
          button="Force Logout"
          onClick={forceLogoutAllUsers}
          icon="LogOut"
          danger
        />
      </div>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

const StatCard = ({ title, value, icon }) => (
  <div className="bg-card rounded-xl p-5 shadow-warm hover:shadow-warm-md transition">
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">{title}</p>
      <Icon name={icon} size={20} />
    </div>
    <p className="mt-2 text-3xl font-semibold">{value}</p>
  </div>
);

const StatusCard = ({ title, value }) => (
  <div className="bg-card rounded-xl p-5 shadow-warm">
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className="mt-2 text-3xl font-bold">{value}</p>
  </div>
);

const ActionCard = ({ title, description, button, onClick, icon, danger }) => (
  <div
    className={`rounded-xl p-6 bg-card shadow-warm ${
      danger ? "border border-destructive/40" : ""
    }`}
  >
    <div className="flex items-center gap-3 mb-3">
      <Icon name={icon} size={22} />
      <h3 className={`font-semibold ${danger ? "text-destructive" : ""}`}>
        {title}
      </h3>
    </div>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition
        ${
          danger
            ? "bg-destructive text-destructive-foreground hover:opacity-90"
            : "bg-primary text-primary-foreground hover:opacity-90"
        }`}
    >
      {button}
    </button>
  </div>
);
