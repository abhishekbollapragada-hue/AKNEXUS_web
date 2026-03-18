import React, { useEffect, useMemo, useState } from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";

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
} from "firebase/firestore";

const LATE_HOUR = 10; // after 10:00 AM => Late

const AttendanceWidget = () => {
  const [userId, setUserId] = useState(null);

  const [loading, setLoading] = useState(true);

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [todayDocId, setTodayDocId] = useState(null);
  const [todayRecord, setTodayRecord] = useState({
    checkIn: null,
    checkOut: null,
    status: "Present",
  });

  const [records, setRecords] = useState([]);

  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const monthKey = useMemo(() => formatMonthKey(new Date()), []);

  // ✅ auth
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUserId(u?.uid || null));
    return () => unsub();
  }, []);

  // ✅ live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nowTime = useMemo(
    () =>
      currentTime?.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    [currentTime]
  );

  // ✅ helpers
  const toTitleCase = (s) => {
    if (!s) return "";
    const x = String(s).toLowerCase();
    return x.charAt(0).toUpperCase() + x.slice(1);
  };

  const isLateByCheckIn = (checkInTs) => {
    if (!checkInTs) return false;
    const d = checkInTs.toDate ? checkInTs.toDate() : checkInTs;
    return d.getHours() >= LATE_HOUR;
  };

  const getStatusForNow = () => {
    const now = new Date();
    return now.getHours() >= LATE_HOUR ? "late" : "present";
  };

  const refreshRecords = async () => {
    const qy = query(
      collection(db, "attendance"),
      where("userId", "==", userId),
      orderBy("date", "desc"),
      limit(60)
    );
    const snap = await getDocs(qy);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setRecords(list);
    return list;
  };

  const loadToday = async () => {
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

      const statusTitle = toTitleCase(loadedData.status || "present");
      setTodayRecord({
        checkIn: loadedData.checkIn || null,
        checkOut: loadedData.checkOut || null,
        status: statusTitle,
      });

      // also set checked in/out state
      const checkedIn = !!loadedData.checkIn && !loadedData.checkOut;
      setIsCheckedIn(checkedIn);

      if (loadedData.checkIn) {
        const dt =
          loadedData.checkIn?.toDate?.() || new Date(loadedData.checkIn);
        setCheckInTime(dt);
      } else {
        setCheckInTime(null);
      }

      // Ensure "Late" shown correctly based on check-in
      if (loadedData.checkIn && isLateByCheckIn(loadedData.checkIn)) {
        setTodayRecord((prev) => ({ ...prev, status: "Late" }));
      }
    } else {
      // no record today
      const fallbackId = `${userId}_${todayKey}`;
      setTodayDocId(fallbackId);
      setTodayRecord({ checkIn: null, checkOut: null, status: "Present" });
      setIsCheckedIn(false);
      setCheckInTime(null);
    }
  };

  // ✅ load data (same style as Attendance.jsx)
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const run = async () => {
      setLoading(true);
      await refreshRecords();
      await loadToday();
      setLoading(false);
    };

    run().catch((e) => {
      console.error("AttendanceWidget load error:", e);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, todayKey]);

  const handleCheckIn = async () => {
    if (!userId) return;
    if (todayRecord.checkIn) return;

    setLoading(true);
    try {
      const targetId = todayDocId || `${userId}_${todayKey}`;
      const ref = doc(db, "attendance", targetId);

      await setDoc(
        ref,
        {
          userId,
          date: todayKey, // ✅ IMPORTANT: same as Attendance.jsx
          status: getStatusForNow(), // present/late
          checkIn: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await refreshRecords();
      await loadToday();
    } catch (e) {
      console.error("CHECK IN ERROR:", e);
      alert(e?.message || "Check-in failed. Open console (F12) for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!userId) return;
    if (!todayRecord.checkIn) return;
    if (todayRecord.checkOut) return;

    setLoading(true);
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

      await refreshRecords();
      await loadToday();
    } catch (e) {
      console.error("CHECK OUT ERROR:", e);
      alert(e?.message || "Check-out failed. Open console (F12) for details.");
    } finally {
      setLoading(false);
    }
  };

  const calculateWorkHours = () => {
    if (!checkInTime) return "0h 0m";
    const diff = currentTime - checkInTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // ✅ Monthly summary EXACTLY like Attendance.jsx
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

    // ✅ exactly like Attendance.jsx: percentage uses present only (late not included)
    const percentage = total ? Math.round((present / total) * 100) : 0;

    return { present, absent, late, total, percentage };
  }, [monthRecords]);

  return (
    <div className="bg-card rounded-xl shadow-warm-md p-4 md:p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg md:text-xl lg:text-2xl font-heading font-semibold text-foreground">
          Attendance Tracker
        </h2>

        <div
          className={`px-3 py-1.5 rounded-lg ${
            isCheckedIn ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isCheckedIn ? "bg-success animate-pulse" : "bg-muted-foreground"
              }`}
            />
            <span className="text-sm font-medium">
              {isCheckedIn ? "Checked In" : "Not Checked In"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 rounded-xl p-4 md:p-6 mb-6">
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground mb-2">Current Time</p>
          <p className="text-2xl md:text-3xl font-heading font-semibold text-foreground data-text">
            {nowTime}
          </p>
        </div>

        {isCheckedIn && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Check-In Time</p>
              <p className="text-base md:text-lg font-medium text-foreground data-text">
                {formatTime(todayRecord.checkIn) || "-"}
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Work Hours</p>
              <p className="text-base md:text-lg font-medium text-foreground data-text">
                {calculateWorkHours()}
              </p>
            </div>
          </div>
        )}

        <Button
          variant={todayRecord.checkIn && !todayRecord.checkOut ? "destructive" : "default"}
          iconName={todayRecord.checkIn && !todayRecord.checkOut ? "LogOut" : "LogIn"}
          iconPosition="left"
          loading={loading}
          onClick={
            todayRecord.checkIn && !todayRecord.checkOut ? handleCheckOut : handleCheckIn
          }
          fullWidth
        >
          {todayRecord.checkIn && !todayRecord.checkOut ? "Check Out" : "Check In"}
        </Button>
      </div>

      <div>
        <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-4">
          Monthly Summary
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-success/10 rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="CheckCircle" size={16} color="var(--color-success)" />
              <p className="text-xs md:text-sm text-success font-medium">Present</p>
            </div>
            <p className="text-xl md:text-2xl font-heading font-semibold text-success data-text">
              {summary.present}
            </p>
          </div>

          <div className="bg-error/10 rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="XCircle" size={16} color="var(--color-error)" />
              <p className="text-xs md:text-sm text-error font-medium">Absent</p>
            </div>
            <p className="text-xl md:text-2xl font-heading font-semibold text-error data-text">
              {summary.absent}
            </p>
          </div>

          <div className="bg-warning/10 rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Clock" size={16} color="var(--color-warning)" />
              <p className="text-xs md:text-sm text-warning font-medium">Late</p>
            </div>
            <p className="text-xl md:text-2xl font-heading font-semibold text-warning data-text">
              {summary.late}
            </p>
          </div>

          <div className="bg-primary/10 rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Percent" size={16} color="var(--color-primary)" />
              <p className="text-xs md:text-sm text-primary font-medium">Rate</p>
            </div>
            <p className="text-xl md:text-2xl font-heading font-semibold text-primary data-text">
              {summary.percentage}%
            </p>
          </div>
        </div>

        {summary.total > 0 && summary.percentage < 75 && (
          <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon
                name="AlertTriangle"
                size={16}
                color="var(--color-warning)"
                className="flex-shrink-0 mt-0.5"
              />
              <p className="text-xs md:text-sm text-warning">
                Your attendance is below 75%. Maintain at least 75% to be eligible for certificate.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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

function formatTime(ts) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : ts;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default AttendanceWidget;
