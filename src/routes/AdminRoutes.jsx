import { Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

import Dashboard from "../pages/admin/Dashboard";
import AllUsers from "../pages/admin/AllUsers";
import Attendance from "../pages/admin/Attendance";
import Certifications from "../pages/admin/Certifications";
import AddUser from "../pages/admin/AddUser";
import SystemControl from "../pages/admin/SystemControl";
import Progress from "../pages/admin/Progress";
import SystemControl from "../pages/admin/SystemControl";



const AdminRoutes = () => {
  return (
    <Route element={<DashboardLayout role="admin" />}>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="users" element={<AllUsers />} />
      <Route path="attendance" element={<Attendance />} />
      <Route path="progress" element={<Progress />} />
      <Route path="certifications" element={<Certifications />} />
      <Route path="add-user" element={<AddUser />} />
      <Route path="system-control" element={<SystemControl />} />
    </Route>
  );
};

export default AdminRoutes;
