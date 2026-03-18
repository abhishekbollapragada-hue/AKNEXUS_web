import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "../../components/AppIcon";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ---------------- helpers (same as admin) ---------------- */

const clamp = (n) => Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));

const formatLastUpdated = (value) => {
  try {
    if (value?.toDate) return value.toDate().toLocaleString();
    if (value) return new Date(value).toLocaleString();
    return "—";
  } catch {
    return "—";
  }
};

const toYMD = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const toJSDate = (val) => {
  try {
    if (!val) return null;
    if (val?.toDate) return val.toDate();
    if (val instanceof Date) return val;
    if (typeof val === "string") {
      const d = new Date(val);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    return null;
  } catch {
    return null;
  }
};

const getAssignedToUid = (taskData) => {
  return (
    taskData.assignedTo ||
    taskData.employeeId ||
    taskData.employeeUid ||
    taskData.userId ||
    taskData.uid ||
    ""
  );
};

/* ---------------- small UI components ---------------- */

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
      {sub ? <p className="text-xs text-gray-400 mt-1">{sub}</p> : null}
    </div>
  );
}

function MiniPill({ tone = "green", children }) {
  const cls =
    tone === "red"
      ? "bg-red-100 text-red-700"
      : tone === "amber"
      ? "bg-amber-100 text-amber-700"
      : "bg-green-100 text-green-700";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}

/* ======================= MAIN ======================= */

