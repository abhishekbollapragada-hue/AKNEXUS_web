import React, { useEffect, useMemo, useState } from "react";

// Dashboard components
import StatusCard from "../components/StatusCard";
import AttendanceWidget from "../components/AttendanceWidget";
import NotificationCenter from "../components/NotificationCenter";
import QuickActionsPanel from "../components/QuickActionsPanel";

import { auth, db } from "../../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";

const normalizeTaskStatus = (status) => {
  const s = String(status || "").trim().toLowerCase();
  if (s === "completed" || s === "done" || s === "complete") return "completed";
  if (s === "in progress" || s === "in-progress") return "in-progress";
  if (s === "pending" || s === "todo" || s === "to do") return "pending";
  return "pending";
};

// ---- date helpers ----
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

// ---- attendance robust helpers (works with your current Firestore shape) ----
const isFsTimestamp = (v) => v && typeof v === "object" && typeof v.toDate === "function";

const parseAnyDate = (v) => {
  if (!v) return null;
  if (isFsTimestamp(v)) return v.toDate();
  if (v instanceof Date) return v;

  // If string like "2026-01-24" OR ISO string
  if (typeof v === "string") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
};

const getAnyAttendanceDate = (log) =>
  parseAnyDate(
    log?.createdAt ||
      log?.checkIn ||
      log?.checkInTime ||
      log?.checkInTimestamp ||
      log?.date || // your table shows date like "2026-01-24"
      log?.day ||
      log?.timestamp ||
      log?.time
  );

const normalizeAttendanceStatus = (s) => String(s || "").trim().toLowerCase();

const EmployeeDashboard = () => {
  useEffect(() => {
    document.title = "Employee Self-Service Portal - AK Nexus";
  }, []);

  const [uid, setUid] = useState(null);

  const [stats, setStats] = useState({
    attendanceRate: 0,
    presentDays: 0,
    totalDays: 0,
    taskCompletion: 0,
    completedTasks: 0,
    totalTasks: 0,
    internshipProgress: 0,
    certificateEligible: false,
    loading: true,
  });

  // ✅ Wait for Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid || null);
    });
    return () => unsub();
  }, []);

  // ✅ Live attendance + tasks
  useEffect(() => {
    if (!uid) {
      setStats((s) => ({ ...s, loading: false }));
      return;
    }

    setStats((s) => ({ ...s, loading: true }));

    const now = new Date();
    const from = startOfMonth(now);
    const to = endOfMonth(now);

    // ✅ IMPORTANT FIX:
    // Your attendance docs don't reliably contain dateYMD (and may store date as string / timestamps in different fields).
    // So we query by userId only, then filter by month in JS.
    const attendanceQ = query(collection(db, "attendance"), where("userId", "==", uid));

    // Tasks listener
    const tasksQ = query(collection(db, "tasks"), where("assignedTo", "==", uid));

    let latestAttendance = [];
    let latestTasks = [];

    const recompute = () => {
      // Attendance
      const totalDays = latestAttendance.length;

      // Treat "late" as present (optional but recommended)
      const presentDays = latestAttendance.filter((x) => {
        const s = normalizeAttendanceStatus(x?.status);
        return s === "present" || s === "late";
      }).length;

      const attendanceRate =
        totalDays > 0 ? Math.round((presentDays / totalDays) * 10000) / 100 : 0;

      // Tasks
      const totalTasks = latestTasks.length;
      const completedTasks = latestTasks.filter(
        (t) => normalizeTaskStatus(t?.status) === "completed"
      ).length;

      const taskCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const progressAvg =
        totalTasks > 0
          ? Math.round(
              latestTasks.reduce(
                (sum, t) => sum + (Number.isFinite(t?.progress) ? t.progress : 0),
                0
              ) / totalTasks
            )
          : 0;

      const certificateEligible = attendanceRate >= 75;

      setStats({
        attendanceRate,
        presentDays,
        totalDays,
        taskCompletion,
        completedTasks,
        totalTasks,
        internshipProgress: progressAvg,
        certificateEligible,
        loading: false,
      });
    };

    const unsubAttendance = onSnapshot(
      attendanceQ,
      (snap) => {
        const all = snap.docs.map((d) => d.data());

        // Filter ONLY current month (based on whatever date field exists in the document)
        latestAttendance = all.filter((log) => {
          const dt = getAnyAttendanceDate(log);
          if (!dt) return false;
          return dt >= from && dt <= to;
        });

        recompute();
      },
      (err) => {
        console.error("Attendance snapshot error:", err);
        latestAttendance = [];
        recompute();
      }
    );

    const unsubTasks = onSnapshot(
      tasksQ,
      (snap) => {
        latestTasks = snap.docs.map((d) => d.data());
        recompute();
      },
      (err) => {
        console.error("Tasks snapshot error:", err);
        latestTasks = [];
        recompute();
      }
    );

    return () => {
      unsubAttendance();
      unsubTasks();
    };
  }, [uid]);

  const statusCards = useMemo(() => {
    if (stats.loading) {
      return [
        { title: "Attendance Rate", value: "--", subtitle: "Loading...", icon: "Calendar", color: "warning" },
        { title: "Task Completion", value: "--", subtitle: "Loading...", icon: "CheckSquare", color: "primary" },
        { title: "Internship Progress", value: "--", subtitle: "Loading...", icon: "TrendingUp", color: "success" },
        { title: "Certificate Status", value: "--", subtitle: "Loading...", icon: "Award", color: "success" },
      ];
    }

    return [
      {
        title: "Attendance Rate",
        value: `${stats.attendanceRate}%`,
        subtitle: `${stats.presentDays} of ${stats.totalDays} days present`,
        icon: "Calendar",
        color: stats.attendanceRate >= 75 ? "success" : "warning",
      },
      {
        title: "Task Completion",
        value: `${stats.taskCompletion}%`,
        subtitle: `${stats.completedTasks} of ${stats.totalTasks} tasks completed`,
        icon: "CheckSquare",
        color: "primary",
      },
      {
        title: "Internship Progress",
        value: `${stats.internshipProgress}%`,
        subtitle: stats.internshipProgress >= 70 ? "On track" : "Needs improvement",
        icon: "TrendingUp",
        color: stats.internshipProgress >= 70 ? "success" : "warning",
      },
      {
        title: "Certificate Status",
        value: stats.certificateEligible ? "Eligible" : "Not Eligible",
        subtitle: "Maintain 75% attendance",
        icon: "Award",
        color: stats.certificateEligible ? "success" : "warning",
      },
    ];
  }, [stats]);

  return (
    <>
      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statusCards.map((card, i) => (
          <StatusCard key={i} {...card} />
        ))}
      </div>

      {/* Attendance + Quick Actions + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AttendanceWidget />
          <QuickActionsPanel />
        </div>

        <NotificationCenter />
      </div>
    </>
  );
};

export default EmployeeDashboard;
