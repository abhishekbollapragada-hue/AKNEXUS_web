import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/AppIcon";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";

const MentorTeam = () => {
  const navigate = useNavigate();

  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔧 DEBUG MODE
  // true  = show all employees
  // false = show only assigned employees
  const DEBUG_SHOW_ALL_EMPLOYEES = false;

  useEffect(() => {
    setLoading(true);

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setTeamMembers([]);
        setLoading(false);
        return;
      }

      const q = DEBUG_SHOW_ALL_EMPLOYEES
        ? query(
            collection(db, "users"),
            where("role", "==", "employee")
          )
        : query(
            collection(db, "users"),
            where("role", "==", "employee"),
            where("mentorId", "==", user.uid)
          );

      const unsubTeam = onSnapshot(
        q,
        (snap) => {
          const members = snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setTeamMembers(members);
          setLoading(false);
        },
        (err) => {
          console.error("MentorTeam Firestore error:", err);
          setTeamMembers([]);
          setLoading(false);
        }
      );

      return () => unsubTeam();
    });

    return () => unsubAuth();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Team</h1>
        <p className="text-muted-foreground">
          Manage your assigned team members
        </p>

        <p className="text-xs text-muted-foreground mt-2">
          {DEBUG_SHOW_ALL_EMPLOYEES
            ? "Debug: Showing ALL employees"
            : "Showing assigned employees only"}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-card border border-border rounded-xl p-6 text-muted-foreground">
          Loading team...
        </div>
      )}

      {/* Empty state */}
      {!loading && teamMembers.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-6 text-muted-foreground">
          {DEBUG_SHOW_ALL_EMPLOYEES
            ? "No employees found with role = employee."
            : "No employees assigned to you yet."}
        </div>
      )}

      {/* Team list */}
      {!loading && teamMembers.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {teamMembers.map((member) => {
              // 🔒 STRICT FIELD USAGE (NO FALLBACK CHAOS)
              const name = member.fullName ?? "Unnamed";
              const role = member.role ?? "employee";

              // ✅ TRUE SOURCE OF TRUTH (THIS FIXES YOUR ISSUE)
                const isActive = (() => {
                  if (!member.lastSeen) return false;

                  const now = Date.now();
                  const lastSeen = member.lastSeen.toDate().getTime();

                    return now - lastSeen < 2 * 60 * 1000; // 2 minutes
                })();


              return (
                <div
                  key={member.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4"
                >
                  {/* Employee info */}
                  <div>
                    <h3 className="font-semibold">{name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {role}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isActive ? "active" : "inactive"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        navigate(`/mentor/progress?employeeId=${member.id}`)
                      }
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition text-sm"
                    >
                      <Icon name="BarChart" size={16} />
                      View Progress
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/mentor/assign-tasks?employeeId=${member.id}`)
                      }
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition text-sm"
                    >
                      <Icon name="ClipboardList" size={16} />
                      Assign Task
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/mentor/messages?employeeId=${member.id}`)
                      }
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition text-sm"
                    >
                      <Icon name="MessageCircle" size={16} />
                      Message
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorTeam;
