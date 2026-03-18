import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";
import Icon from "../../components/AppIcon";

const today = new Date().toISOString().slice(0, 10);

const MentorDashboard = () => {
  const [team, setTeam] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const mentorId = auth.currentUser?.uid;

  /* ---------- DATA ---------- */
  useEffect(() => {
    if (!mentorId) return;

    document.title = "Mentor Dashboard - AK Nexus";

    const unsubTeam = onSnapshot(
      query(
        collection(db, "users"),
        where("mentorId", "==", mentorId),
        where("role", "==", "employee")
      ),
      (snap) => {
        setTeam(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        );
      }
    );

    const unsubAttendance = onSnapshot(
      query(
        collection(db, "attendance"),
        where("date", "==", today)
      ),
      (snap) => {
        setAttendance(snap.docs.map((d) => d.data()));
        setLoading(false);
      }
    );

    return () => {
      unsubTeam();
      unsubAttendance();
    };
  }, [mentorId]);

  /* ---------- METRICS ---------- */
  const metrics = useMemo(() => {
    const teamIds = team.map((t) => t.id);

    const todayRecords = attendance
      .filter((a) => teamIds.includes(a.userId))
      .map((a) => ({
        ...a,
        status:
          a.status.charAt(0).toUpperCase() +
          a.status.slice(1).toLowerCase(),
      }));

    const present = todayRecords.filter(
      (a) => a.status === "Present"
    ).length;

    const late = todayRecords.filter(
      (a) => a.status === "Late"
    ).length;

    const absent = Math.max(
      team.length - (present + late),
      0
    );

    return {
      teamSize: team.length,
      present,
      late,
      absent,
    };
  }, [team, attendance]);

  /* ---------- NEEDS ATTENTION (ABSENT + LATE) ---------- */
  const needsAttention = useMemo(() => {
    return team
      .map((m) => {
        const record = attendance.find(
          (a) => a.userId === m.id
        );

        const status = record?.status
          ? record.status.charAt(0).toUpperCase() +
            record.status.slice(1).toLowerCase()
          : "Absent";

        return {
          id: m.id,
          name: m.fullName || "Unnamed",
          status,
        };
      })
      .filter(
        (m) => m.status === "Absent" || m.status === "Late"
      )
      .slice(0, 5);
  }, [team, attendance]);

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <div className="p-10 animate-pulse text-muted-foreground">
        Loading your mentor dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">
          Mentor Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your team and guide progress
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Kpi title="Team Members" value={metrics.teamSize} icon="Users" />
        <Kpi title="Present Today" value={metrics.present} icon="CheckCircle" />
        <Kpi title="Late Today" value={metrics.late} icon="Clock" />
        <Kpi
          title="Absenties"
          value={metrics.absent}
          icon="UserX"
          danger={metrics.absent > 0}
        />
      </div>

      {/* NEEDS ATTENTION */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">
          Needs Attention
        </h3>

        {needsAttention.length === 0 ? (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Icon name="CheckCircle" size={16} />
            All team members are on track today 🎉
          </p>
        ) : (
          <div className="space-y-3">
            {needsAttention.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between border rounded-lg p-4"
              >
                <div>
                  <p className="font-medium">{m.name}</p>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      m.status === "Late"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <Link
                  to="/mentor/team"
                  className="text-sm text-primary hover:underline"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">
          Quick Actions
        </h3>

        <div className="flex gap-4">
          <Link
            to="/mentor/assign-tasks"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
          >
            <Icon name="ClipboardList" size={18} />
            Assign Task
          </Link>

          <Link
            to="/mentor/team"
            className="flex items-center gap-3 px-4 py-3 rounded-lg border"
          >
            <Icon name="Users" size={18} />
            View Team
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;

/* ---------- KPI CARD ---------- */
const Kpi = ({ title, value, icon, danger }) => (
  <div
    className={`bg-card border rounded-xl p-6 ${
      danger ? "border-red-300" : "border-border"
    }`}
  >
    <div className="flex justify-between items-center">
      <p className="text-sm text-muted-foreground">{title}</p>
      <Icon name={icon} size={18} />
    </div>
    <h2
      className={`text-4xl font-bold mt-3 ${
        danger ? "text-red-600" : ""
      }`}
    >
      {value}
    </h2>
  </div>
);