export default function MentorProgress() {
  const [searchParams, setSearchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const showSingle = Boolean(employeeId);

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);

  // scroll restore (same as admin)
  const lastScrollYRef = useRef(0);
  const isRestoringRef = useRef(false);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const load = async () => {
        try {
          setLoading(true);

          const mentorUid = user.uid;

          // 1️⃣ tasks created by THIS mentor only
          const taskSnap = await getDocs(
            query(collection(db, "tasks"), where("assignedBy", "==", mentorUid))
          );

          const taskList = taskSnap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              assignedTo: getAssignedToUid(data),
              title: data.title || "",
              status: data.status || "Not Started",
              reason: data.reason || "—",
              progress: typeof data.progress === "number" ? data.progress : 0,
              updatedAt: data.updatedAt || null,
              createdAt: data.createdAt || null,
            };
          });
          setTasks(taskList);

          // 2️⃣ employees from tasks
          const employeeUids = Array.from(
            new Set(taskList.map((t) => t.assignedTo).filter(Boolean))
          );

          const memberDocs = await Promise.all(
            employeeUids.map(async (uid) => {
              const snap = await getDoc(doc(db, "users", uid));
              if (!snap.exists())
                return { id: uid, name: "Employee", email: "" };
              const data = snap.data();
              return {
                id: uid,
                name: data.fullName || data.name || data.email || "Employee",
                email: data.email || "",
              };
            })
          );
          setEmployees(memberDocs);

          // 3️⃣ attendance (for same employees)
          const attSnap = await getDocs(collection(db, "attendance"));
          const attList = attSnap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              userId: data.userId || data.uid || data.employeeId || "",
              date: data.date || data.day || data.createdAt || null,
              status: data.status || data.state || "present",
            };
          });
          setAttendance(attList);
        } catch (err) {
          console.error("Mentor progress load error:", err);
          setEmployees([]);
          setTasks([]);
          setAttendance([]);
        } finally {
          setLoading(false);
        }
      };

      load();
    });

    return () => unsub();
  }, []);

  /* ---------------- COMPUTED DATA ---------------- */

  const employeeProgress = useMemo(() => {
    return employees.map((e) => {
      const myTasks = tasks.filter((t) => t.assignedTo === e.id);

      const avg =
        myTasks.length === 0
          ? 0
          : Math.round(
              myTasks.reduce((s, t) => s + clamp(t.progress), 0) /
                myTasks.length
            );

      const now = new Date();
      const since = new Date();
      since.setDate(now.getDate() - 30);

      const myAtt = attendance.filter((a) => a.userId === e.id);
      const recent = myAtt.filter((a) => {
        const d = toJSDate(a.date);
        return d && d >= since && d <= now;
      });

      const present = recent.filter((r) =>
        String(r.status).toLowerCase().includes("present")
      ).length;

      const attPct =
        recent.length === 0
          ? null
          : Math.round((present / recent.length) * 100);

      return {
        id: e.id,
        name: e.name,
        email: e.email,
        role: "Employee",
        progress: avg,
        tasks: myTasks,
        attendancePct: attPct,
      };
    });
  }, [employees, tasks, attendance]);

  const visibleEmployees = employeeId
    ? employeeProgress.filter((e) => e.id === employeeId)
    : employeeProgress;

  const kpis = useMemo(() => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((e) =>
      tasks.some((t) => t.assignedTo === e.id)
    ).length;

    const avgTask =
      employeeProgress.length === 0
        ? 0
        : Math.round(
            employeeProgress.reduce((s, e) => s + clamp(e.progress), 0) /
              employeeProgress.length
          );

    const attVals = employeeProgress
      .map((e) => e.attendancePct)
      .filter((v) => typeof v === "number");

    const avgAtt =
      attVals.length === 0
        ? null
        : Math.round(attVals.reduce((s, v) => s + v, 0) / attVals.length);

    return [
      { label: "My Team Size", value: totalEmployees, sub: "From tasks" },
      { label: "Active Members", value: activeEmployees, sub: "Has tasks" },
      {
        label: "Avg Attendance",
        value: avgAtt === null ? "—" : `${avgAtt}%`,
        sub: "Last 30 days",
      },
      {
        label: "Avg Task Completion",
        value: `${avgTask}%`,
        sub: "Based on tasks progress",
      },
      {
        label: "Needs Attention",
        value: employeeProgress.filter((e) => e.progress < 50).length,
        sub: "Progress < 50%",
      },
    ];
  }, [employees, tasks, employeeProgress]);

  const trendData = useMemo(() => {
    const now = new Date();
    const start = new Date();
    start.setDate(now.getDate() - 27);

    const days = [];
    for (let i = 0; i < 28; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }

    const weekBuckets = [
      days.slice(0, 7),
      days.slice(7, 14),
      days.slice(14, 21),
      days.slice(21, 28),
    ];

    return ["W1", "W2", "W3", "W4"].map((w, idx) => {
      const bucket = weekBuckets[idx];
      const ymdSet = new Set(bucket.map((d) => toYMD(d)));

      const tasksInWeek = tasks.filter((t) => {
        const d = toJSDate(t.updatedAt) || toJSDate(t.createdAt);
        return d && d >= bucket[0] && d <= bucket[bucket.length - 1];
      });

      const taskAvg =
        tasksInWeek.length === 0
          ? 0
          : Math.round(
              tasksInWeek.reduce((s, t) => s + clamp(t.progress), 0) /
                tasksInWeek.length
            );

      const attInWeek = attendance.filter((a) => {
        const d = toJSDate(a.date);
        return d && ymdSet.has(toYMD(d));
      });

      const present = attInWeek.filter((r) =>
        String(r.status).toLowerCase().includes("present")
      ).length;

      const attPct =
        attInWeek.length === 0
          ? 0
          : Math.round((present / attInWeek.length) * 100);

      return {
        week: w,
        tasks: taskAvg,
        attendance: attPct,
        tasksCount: tasksInWeek.length,
        attendanceCount: attInWeek.length,
      };
    });
  }, [tasks, attendance]);

  /* ---------------- navigation helpers ---------------- */

  const openDetails = (id) => {
    lastScrollYRef.current = window.scrollY || 0;
    setSearchParams({ employeeId: id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backToAll = () => {
    isRestoringRef.current = true;
    setSearchParams({});
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: lastScrollYRef.current, behavior: "auto" });
        isRestoringRef.current = false;
      });
    });
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mentor Progress</h1>
          <p className="text-muted-foreground">
            Track task progress and attendance of your assigned team
          </p>
        </div>

        {showSingle && (
          <button
            onClick={backToAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm"
          >
            <Icon name="ArrowLeft" size={16} />
            Back to All
          </button>
        )}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      {/* Trends */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Progress Trends</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {["tasks", "attendance"].map((key) => (
            <div key={key} className="rounded-xl border border-border p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey={key} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground">Loading progress...</div>
      )}

      {!loading && employees.length === 0 && (
        <div className="border border-dashed rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No progress data yet. Assign tasks to employees first.
          </p>
        </div>
      )}

      {!loading && employees.length > 0 && (
        <div className="space-y-4">
          {visibleEmployees.map((member) => {
            const needsAttention = member.progress < 50;

            return (
              <div
                key={member.id}
                className="bg-card border border-border rounded-xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Employee{member.email ? ` • ${member.email}` : ""}
                    </p>
                  </div>

                  <MiniPill tone={needsAttention ? "red" : "green"}>
                    {needsAttention ? "Needs Attention" : "On Track"}
                  </MiniPill>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Progress</span>
                    <span>{member.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        needsAttention ? "bg-red-500" : "bg-primary"
                      }`}
                      style={{ width: `${member.progress}%` }}
                    />
                  </div>
                </div>

                {!showSingle && (
                  <button
                    onClick={() => openDetails(member.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm"
                  >
                    <Icon name="Eye" size={16} />
                    View Details
                  </button>
                )}

                {showSingle && (
                  <div className="space-y-2">
                    {member.tasks.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-lg border border-border p-4"
                      >
                        <div className="flex justify-between">
                          <div className="font-medium">{t.title}</div>
                          <div>{clamp(t.progress)}%</div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          <strong>Last updated:</strong>{" "}
                          {formatLastUpdated(t.updatedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
