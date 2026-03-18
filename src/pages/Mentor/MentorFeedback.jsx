import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";

const MentorFeedback = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  const handleSend = async (e) => {
    e.preventDefault();
    setStatus({ type: "", text: "" });

    if (!message.trim()) {
      setStatus({ type: "error", text: "Please enter your feedback message." });
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setStatus({ type: "error", text: "You must be logged in to send feedback." });
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "feedback"), {
        senderUid: user.uid,
        senderRole: "mentor",
        senderEmail: user.email || "",
        subject: subject.trim(),
        message: message.trim(),
        status: "unread",
        createdAt: serverTimestamp(),
      });

      setSubject("");
      setMessage("");
      setStatus({ type: "success", text: "Feedback sent to Admin ✅" });
    
    } catch (err) {
      console.error("Feedback send error:", err);
      setStatus({ type: "error", text: err?.message || "Failed to send feedback." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl">
      <h1 className="text-2xl font-semibold">Feedback</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Send your feedback to Admin.
      </p>

      <form
        onSubmit={handleSend}
        className="mt-6 bg-card border border-border rounded-2xl p-6 space-y-5 max-w-2xl"
      >
        <div>
          <label className="text-sm font-medium">Subject (optional)</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-2 w-full bg-background border border-border rounded-xl px-4 py-3 outline-none"
            placeholder="Ex: Feature request, bug report..."
          />
        </div>

        <div>
          <label className="text-sm font-medium">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-2 w-full min-h-[160px] bg-background border border-border rounded-xl px-4 py-3 outline-none resize-none"
            placeholder="Write your feedback..."
          />
        </div>

        {status.text && (
          <div
            className={`text-sm rounded-xl px-4 py-3 border ${
              status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {status.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Feedback"}
        </button>
      </form>
    </div>
  );
};

export default MentorFeedback;
