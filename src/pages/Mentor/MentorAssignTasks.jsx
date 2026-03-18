import { useEffect, useState } from "react";
import Icon from "../../components/AppIcon";

import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";

const MentorAssignTasks = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");

  // ✅ Load ALL employees
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoadingTeam(true);

        const q = query(
          collection(db, "users"),
          where("role", "==", "employee")
        );

        const snap = await getDocs(q);

        const members = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id, // employee UID
            name: data.fullName || data.name || data.email || "Employee",
            email: data.email || "",
          };
        });

        setTeamMembers(members);
      } catch (error) {
        console.error("Failed to load employees:", error);
        setTeamMembers([]);
      } finally {
        setLoadingTeam(false);
      }
    };

    loadEmployees();
  }, []);

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id)
        ? prev.filter((m) => m !== id)
        : [...prev, id]
    );
  };

  // ✅ SUBMIT HANDLER (TASK + NOTIFICATION)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedMembers.length === 0) {
      alert("Please select at least one employee.");
      return;
    }

    try {
      const tasksRef = collection(db, "tasks");
      const notificationsRef = collection(db, "notifications");

      await Promise.all(
        selectedMembers.map(async (employeeUid) => {
          // 🔹 1. Create Task
          await addDoc(tasksRef, {
            title: title.trim(),
            description: description.trim(),
            priority,
            dueDate: deadline || null,

            assignedTo: employeeUid,
            assignedBy: auth.currentUser?.uid || null,

            status: "Not Started",
            reason: "Assigned",
            progress: 0,

            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          // 🔹 2. Create Notification (🔥 FIX)
          await addDoc(notificationsRef, {
            userId: employeeUid, // MUST MATCH employee auth.uid
            title: "New Task Assigned",
            message: `Mentor assigned you "${title.trim()}"`,
            type: "task",
            isRead: false,
            createdAt: serverTimestamp(),
          });
        })
      );

      alert("Task assigned successfully ✅");

      // Reset form
      setSelectedMembers([]);
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDeadline("");
    } catch (error) {
      console.error("Error assigning task:", error);
      alert("Failed to assign task. Check console.");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Assign Tasks</h1>
        <p className="text-muted-foreground">
          Assign tasks to any employee
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-xl p-6 space-y-6"
      >
        {/* Select Employees */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Employees
          </label>

          {loadingTeam ? (
            <div className="text-sm text-muted-foreground">
              Loading employees...
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No employees found.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {teamMembers.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => toggleMember(member.id)}
                  />
                  <div className="leading-tight">
                    <div className="font-medium">{member.name}</div>
                    {member.email && (
                      <div className="text-xs text-muted-foreground">
                        {member.email}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Task Title */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Task Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter task title"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task details..."
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background"
          />
        </div>

        {/* Priority & Deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            <Icon name="ClipboardCheck" size={18} />
            Assign Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default MentorAssignTasks;
