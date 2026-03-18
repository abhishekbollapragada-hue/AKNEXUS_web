import { useEffect, useState } from "react";
import Icon from "../../../components/AppIcon";

import { addDoc, collection, orderBy, query, onSnapshot, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../firebase/firebase";

const AdminSendNotification = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [sending, setSending] = useState(false);

  const [sentNotifications, setSentNotifications] = useState([]);

  // 🔹 Load sent notifications (latest first)
  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(n => n.type === "admin"); // ONLY admin notifications

      setSentNotifications(list);
    });

    return () => unsub();
  }, []);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      alert("Title and message are required");
      return;
    }

    try {
      setSending(true);

      await addDoc(collection(db, "notifications"), {
        title: title.trim(),
        message: message.trim(),

        type: "admin",
        target, // all | mentor | employee

        sentBy: auth.currentUser?.uid || null,
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setMessage("");
      setTarget("all");

      alert("Notification sent ✅");
    } catch (err) {
      console.error("Send notification failed:", err);
      alert("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Send Notification</h1>
        <p className="text-muted-foreground">
          Send system notifications to employees, mentors, or everyone
        </p>
      </div>

      {/* Send box */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Target Audience</label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background"
          >
            <option value="all">All Users</option>
            <option value="employee">Employees</option>
            <option value="mentor">Mentors</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Icon name="Send" size={18} />
            {sending ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </div>

      {/* Sent notifications */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Sent Notifications</h2>

        {sentNotifications.length === 0 ? (
          <p className="text-muted-foreground">No notifications sent yet.</p>
        ) : (
          <div className="space-y-3">
            {sentNotifications.map(n => (
              <div
                key={n.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border"
              >
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {n.createdAt?.toDate?.().toLocaleString() || ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSendNotification;
