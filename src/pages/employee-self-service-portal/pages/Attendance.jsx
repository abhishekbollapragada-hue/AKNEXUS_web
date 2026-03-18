import React, { useEffect, useMemo, useState } from "react";
import { auth, db } from "../../../firebase/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  deleteDoc,
} from "firebase/firestore";

const LATE_HOUR = 10; // ✅ after 10:00 AM => Late

const Attendance = () => {
  useEffect(() => {
    document.title = "My Attendance - AK Nexus";
  }, []);

  // ✅ Reliable userId
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUserId(u?.uid || null));
    return () => unsub();
  }, []);

  const [loading, setLoading] = useState(true);

  const [todayRecord, setTodayRecord] = useState({
    checkIn: null,
    checkOut: null,
    status: "Present",
  });

  const [todayDocId, setTodayDocId] = useState(null);
  const [records, setRecords] = useState([]);

  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const monthKey = useMemo(() => formatMonthKey(new Date()), []);

  // Live clock
  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const nowTime = useMemo(
    () => clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    [clock]
  );

  const todayDate = useMemo(
    () =>
      clock.toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [clock]
  );

  const statusStyle = (status) => {
    if (status === "Present")
      return "text-green-700 bg-green-100 border-green-200";
    if (status === "Late")
      return "text-yellow-700 bg-yellow-100 border-yellow-200";
    return "text-red-700 bg-red-100 border-red-200";
  };

  const refreshRecords = async () => {
    const q = query(
      collection(db, "attendance"),
      where("userId", "==", userId),
      orderBy("date", "desc"),
      limit(60)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setRecords(list);
    return list;
  };

  // ✅ Remove duplicates (same date)
  const cleanupDuplicates = async (list) => {
    const byDate = new Map();
    for (const r of list) {
      if (!r.date) continue;
      if (!byDate.has(r.date)) byDate.set(r.date, []);
      byDate.get(r.date).push(r);
    }

    const deletes = [];

    for (const [date, arr] of byDate.entries()) {
      if (arr.length <= 1) continue;

      const score = (x) => {
        const hasIn = !!x.checkIn;
        const hasOut = !!x.checkOut;
        const updated = x.updatedAt?.toDate ? x.updatedAt.toDate().getTime() : 0;
        const created = x.createdAt?.toDate ? x.createdAt.toDate().getTime() : 0;
        return (hasOut ? 100 : 0) + (hasIn ? 10 : 0) + Math.max(updated, created) / 1e12;
      };

      const sorted = [...arr].sort((a, b) => score(b) - score(a));
      const remove = sorted.slice(1);

      for (const r of remove) {
        deletes.push(deleteDoc(doc(db, "attendance", r.id)));
      }
    }

    if (deletes.length > 0) {
      await Promise.allSettled(deletes);
      const refreshed = await refreshRecords();
      return refreshed;
    }
    return list;
  };

  // ✅ Late check based on CHECK-IN time (not now)
  const isLateByCheckIn = (checkInTs) => {
    if (!checkInTs) return false;
    const d = checkInTs.toDate ? checkInTs.toDate() : checkInTs;
    return d.getHours() >= LATE_HOUR; // 10 AM and later
  };

  // ✅ NEW: Fix Late status for ALL records (not just today)
  const fixLateStatuses = async (list) => {
    const updates = [];

    for (const r of list) {
      if (!r?.id || !r?.checkIn) continue;

      const current = (r.status || "present").toLowerCase();

      // If check-in was at/after 10 AM, status must be "late"
      if (isLateByCheckIn(r.checkIn) && current !== "late") {
        updates.push(
          updateDoc(doc(db, "attendance", r.id), {
            status: "late",
            updatedAt: serverTimestamp(),
          })
        );
      }
    }

    if (updates.length > 0) {
      await Promise.allSettled(updates);
      const refreshed = await refreshRecords();
      setRecords(refreshed);
      return refreshed;
    }

    return list;
  };

  // Used only when creating check-in now
  const getStatusForNow = () => {
    const now = new Date();
    return now.getHours() >= LATE_HOUR ? "late" : "present";
  };

  // Load data
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const run = async () => {
      setLoading(true);

      // 1) Load list
      const list = await refreshRecords();

      // 2) Remove duplicates
      const cleaned = await cleanupDuplicates(list);
      setRecords(cleaned);

      // 3) ✅ Fix late statuses for ALL records
      const fixed = await fixLateStatuses(cleaned);
      setRecords(fixed);

      // Load today's record (fixed id first)
      const fixedId = `${userId}_${todayKey}`;
      const fixedRef = doc(db, "attendance", fixedId);
      const fixedSnap = await getDoc(fixedRef);

      let loadedId = null;
      let loadedData = null;

      if (fixedSnap.exists()) {
        loadedId = fixedId;
        loadedData = fixedSnap.data();
      } else {
        const qToday = query(
          collection(db, "attendance"),
          where("userId", "==", userId),
          where("date", "==", todayKey),
          limit(1)
        );
        const todayQuerySnap = await getDocs(qToday);

        if (!todayQuerySnap.empty) {
          const d = todayQuerySnap.docs[0];
          loadedId = d.id;
          loadedData = d.data();
        }
      }

      if (loadedId && loadedData) {
        setTodayDocId(loadedId);

        // set record first
        setTodayRecord({
          checkIn: loadedData.checkIn || null,
          checkOut: loadedData.checkOut || null,
          status: toTitleCase(loadedData.status || "present"),
        });

        // ✅ Ensure Today UI shows late correctly (already handled globally, but keep safe)
        const hasCheckIn = !!loadedData.checkIn;
        if (hasCheckIn && isLateByCheckIn(loadedData.checkIn)) {
          setTodayRecord((prev) => ({ ...prev, status: "Late" }));
        }
      } else {
        // no record today
        setTodayDocId(fixedId);
        setTodayRecord({ checkIn: null, checkOut: null, status: "Present" });
      }

      setLoading(false);
    };

    run().catch((e) => {
      console.error("Attendance fetch error:", e);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, todayKey]);

  const isCheckedIn = !!todayRecord.checkIn;
  const isCheckedOut = !!todayRecord.checkOut;

  // ✅ Prevent double check-in
  const handleCheckIn = async () => {
    if (!userId) {
      alert("User not logged in. Please login again.");
      return;
    }

    if (isCheckedIn) {
      alert("You already checked in today ✅");
      return;
    }

    try {
      const targetId = todayDocId || `${userId}_${todayKey}`;
      const ref = doc(db, "attendance", targetId);

      await setDoc(
        ref,
        {
          userId,
          date: todayKey,
          status: getStatusForNow(), // present/late
          checkIn: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      const snap = await getDoc(ref);
      const data = snap.data();

      setTodayDocId(targetId);
      setTodayRecord({
        checkIn: data?.checkIn || null,
        checkOut: data?.checkOut || null,
        status: toTitleCase(data?.status || "present"),
      });

      const list = await refreshRecords();
      const cleaned = await cleanupDuplicates(list);
      const fixed = await fixLateStatuses(cleaned);
      setRecords(fixed);
    } catch (e) {
      console.error("CHECK IN ERROR:", e);
      alert(e?.message || "Check-in failed. Open console (F12) for details.");
    }
  };

  // ✅ Validate checkout
  const handleCheckOut = async () => {
    if (!userId) {
      alert("User not logged in. Please login again.");
      return;
    }

    if (!isCheckedIn) {
      alert("Please check in first ✅");
      return;
    }

    if (isCheckedOut) {
      alert("You already checked out today ✅");
      return;
    }

    try {
      const targetId = todayDocId || `${userId}_${todayKey}`;
      const ref = doc(db, "attendance", targetId);

      const existsSnap = await getDoc(ref);
      if (!existsSnap.exists()) {
        alert("No record found for today. Please check in again.");
        return;
      }

      await updateDoc(ref, {
        checkOut: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const snap = await getDoc(ref);
      const data = snap.data();

      setTodayDocId(targetId);
      setTodayRecord({
        checkIn: data?.checkIn || null,
        checkOut: data?.checkOut || null,
        status: toTitleCase(data?.status || "present"),
      });

      const list = await refreshRecords();
      const cleaned = await cleanupDuplicates(list);
      const fixed = await fixLateStatuses(cleaned);
      setRecords(fixed);
    } catch (e) {
      console.error("CHECK OUT ERROR:", e);
      alert(e?.message || "Check-out failed. Open console (F12) for details.");
    }
  };

  // Month summary (current month only)
  const monthRecords = useMemo(() => {
    return records.filter(
      (r) => typeof r.date === "string" && r.date.startsWith(monthKey)
    );
  }, [records, monthKey]);

  const summary = useMemo(() => {
    const present = monthRecords.filter((r) => (r.status || "") === "present").length;
    const absent = monthRecords.filter((r) => (r.status || "") === "absent").length;
    const late = monthRecords.filter((r) => (r.status || "") === "late").length;
    const total = monthRecords.length || 0;
    const percentage = total ? Math.round((present / total) * 100) : 0;
    return { present, absent, late, total, percentage };
  }, [monthRecords]);

  const StatCard = ({ label, value }) => (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-end justify-between">
        <h2 className="text-2xl font-bold text-foreground">{value}</h2>
      </div>
    </div>
  );

  if (!userId) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold">Attendance</h2>
        <p className="text-muted-foreground mt-1">Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Attendance</h1>
        <p className="text-muted-foreground mt-1">
          View your daily attendance and monthly summary
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Summary shows current month only.
        </p>
      </div>

      {/* TODAY ACTION */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  <div className="mt-1 text-4xl sm:text-5xl font-bold tracking-tight">
                    {nowTime}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{todayDate}</p>
                </div>

                <span
                  className={`h-fit text-xs px-3 py-1 rounded-full border ${statusStyle(
                    todayRecord.status
                  )}`}
                >
                  {todayRecord.status}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">Check In</p>
                  <p className="mt-1 text-lg font-semibold">
                    {formatTime(todayRecord.checkIn) || "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">Check Out</p>
                  <p className="mt-1 text-lg font-semibold">
                    {formatTime(todayRecord.checkOut) || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[320px]">
              {loading ? (
                <div className="w-full rounded-2xl border border-border bg-muted/30 py-4 text-center font-semibold">
                  Loading...
                </div>
              ) : !isCheckedIn ? (
                <button
                  onClick={handleCheckIn}
                  className="w-full rounded-2xl bg-emerald-600 text-white py-4 text-lg font-semibold hover:bg-emerald-700 transition"
                >
                  Check In
                </button>
              ) : !isCheckedOut ? (
                <button
                  onClick={handleCheckOut}
                  className="w-full rounded-2xl bg-slate-900 text-white py-4 text-lg font-semibold hover:bg-slate-800 transition"
                >
                  Check Out
                </button>
              ) : (
                <div className="w-full rounded-2xl border border-green-200 bg-green-50 text-green-800 py-4 text-center font-semibold">
                  Attendance Completed ✅
                </div>
              )}

              <p className="mt-3 text-xs text-muted-foreground text-center">
                Late if check-in is after 10:00 AM.
              </p>
            </div>
          </div>
        </div>

        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500 opacity-70" />
      </div>

      {/* STATS (MONTH) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Present (Month)" value={summary.present} />
        <StatCard label="Absent (Month)" value={summary.absent} />
        <StatCard label="Late (Month)" value={summary.late} />
        <StatCard label="Total Days (Month)" value={summary.total} />
        <StatCard label="Attendance % (Month)" value={`${summary.percentage}%`} />
      </div>

      {/* TABLE */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Attendance Records</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Daily check-in, check-out and total hours worked
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Date</th>
                <th className="text-left font-medium px-4 py-3">Check In</th>
                <th className="text-left font-medium px-4 py-3">Check Out</th>
                <th className="text-left font-medium px-4 py-3">Hours Worked</th>
                <th className="text-right font-medium px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {records.map((r) => {
                const checkIn = r.checkIn || null;
                const checkOut = r.checkOut || null;
                const hours = calcHoursWorked(checkIn, checkOut);

                return (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{r.date}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatTime(checkIn) || "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatTime(checkOut) || "-"}
                    </td>
                    <td className="px-4 py-3">{hours}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex text-xs px-3 py-1 rounded-full border ${statusStyle(
                          toTitleCase(r.status || "present")
                        )}`}
                      >
                        {toTitleCase(r.status || "present")}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {records.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ---------------- helpers ---------------- */

function formatDateKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatMonthKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function toTitleCase(s) {
  if (!s) return "";
  const x = String(s).toLowerCase();
  return x.charAt(0).toUpperCase() + x.slice(1);
}

function formatTime(ts) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : ts;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function calcHoursWorked(checkIn, checkOut) {
  if (!checkIn || !checkOut) return "-";
  const inDate = checkIn.toDate ? checkIn.toDate() : checkIn;
  const outDate = checkOut.toDate ? checkOut.toDate() : checkOut;

  const diffMs = outDate.getTime() - inDate.getTime();
  if (diffMs <= 0) return "-";

  const totalMins = Math.round(diffMs / (1000 * 60));
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return `${hrs}h ${mins}m`;
}

export default Attendance;
