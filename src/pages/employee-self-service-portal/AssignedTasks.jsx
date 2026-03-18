import React, { useEffect, useState } from "react";
import TaskCard from "./components/TaskCard";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";

const AssignedTasks = () => {
  useEffect(() => {
    document.title = "Assigned Tasks";
  }, []);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null); // which task is being saved

  const fetchTasks = async (uid) => {
    try {
      setLoading(true);

      if (!uid) {
        setTasks([]);
        return;
      }

      const qy = query(collection(db, "tasks"), where("assignedTo", "==", uid));
      const snap = await getDocs(qy);

      const list = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id, // Firestore doc id
          title: data.title || "",
          description: data.description || "",
          priority: data.priority || "medium",
          dueDate: data.dueDate || null,
          status: data.status || "Not Started",
          reason: data.reason || "Started working",
          progress: typeof data.progress === "number" ? data.progress : 0,
          updatedAt: data.updatedAt || null,
          createdAt: data.createdAt || null,
        };
      });

      setTasks(list);
    } catch (error) {
      console.error("Failed to fetch employee tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load tasks only after Firebase auth is ready
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const uid = user?.uid;

      if (uid) {
        fetchTasks(uid);
      } else {
        setTasks([]);
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // ✅ Submit update: update UI + update Firestore
  const handleTaskUpdate = async (taskDocId, updatePayload) => {
    // 1) Update UI instantly (optimistic update)
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskDocId
          ? {
              ...t,
              status: updatePayload.status,
              reason: updatePayload.reason,
              progress: updatePayload.progress,
              updatedAt: updatePayload.updatedAt,
            }
          : t
      )
    );

    // 2) Save to Firestore
    try {
      setSavingId(taskDocId);

      const taskRef = doc(db, "tasks", taskDocId);
      await updateDoc(taskRef, {
        status: updatePayload.status,
        reason: updatePayload.reason,
        progress: updatePayload.progress,
        updatedAt: serverTimestamp(),
      });

      // Optional: re-fetch to sync (kept OFF for speed)
      // await fetchTasks(auth.currentUser?.uid);
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("Failed to save update. Check console.");

      // If save fails, refresh from Firestore to restore correct data
      await fetchTasks(auth.currentUser?.uid);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Assigned Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View the tasks assigned to you by your mentor.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-sm text-muted-foreground">
          Loading assigned tasks...
        </div>
      )}

      {/* Empty State */}
      {!loading && tasks.length === 0 && (
        <div className="border border-dashed rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">No tasks assigned yet.</p>
        </div>
      )}

      {/* Saving indicator */}
      {!loading && savingId && (
        <div className="text-sm text-muted-foreground">Saving update...</div>
      )}

      {/* Tasks List */}
      {!loading && tasks.length > 0 && (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              title={task.title}
              description={task.description}
              priority={task.priority}
              dueDate={task.dueDate ? task.dueDate : "N/A"}
              status={task.status}
              reason={task.reason}
              progress={task.progress}
              lastUpdated={task.updatedAt} // ✅ keep this
              onSubmitUpdate={(payload) => handleTaskUpdate(task.id, payload)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedTasks;
