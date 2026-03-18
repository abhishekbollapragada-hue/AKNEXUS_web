import { Outlet } from "react-router-dom";
import Sidebar from "../components/ui/Sidebar";
import ProfileHeader from "../pages/employee-self-service-portal/components/ProfileHeader";
import usePresenceHeartbeat from "../hooks/usePresenceHeartbeat";

const DashboardLayout = ({ role }) => {
  usePresenceHeartbeat();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={role} />

      <div className="lg:ml-72 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
          {/* ✅ Profile header for ALL pages */}
          <div className="mb-6 md:mb-8">
            <ProfileHeader />
          </div>

          {/* Page content */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
