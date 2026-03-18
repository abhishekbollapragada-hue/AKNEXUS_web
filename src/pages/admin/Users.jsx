import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // 🔥 Realtime Firestore listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(usersList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔎 Search + Role filter
  const filteredUsers = users.filter((user) => {
    const nameMatch =
      user.fullName?.toLowerCase().includes(search.toLowerCase()) ?? false;

    const roleMatch =
      roleFilter === "All" ||
      user.role?.toLowerCase() === roleFilter.toLowerCase();

    return nameMatch && roleMatch;
  });

  // 🟢 STRICT presence logic (LOGIN STATE ONLY)
    const isUserActive = (user) => {
        if (!user.lastSeen) return false;

        const now = Date.now();
        const lastSeen = user.lastSeen.toDate().getTime();

        return now - lastSeen < 2 * 60 * 1000; // 2 minutes
      };


  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold">All Users</h1>
        <p className="text-sm text-gray-500">
          View and monitor user activity in the system
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 rounded-lg border px-3 py-2 text-sm"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-48 rounded-lg border px-3 py-2 text-sm"
        >
          <option value="All">All Roles</option>
          <option value="admin">Admin</option>
          <option value="mentor">Mentor</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  Loading users...
                </td>
              </tr>
            )}

            {!loading &&
              filteredUsers.map((user) => {
                const active = isUserActive(user);

                return (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-3">
                      {user.fullName || "—"}
                    </td>

                    <td className="px-4 py-3">{user.email}</td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 capitalize">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                          active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            active ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                        {active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                );
              })}

            {!loading && filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}