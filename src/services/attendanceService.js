// src/services/attendanceService.js
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";

// ---------- helpers ----------
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

const startOfWeek = (d) => {
  // Monday-start week
  const x = new Date(d);
  const day = x.getDay(); // 0 Sun..6 Sat
  const diff = (day === 0 ? -6 : 1) - day; // move to Monday
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfWeek = (d) => {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
};

const formatTime = (date) => {
  if (!date) return "—";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const diffHoursText = (inDate, outDate) => {
  if (!inDate || !outDate) return "—";
  const ms = outDate.getTime() - inDate.getTime();
  if (ms <= 0) return "—";
  const mins = Math.floor(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};

const monthBounds = (d) => {
  const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

const COLLECTIONS = {
  USERS: "users",
  ATTENDANCE: "attendance",
};

// ---------- AUTO-DETECT HELPERS ----------
const isFsTimestamp = (v) => v && typeof v === "object" && typeof v.toDate === "function";

const getUidFromAttendance = (log) =>
  log?.userId ||
  log?.uid ||
  log?.userUID ||
  log?.employeeId ||
  log?.employeeUid ||
  log?.user_id ||
  log?.user ||
  null;

const getCheckInTs = (log) =>
  log?.checkIn ||
  log?.checkInTime ||
  log?.checkInTimestamp ||
  log?.check_in ||
  log?.inTime ||
  log?.in ||
  null;

const getCheckOutTs = (log) =>
  log?.checkOut ||
  log?.checkOutTime ||
  log?.checkOutTimestamp ||
  log?.check_out ||
  log?.outTime ||
  log?.out ||
  null;

const getAnyTimeFromAttendance = (log) => {
  const ts =
    log?.createdAt ||
    log?.updatedAt ||
    getCheckInTs(log) ||
    getCheckOutTs(log) ||
    log?.timestamp ||
    log?.time ||
    log?.day ||
    log?.date; // can be string "YYYY-MM-DD"

  if (isFsTimestamp(ts)) return ts.toDate();
  if (ts instanceof Date) return ts;

  if (typeof ts === "string") {
    const parsed = new Date(ts);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

const getStatusFromAttendance = (log) =>
  (log?.status || log?.todayStatus || log?.state || "").toString().toLowerCase();

const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

// ---------- main functions ----------
export async function fetchUsers({ onlyEmployees = false } = {}) {
  const snap = await getDocs(collection(db, COLLECTIONS.USERS));
  let users = snap.docs.map((doc) => ({ docId: doc.id, ...doc.data() }));

  if (onlyEmployees) {
    users = users.filter((u) => (u.role || "").toLowerCase() === "employee");
  }

  return users;
}

export async function fetchAttendanceForRange({ from, to }) {
  const attCol = collection(db, COLLECTIONS.ATTENDANCE);

  // Try by 'createdAt'
  try {
    const q1 = query(
      attCol,
      where("createdAt", ">=", Timestamp.fromDate(from)),
      where("createdAt", "<=", Timestamp.fromDate(to))
    );
    const snap1 = await getDocs(q1);
    const logs1 = snap1.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    if (logs1.length > 0) return logs1;
  } catch (e) {
    console.warn("[attendanceService] Query by 'createdAt' failed:", e);
  }

  // Fallback: fetch all docs and filter
  const snapAll = await getDocs(attCol);
  const all = snapAll.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return all.filter((log) => {
    const t = getAnyTimeFromAttendance(log);
    if (!t) return false;
    return t >= from && t <= to;
  });
}

export async function buildAttendanceUIData({ date = new Date() }) {
  const users = await fetchUsers({ onlyEmployees: true });

  const todayFrom = startOfDay(date);
  const todayTo = endOfDay(date);

  const { start: mStart, end: mEnd } = monthBounds(date);
  const wStart = startOfWeek(date);
  const wEnd = endOfWeek(date);

  const todayLogs = await fetchAttendanceForRange({ from: todayFrom, to: todayTo });
  const monthLogs = await fetchAttendanceForRange({ from: mStart, to: mEnd });

  const todayByUser = new Map();
  for (const log of todayLogs) {
    const uid = getUidFromAttendance(log);
    if (!uid) continue;
    todayByUser.set(uid, log);
  }

  const monthByUser = new Map();
  for (const log of monthLogs) {
    const uid = getUidFromAttendance(log);
    if (!uid) continue;
    if (!monthByUser.has(uid)) monthByUser.set(uid, []);
    monthByUser.get(uid).push(log);
  }

  const ui = users.map((u) => {
    const uid = u.uid || u.userId || u.docId;

    const t = todayByUser.get(uid);
    const inTs = t ? getCheckInTs(t) : null;
    const outTs = t ? getCheckOutTs(t) : null;

    const checkIn = isFsTimestamp(inTs) ? inTs.toDate() : null;
    const checkOut = isFsTimestamp(outTs) ? outTs.toDate() : null;

    // ----- Today status -----
    let statusToday = "Absent";
    if (t) {
      const s = getStatusFromAttendance(t);
      if (s === "late") statusToday = "Late";
      else if (s === "present") statusToday = "Present";
      else if (s === "absent") statusToday = "Absent";
      else if (checkIn) statusToday = "Present";
    }

    const mlogs = monthByUser.get(uid) || [];

    // ----- Month percent (based on checkIn days) -----
    const presentDaysSet = new Set(
      mlogs
        .map((log) => {
          const ts = getCheckInTs(log);
          return isFsTimestamp(ts) ? ts.toDate() : null;
        })
        .filter(Boolean)
        .map(dayKey)
    );

    const totalDays = Math.max(
      1,
      Math.min(date.getDate(), new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate())
    );

    const monthPercent = Math.round((presentDaysSet.size / totalDays) * 100);

    // ----- Late this week -----
    const lateThisWeek = mlogs.filter((log) => {
      const s = getStatusFromAttendance(log);
      if (s !== "late") return false;
      const t = getAnyTimeFromAttendance(log);
      if (!t) return false;
      return t >= wStart && t <= wEnd;
    }).length;

    // ----- Absent this month (unique days) -----
    const absentDaysSet = new Set(
      mlogs
        .filter((log) => getStatusFromAttendance(log) === "absent")
        .map((log) => getAnyTimeFromAttendance(log))
        .filter(Boolean)
        .map(dayKey)
    );

    return {
      id: uid,
      name: u.fullName || u.name || u.displayName || "—",
      email: u.email || "—",
      department: u.department || "General",
      role: u.role || "Employee",
      statusToday,
      checkIn: formatTime(checkIn),
      checkOut: formatTime(checkOut),
      workHours: diffHoursText(checkIn, checkOut),
      monthPercent: Number.isFinite(monthPercent) ? monthPercent : 0,
      lateThisWeek,
      absentThisMonth: absentDaysSet.size,
    };
  });

  return ui;
}
