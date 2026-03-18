import React, { useEffect, useMemo, useState } from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";

import { auth, db } from "../../../firebase/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";

const normalizeStatus = (status) => {
  const s = String(status || "").trim().toLowerCase();
  if (s === "completed" || s === "complete" || s === "done") return "completed";
  if (s === "in progress" || s === "in-progress" || s === "progress") return "in-progress";
  if (s === "pending" || s === "todo" || s === "to do") return "pending";
  // fallback
  return "pending";
};

const normalizePriority = (priority) => {
  const p = String(priority || "").trim().toLowerCase();
  if (p === "high") return "high";
  if (p === "low") return "low";
  return "medium";
};

const TaskManagementPanel = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) {
      setTasks([]);
      setLoading(false);
      return;
    }

    // If you ever get an index error, we can remove orderBy or create the suggested index.
    const qy = query(
      collection(db, "tasks"),
      where("assignedTo", "==", uid),
      orderBy("updatedAt", "desc")
    );

    const unsub = onSnapshot(
      qy,
      (snap) => {
        const rows = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data?.title || "Untitled Task",
            description: data?.description || "",
            status: normalizeStatus(data?.status),
            priority: normalizePriority(data?.priority),
            dueDate: data?.dueDate || "",
            assignedBy: data?.assignedBy || "",
            attachments: data?.attachments || 0, // if you don't have this field, it will stay 0
            progress: Number.isFinite(data?.progress) ? data.progress : 0,
          };
        });

        setTasks(rows);
        setLoading(false);
      },
      () => {
        setTasks([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [uid]);

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "All Tasks" },
      { value: "pending", label: "Pending" },
      { value: "in-progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
    ],
    []
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-warning/10 text-warning border-warning/20",
      "in-progress": "bg-primary/10 text-primary border-primary/20",
      completed: "bg-success/10 text-success border-success/20",
    };
    return colors?.[status] || colors?.pending;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "text-error",
      medium: "text-warning",
      low: "text-muted-foreground",
    };
    return colors?.[priority] || colors?.medium;
  };

  const filteredTasks =
    filterStatus === "all" ? tasks : tasks?.filter((t) => t?.status === filterStatus);

  const safeDueLabel = (dueDate) => {
    // Your Firestore dueDate is stored like "2026-01-17"
    if (!dueDate) return "No due date";
    const dt = new Date(dueDate);
    if (Number.isNaN(dt.getTime())) return dueDate;
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="bg-card rounded-xl shadow-warm-md p-4 md:p-6 border border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg md:text-xl lg:text-2xl font-heading font-semibold text-foreground mb-1">
            Task Management
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Track and manage your assigned tasks
          </p>
        </div>
        <Select
          options={statusOptions}
          value={filterStatus}
          onChange={setFilterStatus}
          className="w-full sm:w-48"
        />
      </div>

      {loading ? (
        <div className="py-10 text-center text-muted-foreground">Loading tasks...</div>
      ) : (
        <div className="space-y-4">
          {filteredTasks?.map((task) => (
            <div
              key={task?.id}
              className="bg-muted/30 rounded-xl p-4 md:p-5 border border-border hover:border-primary/30 transition-smooth"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 mb-3">
                    <h3 className="text-base md:text-lg font-heading font-semibold text-foreground flex-1">
                      {task?.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(
                          task?.status
                        )} capitalize`}
                      >
                        {task?.status?.replace("-", " ")}
                      </span>
                      <div className={`flex items-center gap-1 ${getPriorityColor(task?.priority)}`}>
                        <Icon name="Flag" size={14} />
                        <span className="text-xs font-medium capitalize">{task?.priority}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm md:text-base text-muted-foreground mb-4 line-clamp-2">
                    {task?.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground mb-4">
                    {!!task?.assignedBy && (
                      <div className="flex items-center gap-1.5">
                        <Icon name="User" size={14} />
                        <span>Assigned by {task?.assignedBy}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <Icon name="Calendar" size={14} />
                      <span>Due {safeDueLabel(task?.dueDate)}</span>
                    </div>

                    {task?.attachments > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Icon name="Paperclip" size={14} />
                        <span>
                          {task?.attachments} attachment{task?.attachments > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs md:text-sm text-muted-foreground">Progress</span>
                      <span className="text-xs md:text-sm font-medium text-foreground data-text">
                        {task?.progress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-smooth" style={{ width: `${task?.progress}%` }} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" iconName="Eye" iconPosition="left">
                      View Details
                    </Button>

                    {task?.status !== "completed" && (
                      <Button variant="default" size="sm" iconName="Upload" iconPosition="left">
                        Submit Work
                      </Button>
                    )}

                    {task?.status === "completed" && (
                      <Button variant="success" size="sm" iconName="Download" iconPosition="left">
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredTasks?.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Inbox" size={32} color="var(--color-muted-foreground)" />
              </div>
              <p className="text-base md:text-lg text-muted-foreground">No tasks found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskManagementPanel;
