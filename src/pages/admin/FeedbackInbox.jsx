import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

export default function AdminFeedbackInbox() {
  const [items, setItems] = useState([]);
  const [roleFilter, setRoleFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItems(data);

        // keep selected in sync if it changes in Firestore
        if (selected?.id) {
          const updated = data.find((x) => x.id === selected.id);
          if (updated) setSelected(updated);
        }
      },
      (err) => {
        console.error("Feedback inbox error:", err);
      }
    );

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (roleFilter === "all") return items;
    return items.filter((x) => x.senderRole === roleFilter);
  }, [items, roleFilter]);

  const markStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "feedback", id), { status });
    } catch (err) {
      console.error("Mark status error:", err);
    }
  };

  const handleMarkRead = () => {
    if (!selected?.id) return;

    markStatus(selected.id, "read");

    // update selected instantly
    setSelected((prev) => ({ ...prev, status: "read" }));

    // update list instantly
    setItems((prev) =>
      prev.map((it) => (it.id === selected.id ? { ...it, status: "read" } : it))
    );
  };

  const handleMarkUnread = () => {
    if (!selected?.id) return;

    markStatus(selected.id, "unread");

    setSelected((prev) => ({ ...prev, status: "unread" }));

    setItems((prev) =>
      prev.map((it) =>
        it.id === selected.id ? { ...it, status: "unread" } : it
      )
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Feedback Inbox</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Feedback sent by employees and mentors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-card border border-border rounded-xl px-4 py-2"
          >
            <option value="all">All</option>
            <option value="employee">Employee</option>
            <option value="mentor">Mentor</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* List */}
        <div className="lg:col-span-1 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border font-medium">
            Messages ({filtered.length})
          </div>

          <div className="max-h-[70vh] overflow-auto">
            {filtered.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                No feedback yet.
              </div>
            ) : (
              filtered.map((x) => (
                <button
                  key={x.id}
                  onClick={() => setSelected(x)}
                  className={`w-full text-left px-4 py-3 border-b border-border hover:bg-muted transition ${
                    selected?.id === x.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium truncate">
                      {x.subject?.trim() ? x.subject : "(No subject)"}
                    </div>
                    {x.status === "unread" && (
                      <span className="text-xs px-2 py-1 rounded-full bg-primary text-primary-foreground">
                        new
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground mt-1 capitalize">
                    {x.senderRole || "unknown"} • {x.senderEmail || "no email"}
                  </div>

                  <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {x.message}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          {!selected ? (
            <div className="text-sm text-muted-foreground">
              Select a feedback message to read.
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {selected.subject?.trim() ? selected.subject : "(No subject)"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    From:{" "}
                    <span className="font-medium">
                      {selected.senderEmail || "—"}
                    </span>{" "}
                    • Role:{" "}
                    <span className="capitalize">
                      {selected.senderRole || "—"}
                    </span>
                  </p>
                </div>

                <div className="flex gap-2">
                  {selected.status === "unread" ? (
                    <button
                      onClick={handleMarkRead}
                      className="px-4 py-2 rounded-xl border border-border hover:bg-muted"
                    >
                      Mark Read
                    </button>
                  ) : (
                    <button
                      onClick={handleMarkUnread}
                      className="px-4 py-2 rounded-xl border border-border hover:bg-muted"
                    >
                      Mark Unread
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 whitespace-pre-wrap text-sm leading-6 bg-background border border-border rounded-xl p-4">
                {selected.message}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
