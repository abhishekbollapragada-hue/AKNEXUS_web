import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import Icon from "../../components/AppIcon";

const MentorMessages = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  /* ✅ FIXED: Load employees AFTER auth is ready (refresh-safe) */
  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setEmployees([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "users"),
        where("role", "==", "employee")
      );

      const unsubUsers = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          setEmployees(list);
          setLoading(false);
        },
        (err) => {
          console.error("Failed to load employees:", err);
          setLoading(false);
        }
      );

      // cleanup Firestore listener
      return () => unsubUsers();
    });

    // cleanup auth listener
    return () => unsubAuth();
  }, []);

  /* ✅ Open chat with employee (create chat if not exists) */
  const openChatWithEmployee = async (emp) => {
    if (!auth.currentUser) return;

    try {
      const q = query(
        collection(db, "chats"),
        where("mentorId", "==", auth.currentUser.uid),
        where("employeeId", "==", emp.id)
      );

      const snap = await getDocs(q);

      let chatId;
      if (!snap.empty) {
        chatId = snap.docs[0].id;
      } else {
        const newChatRef = await addDoc(collection(db, "chats"), {
          mentorId: auth.currentUser.uid,
          employeeId: emp.id,
          createdAt: serverTimestamp(),
        });
        chatId = newChatRef.id;
      }

      setSelectedChat({
        id: chatId,
        mentorId: auth.currentUser.uid,
        employeeId: emp.id,
        employee: emp,
      });
    } catch (err) {
      console.error("Failed to open chat:", err);
    }
  };

  /* ✅ Load messages when chat selected */
  useEffect(() => {
    if (!selectedChat) return;

    const q = query(
      collection(db, "chats", selectedChat.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setMessages(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        );
      },
      (err) => {
        console.error("Failed to load messages:", err);
      }
    );

    return () => unsub();
  }, [selectedChat]);

  /* ✅ Send message */
  const handleSend = async () => {
    if (!message.trim() || !selectedChat || !auth.currentUser) return;

    try {
      await addDoc(
        collection(db, "chats", selectedChat.id, "messages"),
        {
          text: message.trim(),
          senderId: auth.currentUser.uid,
          senderRole: "mentor",
          createdAt: serverTimestamp(),
        }
      );

      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="flex gap-4 min-h-[70vh]">
      {/* LEFT: Employees */}
      <div className="w-72 bg-card border border-border rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-3">Employees</h2>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : employees.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No employees found
          </p>
        ) : (
          <div className="space-y-2">
            {employees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => openChatWithEmployee(emp)}
                className={`w-full text-left p-3 rounded-lg border transition
                  ${
                    selectedChat?.employeeId === emp.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
              >
                <p className="font-medium">{emp.fullName}</p>
                <p className="text-xs opacity-70">Employee</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Chat */}
      <div className="flex-1 bg-card border border-border rounded-xl flex flex-col">
        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select an employee to start conversation
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Icon name="User" size={20} />
              <div>
                <p className="font-semibold">
                  {selectedChat.employee.fullName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Employee
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[70%] p-3 rounded-lg text-sm
                    ${
                      msg.senderRole === "mentor"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message…"
                className="flex-1 px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
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

export default MentorMessages;
