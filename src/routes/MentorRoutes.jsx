import { Routes, Route } from "react-router-dom";
import MentorGuard from "../guards/MentorGuard";
import DashboardLayout from "../layouts/DashboardLayout";

import MentorDashboard from "../pages/mentor/MentorDashboard";
import MentorTeam from "../pages/mentor/MentorTeam";
import MentorAttendance from "../pages/mentor/MentorAttendance";
import MentorProgress from "../pages/mentor/MentorProgress";
import MentorCertifications from "../pages/mentor/MentorCertifications";
import MentorAssignTasks from "../pages/mentor/MentorAssignTasks";
import MentorMessages from "../pages/mentor/MentorMessages";


const MentorRoutes = () => {
  return (
    <MentorGuard>
      <DashboardLayout role="mentor">
        <Routes>
          <Route path="dashboard" element={<MentorDashboard />} />
          <Route path="team" element={<MentorTeam />} />
          <Route path="attendance" element={<MentorAttendance />} />
          <Route path="progress" element={<MentorProgress />} />
          <Route path="certifications" element={<MentorCertifications />} />
          <Route path="assign-tasks" element={<MentorAssignTasks />} />
          

          <Route path="messages" element={<MentorMessages />} />
        </Routes>
      </DashboardLayout>
    </MentorGuard>
  );
};

export default MentorRoutes;
