import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";

import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";

// Public
import CertificateGenerationPortal from "./pages/certificate-generation-portal";
import InternshipProgressTracker from "./pages/internship-progress-tracker";
import AuthenticationPortal from "./pages/authentication-portal";
import UserAdministrationInterface from "./pages/user-administration-interface";
import AttendanceManagementSystem from "./pages/attendance-management-system";
import ProtectedRoute from "./components/ProtectedRoute";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";


// Guards
import EmployeeGuard from "./guards/EmployeeGuard";
import AdminGuard from "./guards/AdminGuard";

// Employee pages
import EmployeeDashboard from "./pages/employee-self-service-portal/pages/EmployeeDashboard";
import Attendance from "./pages/employee-self-service-portal/pages/Attendance";
import MyProgress from "./pages/employee-self-service-portal/pages/MyProgress";
import EmployeeCertificates from "./pages/employee-self-service-portal/pages/Certificates";
import EmployeeMessages from "./pages/employee-self-service-portal/pages/Messages";
import AssignedTasks from "./pages/employee-self-service-portal/AssignedTasks";
import EmployeeFeedback from "./pages/employee-self-service-portal/Feedback";
import EmployeeSettings from "./pages/employee-self-service-portal/pages/Settings";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminAttendance from "./pages/admin/Attendance";
import AdminProgress from "./pages/admin/Progress";
import AdminCertifications from "./pages/admin/Certifications";
import AdminAddUser from "./pages/admin/AddUser";
import AdminSystemControl from "./pages/admin/SystemControl";
import AdminFeedbackInbox from "./pages/admin/FeedbackInbox";
import AdminSettings from "./pages/admin/Settings";
import AdminSendNotification from "./pages/admin/Notifications/AdminSendNotification";

// Mentor pages
import MentorDashboard from "./pages/Mentor/MentorDashboard";
import MentorAssignTasks from "./pages/Mentor/MentorAssignTasks";
import MentorAttendance from "./pages/Mentor/MentorAttendance";
import MentorProgress from "./pages/Mentor/MentorProgress";
import MentorTeam from "./pages/Mentor/MentorTeam";
import MentorMessages from "./pages/Mentor/MentorMessages";
import MentorCertifications from "./pages/Mentor/MentorCertifications";
import MentorFeedback from "./pages/Mentor/MentorFeedback";
import MentorSettings from "./pages/Mentor/MentorSettings";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />

        <RouterRoutes>
          {/* PUBLIC */}
          <Route path="/" element={<AuthenticationPortal />} />
          <Route path="/authentication-portal" element={<AuthenticationPortal />} />

          <Route path="/certificate-generation-portal" element={<CertificateGenerationPortal />} />
          <Route path="/internship-progress-tracker" element={<InternshipProgressTracker />} />
          <Route path="/user-administration-interface" element={<UserAdministrationInterface />} />
          <Route path="/attendance-management-system" element={<AttendanceManagementSystem />} />

          {/* EMPLOYEE */}
          <Route
            path="/employee-self-service-portal"
            element={
              <ProtectedRoute>
                <EmployeeGuard>
                  <DashboardLayout role="employee" />
                </EmployeeGuard>
              </ProtectedRoute>
            }
          >
            <Route index element={<EmployeeDashboard />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="my-progress" element={<MyProgress />} />
            <Route path="assigned-tasks" element={<AssignedTasks />} />
            <Route path="certificates" element={<EmployeeCertificates />} />
            <Route path="messages" element={<EmployeeMessages />} />
            <Route path="settings" element={<EmployeeSettings />} />
            <Route path="feedback" element={<EmployeeFeedback />} />
          </Route>

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="add-user" element={<AdminAddUser />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="progress" element={<AdminProgress />} />
            <Route path="certifications" element={<AdminCertifications />} />
            <Route path="system-control" element={<AdminSystemControl />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="notifications" element={<AdminSendNotification />} />
            <Route path="feedback" element={<AdminFeedbackInbox />} />
          </Route>

          {/* MENTOR */}
           <Route
              path="/mentor"
              element={
                <ProtectedRoute>
                   <DashboardLayout role="mentor" />
                </ProtectedRoute>
              }
            >
              <Route index element={<MentorDashboard />} />
              <Route path="dashboard" element={<MentorDashboard />} />
              <Route path="assign-tasks" element={<MentorAssignTasks />} />
              <Route path="attendance" element={<MentorAttendance />} />
              <Route path="team" element={<MentorTeam />} />
              <Route path="progress" element={<MentorProgress />} />
              <Route path="messages" element={<MentorMessages />} />
              <Route path="certifications" element={<MentorCertifications />} />
              <Route path="settings" element={<MentorSettings />} />
              <Route path="feedback" element={<MentorFeedback />} />
            </Route>

 
          {/* FALLBACK */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
