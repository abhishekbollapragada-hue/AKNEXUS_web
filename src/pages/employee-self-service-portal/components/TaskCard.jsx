import React, { useEffect, useMemo, useState } from "react";

const STATUS_OPTIONS = [
  "Not Started",
  "In Progress",
  "In Hold",
  "Almost Done",
  "Completed",
];

const REASON_OPTIONS = [
  "Started working",
  "Working on another task",
  "Waiting for mentor reply",
  "Need access / permission",
  "Issue with requirement",
  "Will complete before deadline",
  "Might delay",
  "Other reason",
];

const TaskCard = ({
  title = "Task Title",
  description = "Task description goes here.",
  priority = "Medium",
  dueDate = "N/A",

  // Current values (from Firestore)
  status = "Not Started",
  reason = "Started working",
  progress = 0,

  // Firestore Timestamp OR ISO string (both supported)
  lastUpdated = null,

  // Callback to parent
  onSubmitUpdate,
}) => {
  // Local editable state
  const [localStatus, setLocalStatus] = useState(status);
  const [localReason, setLocalReason] = useState(reason);
  const [localProgress, setLocalProgress] = useState(Number(progress) || 0);

  const [savedMsg, setSavedMsg] = useState("");

  // ✅ Keep local state in sync if parent (Firestore) changes values
  useEffect(() => setLocalStatus(status), [status]);
  useEffect(() => setLocalReason(reason), [reason]);
  useEffect(() => setLocalProgress(Number(progress) || 0), [progress]);

  // Small UX: auto-set progress to 100 if Completed
  useMemo(() => {
    if (localStatus === "Completed" && localProgress !== 100) {
      setLocalProgress(100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStatus]);

  const handleSubmit = () => {
    const payload = {
      status: localStatus,
      reason: localReason,
      progress: Number(localProgress) || 0,
      updatedAt: new Date().toISOString(),
    };

    if (typeof onSubmitUpdate === "function") {
      onSubmitUpdate(payload);
    }

    setSavedMsg("Updated ✅");
    setTimeout(() => setSavedMsg(""), 1500);
  };

  const formatLastUpdated = () => {
    try {
      // Firestore Timestamp has .toDate()
      if (lastUpdated?.toDate) return lastUpdated.toDate().toLocaleString();

      // ISO string or date string
      if (lastUpdated) return new Date(lastUpdated).toLocaleString();

      return "—";
    } catch {
      return "—";
    }
  };

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm space-y-4">
      {/* Title */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-sm">
        <span>
          <strong>Priority:</strong> {priority}
        </span>
        <span>
          <strong>Due:</strong> {dueDate}
        </span>
      </div>

      {/* ✅ Last updated */}
      <div className="text-xs text-muted-foreground">
        <strong>Last updated:</strong> {formatLastUpdated()}
      </div>

      {/* Controls */}
      <div className="grid gap-3 md:grid-cols-3">
        {/* Status */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Status</label>
          <select
            value={localStatus}
            onChange={(e) => setLocalStatus(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Reason */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Reason / Note</label>
          <select
            value={localReason}
            onChange={(e) => setLocalReason(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            {REASON_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            Progress:{" "}
            <span className="font-medium text-foreground">{localProgress}%</span>
          </label>

          <input
            type="range"
            min="0"
            max="100"
            value={localProgress}
            onChange={(e) => setLocalProgress(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Submit row */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handleSubmit}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-95"
        >
          Submit Update
        </button>

        <span className="text-sm text-muted-foreground">{savedMsg}</span>
      </div>
    </div>
  );
};

export default TaskCard;
