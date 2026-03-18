// src/pages/mentor/MentorAttendance.jsx
import React, { useMemo, useState, useEffect } from "react";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import { buildAttendanceUIData } from "../../services/attendanceService";

/* ----------------- CSV Export Helpers ----------------- */
const csvEscape = (v) => {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const downloadCSV = (rows, filename = "attendance.csv") => {
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const MentorAttendance = () => {
  // Backend state
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters/UI state
  const [dateRange, setDateRange] = useState("This Month");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");
  const [exceptionsOnly, setExceptionsOnly] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Load attendance
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);

        const data = await buildAttendanceUIData({ date: new Date() });
        if (!mounted) return;

        const safe = Array.isArray(data) ? data : [];
        setEmployees(safe);
        setSelectedId((prev) => prev || safe?.[0]?.id || null);
      } catch (e) {
        console.error("Attendance load failed:", e);
        if (!mounted) return;
        setEmployees([]);
        setSelectedId(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const departments = useMemo(() => {
    const set = new Set(employees.map((e) => e.department).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [employees]);

  const statuses = ["All", "Present", "Absent", "Late", "On Leave"];

  const filtered = useMemo(() => {
    return employees
      .filter((e) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          (e.name || "").toLowerCase().includes(q) ||
          (e.email || "").toLowerCase().includes(q) ||
          (e.id || "").toLowerCase().includes(q)
        );
      })
      .filter((e) => (department === "All" ? true : e.department === department))
      .filter((e) => (status === "All" ? true : e.statusToday === status))
      .filter((e) =>
        exceptionsOnly ? e.statusToday === "Late" || e.statusToday === "Absent" : true
      );
  }, [employees, search, department, status, exceptionsOnly]);

  const selected = useMemo(() => {
    return employees.find((e) => e.id === selectedId) || null;
  }, [employees, selectedId]);

  // KPIs
  const kpi = useMemo(() => {
    const presentToday = employees.filter((e) => e.statusToday === "Present").length;
    const absentToday = employees.filter((e) => e.statusToday === "Absent").length;
    const lateWeek = employees.reduce((sum, e) => sum + (e.lateThisWeek || 0), 0);
    const avgMonth =
      employees.length > 0
        ? Math.round(
            employees.reduce((sum, e) => sum + (Number(e.monthPercent) || 0), 0) / employees.length
          )
        : 0;

    return { presentToday, absentToday, lateWeek, avgMonth };
  }, [employees]);

  const getStatusStyles = (s) => {
    switch (s) {
      case "Present":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Late":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Absent":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "On Leave":
        return "bg-slate-50 text-slate-700 border-slate-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">
            Monitor attendance trends and exceptions for your team.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2">
            <Icon name="Calendar" size={18} className="text-muted-foreground" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent outline-none text-sm"
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>Last 7 Days</option>
              <option>Custom (later)</option>
            </select>
          </div>

          <Button
            variant="secondary"
            className="rounded-xl"
            onClick={async () => {
              try {
                setLoading(true);
                const data = await buildAttendanceUIData({ date: new Date() });
                const safe = Array.isArray(data) ? data : [];
                setEmployees(safe);
                setSelectedId((prev) => prev || safe?.[0]?.id || null);
              } catch (e) {
                console.error("Attendance refresh failed:", e);
                setEmployees([]);
                setSelectedId(null);
              } finally {
                setLoading(false);
              }
            }}
          >
            <Icon name="RefreshCcw" size={16} className="mr-2" />
            Refresh
          </Button>

          {/* ✅ Export CSV */}
          <Button
            className="rounded-xl"
            onClick={() => {
              const header = [
                "Employee Name",
                "Email",
                "Department",
                "Role",
                "Status Today",
                "Check-in",
                "Check-out",
                "Work Hours",
                "Month %",
                "Late (week)",
                "Absent (month)",
                "User ID",
              ];

              const rows = employees.map((e) => [
                e.name,
                e.email,
                e.department,
                e.role,
                e.statusToday,
                e.checkIn,
                e.checkOut,
                e.workHours,
                e.monthPercent,
                e.lateThisWeek,
                e.absentThisMonth,
                e.id,
              ]);

              const today = new Date().toISOString().slice(0, 10);
              downloadCSV([header, ...rows], `attendance_${today}.csv`);
            }}
          >
            <Icon name="Download" size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        <KpiCard title="Present Today" value={kpi.presentToday} icon="UserCheck" hint="Employees marked present" />
        <KpiCard title="Absent Today" value={kpi.absentToday} icon="UserX" hint="Not checked in" />
        <KpiCard title="Late (This Week)" value={kpi.lateWeek} icon="AlarmClock" hint="Total late instances" />
        <KpiCard title="Avg Attendance" value={`${kpi.avgMonth}%`} icon="BarChart3" hint="Average this month" />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border bg-white p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border px-3 py-2 w-full lg:w-[360px]">
            <Icon name="Search" size={18} className="text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee (name, email, ID)"
              className="w-full outline-none text-sm bg-transparent"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 w-full sm:w-auto">
            <Icon name="Building2" size={18} className="text-muted-foreground" />
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="bg-transparent outline-none text-sm"
            >
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 w-full sm:w-auto">
            <Icon name="Filter" size={18} className="text-muted-foreground" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-transparent outline-none text-sm"
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setExceptionsOnly((v) => !v)}
            className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 w-full sm:w-auto ${
              exceptionsOnly ? "bg-slate-50" : "bg-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={18} className="text-muted-foreground" />
              <span className="text-sm">Exceptions only</span>
            </div>
            <span
              className={`h-5 w-10 rounded-full relative transition ${
                exceptionsOnly ? "bg-emerald-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                  exceptionsOnly ? "left-5" : "left-1"
                }`}
              />
            </span>
          </button>

          <div className="flex gap-2 lg:ml-auto">
            <Button
              variant="secondary"
              className="rounded-xl"
              onClick={() => {
                setSearch("");
                setDepartment("All");
                setStatus("All");
                setExceptionsOnly(false);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Table */}
        <div className="xl:col-span-2 rounded-2xl border bg-white overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Employees</h2>
              <p className="text-sm text-muted-foreground">
                Showing {filtered.length} of {employees.length}
              </p>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Icon name="CalendarRange" size={16} />
              <span>{dateRange}</span>
            </div>
          </div>

          {loading && <div className="px-4 py-6 text-sm text-muted-foreground">Loading attendance...</div>}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Today</th>
                  <th className="px-4 py-3 font-medium">Check-in</th>
                  <th className="px-4 py-3 font-medium">Check-out</th>
                  <th className="px-4 py-3 font-medium">Hours</th>
                  <th className="px-4 py-3 font-medium">This Month</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {!loading &&
                  filtered.map((e) => {
                    const active = e.id === selectedId;
                    return (
                      <tr
                        key={e.id}
                        onClick={() => setSelectedId(e.id)}
                        className={`border-t cursor-pointer hover:bg-slate-50 ${
                          active ? "bg-slate-50" : "bg-white"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-slate-200 flex items-center justify-center font-semibold text-slate-700">
                              {getInitials(e.name)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{e.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {e.email} • {e.department}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyles(
                              e.statusToday
                            )}`}
                          >
                            <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                            {e.statusToday}
                          </span>
                        </td>

                        <td className="px-4 py-3">{e.checkIn}</td>
                        <td className="px-4 py-3">{e.checkOut}</td>
                        <td className="px-4 py-3">{e.workHours}</td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-28 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500"
                                style={{
                                  width: `${Math.min(100, Math.max(0, Number(e.monthPercent) || 0))}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-10">
                              {Number(e.monthPercent) || 0}%
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <Button variant="secondary" className="rounded-xl">
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      No employees match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t flex items-center justify-between text-sm text-muted-foreground">
            <span>Tip: Click a row to see employee details.</span>
            <span>Pagination later (backend)</span>
          </div>
        </div>

        {/* Details panel */}
        <div className="rounded-2xl border bg-white p-4">
          <h2 className="font-semibold mb-3">Employee Details</h2>

          {!selected ? (
            <div className="text-sm text-muted-foreground">Select an employee to view details.</div>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-2xl bg-slate-200 flex items-center justify-center font-semibold text-slate-700">
                  {getInitials(selected.name)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{selected.name}</div>
                  <div className="text-sm text-muted-foreground truncate">{selected.email}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {selected.department} • {selected.id}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat label="Today" value={selected.statusToday} />
                <MiniStat label="Month %" value={`${Number(selected.monthPercent) || 0}%`} />
                <MiniStat label="Late (week)" value={selected.lateThisWeek || 0} />
                <MiniStat label="Absent (month)" value={selected.absentThisMonth || 0} />
              </div>

              <div className="mt-4 rounded-2xl border bg-slate-50 p-3">
                <div className="text-sm font-medium mb-2">Recent activity</div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center justify-between">
                    <span>Today</span>
                    <span>
                      {selected.checkIn !== "—" ? `Check-in ${selected.checkIn}` : "No check-in"}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Checkout</span>
                    <span>{selected.checkOut !== "—" ? selected.checkOut : "Not checked out"}</span>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Needs attention */}
      <div className="mt-6 rounded-2xl border bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">Needs Attention</h2>
            <p className="text-sm text-muted-foreground">
              Employees with exceptions (Late/Absent) to review quickly.
            </p>
          </div>
          <Button variant="secondary" className="rounded-xl">
            <Icon name="AlertTriangle" size={16} className="mr-2" />
            View All Exceptions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MentorAttendance;

/* ----------------- Small components ----------------- */

const KpiCard = ({ title, value, icon, hint }) => {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-2xl font-bold mt-1">{value}</div>
          <div className="text-xs text-muted-foreground mt-1">{hint}</div>
        </div>
        <div className="h-11 w-11 rounded-2xl bg-slate-50 border flex items-center justify-center">
          <Icon name={icon} size={18} className="text-slate-700" />
        </div>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value }) => {
  return (
    <div className="rounded-2xl border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold mt-1">{value}</div>
    </div>
  );
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "—";
};
