import React, { useEffect, useMemo, useState } from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";

import {
  subscribeMyNotifications,
  markAllMyNotificationsRead,
  markNotificationRead,
} from "../../../services/notifications";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../../firebase/firebase";

/* ================= UI CONFIG ================= */

const TYPE_UI = {
  task: { icon: "CheckSquare", color: "primary", label: "Task" },
  deadline: { icon: "Clock", color: "warning", label: "Deadline" },
  announcement: { icon: "Megaphone", color: "success", label: "Announcement" },
  feedback: { icon: "MessageSquare", color: "primary", label: "Feedback" },
  certificate: { icon: "Award", color: "success", label: "Certificate" },
  message: { icon: "Mail", color: "primary", label: "Message" },
  update: { icon: "Info", color: "primary", label: "Update" },
  admin: { icon: "Bell", color: "primary", label: "Admin" },
  general: { icon: "Bell", color: "primary", label: "Notification" },
};

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  /* ================= HELPERS ================= */

  const getColorClasses = (color) => {
    const colors = {
      primary: { bg: "bg-primary/10", icon: "var(--color-primary)" },
      success: { bg: "bg-success/10", icon: "var(--color-success)" },
      warning: { bg: "bg-warning/10", icon: "var(--color-warning)" },
      error: { bg: "bg-error/10", icon: "var(--color-error)" },
    };
    return colors?.[color] || colors.primary;
  };

  const toDateSafe = (timestamp) => {
    if (!timestamp) return null;
    if (timestamp?.toDate) return timestamp.toDate();
    const d = new Date(timestamp);
    return isNaN(d.getTime()) ? null : d;
  };

  const getTimeAgo = (timestamp) => {
    const time = toDateSafe(timestamp);
    if (!time) return "";

    const now = new Date();
    const diff = Math.floor((now - time) / (1000 * 60));
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const formatFullDate = (timestamp) => {
    const d = toDateSafe(timestamp);
    return d ? d.toLocaleString() : "";
  };

  /* ================= EMPLOYEE NOTIFICATIONS ================= */

  useEffect(() => {
    const unsub = subscribeMyNotifications({
      max: 20,
      onChange: (items) => {
        setNotifications(items);
        setLoading(false);
      },
      onError: () => setLoading(false),
    });

    return () => unsub?.();
  }, []);

  /* ================= ADMIN → EMPLOYEE NOTIFICATIONS ================= */

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      where("type", "==", "admin"),
      where("target", "in", ["employee", "all"]),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        isRead: true, // admin notifications are read-only for now
      }));
      setAdminNotifications(items);
    });

    return () => unsub();
  }, []);

  /* ================= MERGE & SORT ================= */

  const mergedNotifications = useMemo(() => {
    const map = new Map();

    [...notifications, ...adminNotifications].forEach((n) => {
      map.set(n.id, n);
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        toDateSafe(b.createdAt)?.getTime() -
        toDateSafe(a.createdAt)?.getTime()
    );
  }, [notifications, adminNotifications]);

  const unreadCount = useMemo(
    () => mergedNotifications.filter((n) => !n.isRead).length,
    [mergedNotifications]
  );

  /* ================= ACTIONS ================= */

  const onMarkAllRead = async () => {
    await markAllMyNotificationsRead(notifications);
  };

  const onOpenNotification = async (n) => {
    if (!n.isRead && n.userId) {
      await markNotificationRead(n);
    }
    setActive(n);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setActive(null);
  };

  const activeUI = TYPE_UI[active?.type] || TYPE_UI.general;
  const activeColors = getColorClasses(activeUI.color);

  /* ================= RENDER ================= */

  return (
    <>
      <div className="bg-card rounded-xl shadow-warm-md p-4 md:p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg md:text-xl font-semibold">Notifications</h2>

            {unreadCount > 0 && (
              <span className="px-2.5 py-1 bg-error rounded-full text-xs text-white">
                {unreadCount}
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            iconName="CheckCheck"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
          >
            Mark all read
          </Button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : mergedNotifications.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            mergedNotifications.map((n) => {
              const ui = TYPE_UI[n.type] || TYPE_UI.general;
              const colors = getColorClasses(ui.color);

              return (
                <button
                  key={n.id}
                  onClick={() => onOpenNotification(n)}
                  className={`w-full text-left rounded-xl p-4 border transition ${
                    n.isRead
                      ? "bg-muted/20 border-border"
                      : "bg-primary/5 border-primary/20"
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}
                    >
                      <Icon name={ui.icon} size={20} color={colors.icon} />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <h3 className="font-medium">{n.title}</h3>
                        {!n.isRead && (
                          <span className="w-2 h-2 bg-primary rounded-full mt-2" />
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {n.message}
                      </p>

                      <div className="flex gap-2 text-xs text-muted-foreground mt-2">
                        <Icon name="Clock" size={12} />
                        {getTimeAgo(n.createdAt)} • {ui.label}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onMouseDown={closeModal}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full max-w-xl bg-card p-6 rounded-2xl border"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between mb-4">
              <div className="flex gap-3">
                <div
                  className={`w-10 h-10 rounded-lg ${activeColors.bg} flex items-center justify-center`}
                >
                  <Icon
                    name={activeUI.icon}
                    size={20}
                    color={activeColors.icon}
                  />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    {activeUI.label}
                  </div>
                  <div className="text-lg font-semibold">{active.title}</div>
                </div>
              </div>

              <button onClick={closeModal}>
                <Icon name="X" size={18} />
              </button>
            </div>

            <p className="text-sm whitespace-pre-line">{active.message}</p>

            <div className="mt-4 text-xs text-muted-foreground flex gap-2">
              <Icon name="Clock" size={12} />
              {formatFullDate(active.createdAt)}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationCenter;
