import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../firebase/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";

const cn = (...classes) => classes.filter(Boolean).join(" ");

function formatDateKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatMonthKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function startOfWeek(date) {
  // Monday as start of week (India commonly uses Monday in orgs)
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun ... 6 Sat
  const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date) {
  const s = startOfWeek(date);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}

function toDateSafe(tsOrDate) {
  if (!tsOrDate) return null;
  if (typeof tsOrDate?.toDate === "function") return tsOrDate.toDate();
  if (tsOrDate instanceof Date) return tsOrDate;
  // allow ISO string or yyyy-mm-dd
  if (typeof tsOrDate === "string") {
    const d = new Date(tsOrDate);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function normalizePriority(p) {
  if (!p) return "Medium";
  const v = String(p).toLowerCase();
  if (v === "high") return "High";
  if (v === "low") return "Low";
  return "Medium";
}

function normalizeTaskStatus(s) {
  if (!s) return "Pending";
  const v = String(s).toLowerCase();
  if (v.includes("complete")) return "Completed";
  if (v.includes("progress")) return "In Progress";
  if (v.includes("not started")) return "Pending";
  if (v.includes("pending")) return "Pending";
  return "Pending";
}

function calcMinutesWorked(checkIn, checkOut) {
  const inDate = toDateSafe(checkIn);
  const outDate = toDateSafe(checkOut);
  if (!inDate || !outDate) return 0;
  const diffMs = outDate.getTime() - inDate.getTime();
  if (diffMs <= 0) return 0;
  return Math.round(diffMs / (1000 * 60));
}

function formatMinutes(mins) {
  if (!mins || mins <= 0) return "0h 0m";
  const hrs = Math.floor(mins / 60);
  const m = mins % 60;
  return `${hrs}h ${m}m`;
}

const MyProgress = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "My Progress - AK Nexus";
  }, []);

  // ✅ This will now control filtering
  const [range, setRange] = useState("thisMonth"); // thisWeek | thisMonth | allTime

  // ✅ Reliable userId + user profile
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    role: "Employee",
    department: "",
    joined: "",
  });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      setUserId(u?.uid || null);

      // Auth fallback (always available)
      const base = {
        name: u?.displayName || "Employee",
        email: u?.email || "",
        role: "Employee",
        department: "",
        joined: "",
      };

      if (!u?.uid) {
        setUserProfile(base);
        return;
      }

      // Optional Firestore user doc: users/{uid} (safe if not exists)
      try {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setUserProfile({
            name: data.name || data.fullName || base.name,
            email: data.email || base.email,
            role: data.role || base.role,
            department: data.department || data.domain || "",
            joined: data.joined || data.joinedAt || "",
          });
        } else {
          setUserProfile(base);
        }
      } catch (e) {
        console.warn("No users/{uid} profile or failed to load:", e);
        setUserProfile(base);
      }
    });

    return () => unsub();
  }, []);

  // ------------------- Tasks -------------------
  const [taskLoading, setTaskLoading] = useState(true);
  const [tasksRaw, setTasksRaw] = useState([]);

  const fetchTasks = async () => {
    try {
      setTaskLoading(true);
      if (!userId) {
        setTasksRaw([]);
        return;
      }

      const q = query(collection(db, "tasks"), where("assignedTo", "==", userId));
      const snap = await getDocs(q);

      const list = snap.docs.map((d) => {
        const data = d.data();
        const dueDate = data.dueDate || null;
        const createdAt = data.createdAt || null;
        const updatedAt = data.updatedAt || null;

        // pick best available "date" for filtering
        const filterDate =
          toDateSafe(dueDate) || toDateSafe(updatedAt) || toDateSafe(createdAt);

        return {
          id: d.id,
          title: data.title || "",
          due: dueDate ? formatDateKey(toDateSafe(dueDate)) : "N/A",
          status: normalizeTaskStatus(data.status),
          progress: typeof data.progress === "number" ? data.progress : 0,
          priority: normalizePriority(data.priority),
          _filterDate: filterDate, // used for week/month filter
        };
      });

      setTasksRaw(list);
    } catch (e) {
      console.error("Failed to fetch tasks:", e);
      setTasksRaw([]);
    } finally {
      setTaskLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Filter tasks based on range
  const tasks = useMemo(() => {
    const now = new Date();
    if (range === "allTime") return tasksRaw;

    const start =
      range === "thisWeek" ? startOfWeek(now) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = range === "thisWeek" ? endOfWeek(now) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    return tasksRaw.filter((t) => {
      const d = t._filterDate;
      if (!d) return false;
      return d >= start && d <= end;
    });
  }, [tasksRaw, range]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "Completed").length;
    const avgProgress =
      total === 0
        ? 0
        : Math.round(tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / total);

    const pending = tasks.filter((t) => t.status === "Pending").length;

    return { total, completed, avgProgress, pending };
  }, [tasks]);

  // ------------------- Attendance -------------------
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const fetchAttendance = async () => {
    try {
      setAttendanceLoading(true);
      if (!userId) {
        setAttendanceRecords([]);
        return;
      }

      const q = query(
        collection(db, "attendance"),
        where("userId", "==", userId),
        orderBy("date", "desc"),
        limit(180) // more docs so "All time" works better
      );

      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAttendanceRecords(list);
    } catch (e) {
      console.error("Failed to fetch attendance:", e);
      setAttendanceRecords([]);
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Filter attendance records based on range (uses r.date string: yyyy-mm-dd)
  const filteredAttendance = useMemo(() => {
    const now = new Date();
    if (range === "allTime") return attendanceRecords;

    if (range === "thisMonth") {
      const mk = formatMonthKey(now);
      return attendanceRecords.filter(
        (r) => typeof r.date === "string" && r.date.startsWith(mk)
      );
    }

    // thisWeek
    const s = startOfWeek(now);
    const e = endOfWeek(now);

    return attendanceRecords.filter((r) => {
      if (typeof r.date !== "string") return false;
      const d = toDateSafe(r.date); // yyyy-mm-dd
      if (!d) return false;
      return d >= s && d <= e;
    });
  }, [attendanceRecords, range]);

  const attendanceSummary = useMemo(() => {
    const present = filteredAttendance.filter((r) => (r.status || "") === "present").length;
    const absent = filteredAttendance.filter((r) => (r.status || "") === "absent").length;
    const late = filteredAttendance.filter((r) => (r.status || "") === "late").length;
    const total = filteredAttendance.length || 0;

    // ✅ Keep same logic as your Attendance page (percentage based on "present")
    const percentage = total ? Math.round((present / total) * 100) : 0;

    // hours worked
    const minutesWorked = filteredAttendance.reduce((sum, r) => {
      return sum + calcMinutesWorked(r.checkIn, r.checkOut);
    }, 0);

    return { present, absent, late, total, percentage, minutesWorked };
  }, [filteredAttendance]);

  // ✅ Streak from today (same logic, present/late count)
  const streak = useMemo(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) return 0;

    const map = new Map();
    for (const r of attendanceRecords) {
      if (typeof r.date === "string") map.set(r.date, r);
    }

    let count = 0;
    let cursor = new Date(); // today

    while (true) {
      const key = formatDateKey(cursor);
      const rec = map.get(key);
      if (!rec) break;

      const st = (rec.status || "").toLowerCase();
      if (st !== "present" && st !== "late") break;

      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return count;
  }, [attendanceRecords]);

  // ------------------- Overall Score -------------------
  const attendancePercent = attendanceSummary.percentage;

  const overallScore = useMemo(() => {
    const score = Math.round(taskStats.avgProgress * 0.7 + attendancePercent * 0.3);
    return Math.max(0, Math.min(100, score));
  }, [taskStats.avgProgress, attendancePercent]);

  const skillLevel = useMemo(() => {
    if (overallScore >= 85) return "Advanced";
    if (overallScore >= 60) return "Intermediate";
    return "Beginner";
  }, [overallScore]);

  // ------------------- UI Components -------------------
  const StatusChip = ({ status }) => {
    const map = {
      Completed: "text-green-700 bg-green-100",
      "In Progress": "text-yellow-800 bg-yellow-100",
      Pending: "text-gray-700 bg-gray-100",
      Overdue: "text-red-700 bg-red-100",
    };
    return (
      <span className={cn("text-xs px-3 py-1 rounded-full font-medium", map[status])}>
        {status}
      </span>
    );
  };

  const PriorityDot = ({ priority }) => {
    const map = {
      High: "bg-red-500",
      Medium: "bg-yellow-500",
      Low: "bg-green-500",
    };
    return (
      <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        <span className={cn("h-2.5 w-2.5 rounded-full", map[priority] || "bg-gray-400")} />
        {priority}
      </span>
    );
  };

  const ProgressBar = ({ value }) => (
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full bg-primary"
        style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }}
      />
    </div>
  );

  const Ring = ({ value }) => {
    const size = 128;
    const stroke = 12;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const pct = Math.max(0, Math.min(100, value || 0));
    const dash = (pct / 100) * c;

    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="block">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            className="text-muted"
            stroke="currentColor"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            className="text-primary"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>

        <div className="absolute text-center">
          <div className="text-3xl font-bold text-foreground">{pct}%</div>
          <div className="text-xs text-muted-foreground">Overall</div>
        </div>
      </div>
    );
  };

  const rangeLabel =
    range === "thisWeek" ? "This week" : range === "thisMonth" ? "This month" : "All time";

  // ------------------- Render -------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Progress</h1>
          <p className="text-muted-foreground mt-1">
            Track tasks, attendance, and your overall performance in one place.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>
              {userProfile.name} • {userProfile.role}
              {userProfile.department ? ` • ${userProfile.department}` : ""}
            </span>
            {userProfile.email ? <span>{userProfile.email}</span> : null}
          </div>
        </div>

        {/* Range Toggle */}
        <div className="inline-flex rounded-xl border border-border bg-card p-1">
          {[
            { id: "thisWeek", label: "This week" },
            { id: "thisMonth", label: "This month" },
            { id: "allTime", label: "All time" },
          ].map((x) => (
            <button
              key={x.id}
              onClick={() => setRange(x.id)}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-medium transition",
                range === x.id
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Overall Performance */}
        <div className="lg:col-span-5 bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Overall Performance</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Based on tasks + attendance ({rangeLabel})
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-muted text-foreground font-medium">
              {skillLevel}
            </span>
          </div>

          <div className="mt-6 flex items-center gap-6">
            <Ring value={overallScore} />

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Task Progress</span>
                  <span className="font-semibold text-foreground">
                    {taskStats.avgProgress}%
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={taskStats.avgProgress} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Attendance</span>
                  <span className="font-semibold text-foreground">
                    {attendancePercent}%
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={attendancePercent} />
                </div>
              </div>

              <div className="rounded-xl bg-muted p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Performance Score</span>
                  <span className="text-sm font-bold text-foreground">
                    {overallScore}/100
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Your score updates automatically based on current range.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-muted p-3 min-h-[76px] flex flex-col justify-between">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {taskStats.completed}/{taskStats.total}
              </p>
            </div>

            <div className="rounded-xl bg-muted p-3 min-h-[76px] flex flex-col justify-between">
              <p className="text-xs text-muted-foreground">Streak</p>
              <p className="mt-1 text-lg font-bold text-foreground">{streak}d</p>
            </div>

            <div className="rounded-xl bg-muted p-3 min-h-[76px] flex flex-col justify-between">
              <p className="text-xs text-muted-foreground">Hours Worked</p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {formatMinutes(attendanceSummary.minutesWorked)}
              </p>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Tasks</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Completion overview ({rangeLabel})
              </p>
            </div>
          </div>

          {taskLoading && (
            <div className="mt-3 text-sm text-muted-foreground">Loading tasks...</div>
          )}

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {taskStats.completed}/{taskStats.total}
              </p>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">Avg Progress</p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {taskStats.avgProgress}%
              </p>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="mt-1 text-lg font-bold text-foreground">{taskStats.pending}</p>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Overall task completion</span>
              <span className="font-semibold text-foreground">{taskStats.avgProgress}%</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={taskStats.avgProgress} />
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-border p-4">
            <p className="text-sm font-semibold text-foreground">Next best action</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Completing your in-progress task increases your score faster.
            </p>

            <button
              onClick={() => navigate("/employee-self-service-portal/assigned-tasks")}
              className="mt-3 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              View Assigned Tasks
            </button>

            <button
              onClick={fetchTasks}
              className="mt-3 w-full rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Refresh Tasks
            </button>
          </div>
        </div>

        {/* Attendance */}
        <div className="lg:col-span-4 bg-card border border-border rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Attendance</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Summary ({rangeLabel})
              </p>
            </div>
          </div>

          {attendanceLoading && (
            <div className="mt-3 text-sm text-muted-foreground">Loading attendance...</div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">Present</p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {attendanceSummary.present}/{attendanceSummary.total}
              </p>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">Attendance %</p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {attendanceSummary.percentage}%
              </p>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">Absent</p>
              <p className="mt-1 text-lg font-bold text-foreground">{attendanceSummary.absent}</p>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">Late</p>
              <p className="mt-1 text-lg font-bold text-foreground">{attendanceSummary.late}</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-muted p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Current streak</p>
              <p className="text-sm font-bold text-foreground">{streak} days</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Streak counts Present/Late days consecutively from today.
            </p>
          </div>

          <button
            onClick={() => navigate("/employee-self-service-portal/attendance")}
            className="mt-4 w-full rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
          >
            View Attendance
          </button>

          <button
            onClick={fetchAttendance}
            className="mt-3 w-full rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Refresh Attendance
          </button>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Task List */}
        <div className="lg:col-span-8 bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg text-foreground">Assigned Tasks</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Filtered by: {rangeLabel}
              </p>
            </div>
          </div>

          {taskLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No tasks found for {rangeLabel}.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tasks.map((task) => (
                <div key={task.id} className="p-4 space-y-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-medium text-foreground truncate">{task.title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>Due: {task.due}</span>
                        <PriorityDot priority={task.priority} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusChip status={task.status} />
                      <span className="text-xs font-semibold text-foreground">
                        {task.progress}%
                      </span>
                    </div>
                  </div>

                  <ProgressBar value={task.progress} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="lg:col-span-4 bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-lg text-foreground">Insights</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Smart recommendations ({rangeLabel})
          </p>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-muted p-4">
              <p className="text-sm font-semibold text-foreground">Hours worked</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Total worked time in {rangeLabel}:{" "}
                <span className="font-semibold text-foreground">
                  {formatMinutes(attendanceSummary.minutesWorked)}
                </span>
              </p>
            </div>

            <div className="rounded-xl bg-muted p-4">
              <p className="text-sm font-semibold text-foreground">Keep your streak</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Current streak:{" "}
                <span className="font-semibold text-foreground">{streak} days</span>
              </p>
            </div>

            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-semibold text-foreground">Quick Summary</p>
              <div className="mt-2 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Overall</span>
                  <span className="font-semibold text-foreground">{overallScore}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tasks</span>
                  <span className="font-semibold text-foreground">{taskStats.avgProgress}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Attendance</span>
                  <span className="font-semibold text-foreground">{attendancePercent}%</span>
                </div>
              </div>

              <button
                className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                onClick={() => navigate("/employee-self-service-portal/feedback")}
              >
                Ask Mentor for Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProgress;
