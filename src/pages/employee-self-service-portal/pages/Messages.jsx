// src/pages/employee-self-service-portal/pages/Messages.jsx
import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/firebase";
import {
  collection,
  query,
  where,
  getDoc,
  doc,
  addDoc,
  serverTimestamp,
  updateDoc,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import Icon from "../../../components/AppIcon";

const EmployeeMessages = () => {
  const [mentors, setMentors] = useState([]); // LEFT LIST (assigned + unlocked)
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null); // { id, mentorId, employeeId }
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  /* ✅ Load mentors list:
     - Always show assigned mentor
     - Also show any mentor who already has a chat with employee (mentor messaged first / chat exists)
  */
  useEffect(() => {
    if (!auth.currentUser) return;

    const employeeId = auth.currentUser.uid;
    let unsubChats = null;

    const run = async () => {
      try {
        // 1) Get assignedMentorId from employee profile
        const empSnap = await getDoc(doc(db, "users", employeeId));
        const assignedMentorId = empSnap.exists()
          ? empSnap.data().assignedMentorId
          : null;

        // 2) Listen to chats for this employee (unlocked mentors)
        const chatsQ = query(
          collection(db, "chats"),
          where("employeeId", "==", employeeId)
        );

        unsubChats = onSnapshot(
          chatsQ,
          async (snap) => {
            const mentorIdSet = new Set();
            if (assignedMentorId) mentorIdSet.add(assignedMentorId);

            // mentorId -> chatId mapping (if chat exists)
            const mentorToChat = new Map();
            snap.docs.forEach((d) => {
              const data = d.data();
              if (data.mentorId) {
                mentorIdSet.add(data.mentorId);
                mentorToChat.set(data.mentorId, d.id);
              }
            });

            // Fetch mentor docs
            const mentorDocs = await Promise.all(
              Array.from(mentorIdSet).map(async (mid) => {
                const ms = await getDoc(doc(db, "users", mid));
                if (!ms.exists()) return null;

                return {
                  id: ms.id,
                  ...ms.data(),
                  chatId: mentorToChat.get(mid) || null, // null => assigned mentor but no chat yet
                };
              })
            );

            const list = mentorDocs.filter(Boolean);
            setMentors(list);

            // Auto-select:
            // Prefer assigned mentor if present, otherwise first mentor in list
            if (!selectedMentor && list.length > 0) {
              let first =
                (assignedMentorId &&
                  list.find((m) => m.id === assignedMentorId)) ||
                list[0];

              setSelectedMentor(first);

              if (first.chatId) {
                setSelectedChat({
                  id: first.chatId,
                  mentorId: first.id,
                  employeeId,
                });
              } else {
                setSelectedChat(null);
              }
            }

            setLoading(false);
          },
          (err) => {
            console.error("Failed to listen chats:", err);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Failed to load mentors:", err);
        setLoading(false);
      }
    };

    run();

    return () => {
      if (unsubChats) unsubChats();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ✅ When employee clicks a mentor in LEFT panel:
     - If chat exists -> open it
     - If no chat yet (assigned mentor but mentor hasn't initiated) -> show "No conversation yet"
  */
  const handleSelectMentor = (m) => {
    const employeeId = auth.currentUser.uid;

    setSelectedMentor(m);

    if (m.chatId) {
      setSelectedChat({ id: m.chatId, mentorId: m.id, employeeId });
    } else {
      setSelectedChat(null);
      setMessages([]);
    }
  };

  /* ✅ REAL-TIME MESSAGE LISTENER (only when chat exists) */
  useEffect(() => {
    if (!selectedChat) return;

    const q = query(
      collection(db, "chats", selectedChat.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setMessages(msgs);
      },
      (err) => {
        console.error("Failed to load messages:", err);
      }
    );

    return () => unsubscribe();
  }, [selectedChat]);

  /* ✅ SEND MESSAGE:
     - Allowed only when chat exists (mentor has initiated / chat created)
  */
  const handleSend = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
      await addDoc(collection(db, "chats", selectedChat.id, "messages"), {
        text: message.trim(),
        senderId: auth.currentUser.uid,
        senderRole: "employee",
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "chats", selectedChat.id), {
        lastMessage: message.trim(),
        lastMessageAt: serverTimestamp(),
      });

      setMessage("");
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  return (
    <div className="flex gap-4 min-h-[70vh]">
      {/* LEFT: Mentors */}
      <div className="w-72 bg-card border border-border rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-3">Mentors</h2>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : mentors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No mentors found</p>
        ) : (
          <div className="space-y-2">
            {mentors.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelectMentor(m)}
                className={`w-full text-left p-3 rounded-lg border transition
                  ${
                    selectedMentor?.id === m.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
              >
                <p className="font-medium">{m.fullName || m.name || "Mentor"}</p>
                <p className="text-xs opacity-70">
                  {m.chatId ? "Chat available" : "Assigned mentor (no chat yet)"}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: CHAT */}
      <div className="flex-1 bg-card border border-border rounded-xl flex flex-col">
        {!selectedMentor ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a mentor
          </div>
        ) : !selectedChat ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground px-6 text-center">
            No conversation yet with <b className="mx-1">{selectedMentor.fullName}</b>.
            <br />
            Your assigned mentor will appear here once they message you first.
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Icon name="User" size={20} />
              <div>
                <p className="font-semibold">
                  {selectedMentor.fullName || selectedMentor.name || "Mentor"}
                </p>
                <p className="text-xs text-muted-foreground">Mentor</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No messages yet
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[70%] p-3 rounded-lg text-sm
                      ${
                        msg.senderId === auth.currentUser.uid
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                  >
                    {msg.text}
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message…"
                className="flex-1 px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeMessages;
