import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../AppIcon";

import { signOut } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";

const Sidebar = ({ role = "employee", isCollapsed = false }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // ================= MENU DEFINITIONS =================
  const navigationItems = [
    // ================= EMPLOYEE =================
    { label: "Dashboard", path: "/employee-self-service-portal", icon: "LayoutDashboard", roles: ["employee"] },
    { label: "Attendance", path: "/employee-self-service-portal/attendance", icon: "Clock", roles: ["employee"] },
    { label: "Progress", path: "/employee-self-service-portal/my-progress", icon: "TrendingUp", roles: ["employee"] },
    { label: "Assigned Tasks", path: "/employee-self-service-portal/assigned-tasks", icon: "ClipboardList", roles: ["employee"] },
    { label: "Certificates", path: "/employee-self-service-portal/certificates", icon: "Award", roles: ["employee"] },
    { label: "Messages", path: "/employee-self-service-portal/messages", icon: "MessageCircle", roles: ["employee"] },
    { label: "Feedback", path: "/employee-self-service-portal/feedback", icon: "MessageSquare", roles: ["employee"] },


    // ================= ADMIN =================
    { label: "Dashboard", path: "/admin/dashboard", icon: "LayoutDashboard", roles: ["admin"] },
    { label: "All Users", path: "/admin/users", icon: "Users", roles: ["admin"] },
    { label: "Add Users", path: "/admin/add-user", icon: "UserPlus", roles: ["admin"] },
    { label: "Attendance", path: "/admin/attendance", icon: "Clock", roles: ["admin"] },
    { label: "Progress", path: "/admin/progress", icon: "TrendingUp", roles: ["admin"] },
    { label: "Certifications", path: "/admin/certifications", icon: "Award", roles: ["admin"] },
    { label: "Feedback", path: "/admin/feedback", icon: "MessageSquare", roles: ["admin"] },
    { label: "Send Notification", path: "/admin/notifications", icon: "Bell", roles: ["admin"] },
    { label: "System Control", path: "/admin/system-control", icon: "Settings", roles: ["admin"] },

    // ================= MENTOR =================
    { label: "Dashboard", path: "/mentor/dashboard", icon: "LayoutDashboard", roles: ["mentor"] },
    { label: "Attendance", path: "/mentor/attendance", icon: "Clock", roles: ["mentor"] },
    { label: "Team", path: "/mentor/team", icon: "Users", roles: ["mentor"] },
    { label: "Assign Tasks", path: "/mentor/assign-tasks", icon: "ClipboardList", roles: ["mentor"] },
    { label: "Progress", path: "/mentor/progress", icon: "TrendingUp", roles: ["mentor"] },
    { label: "Certifications", path: "/mentor/certifications", icon: "Award", roles: ["mentor"] },
    { label: "Messages / Comments", path: "/mentor/messages", icon: "MessageCircle", roles: ["mentor"] },
    { label: "Feedback", path: "/mentor/feedback", icon: "MessageSquare", roles: ["mentor"] },

  ];

  const filteredNavigation = navigationItems.filter(item =>
    item.roles.includes(role)
  );

  const isActive = (path) => location.pathname.startsWith(path);

  const handleMobileToggle = () => setIsMobileOpen(prev => !prev);
  const closeMobileMenu = () => setIsMobileOpen(false);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  // ================= LOGOUT (FIXED & SAFE) =================
  const handleLogout = async () => {
    console.log("👉 Logout clicked");

    const user = auth.currentUser;

    try {
      // Try updating Firestore presence (non-blocking)
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          isOnline: false,
          lastSeen: serverTimestamp(),
        });
      }
    } catch (error) {
      console.warn("⚠️ Presence update failed, continuing logout", error);
    } finally {
      // ALWAYS sign out
      await signOut(auth);

      // Redirect safely
      navigate("/authentication-portal", { replace: true });
    }
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={handleMobileToggle}
        className="fixed top-4 left-4 z-50 lg:hidden w-12 h-12 flex items-center justify-center bg-card rounded-xl"
      >
        <Icon name={isMobileOpen ? "X" : "Menu"} size={24} />
      </button>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-card border-r border-border z-40 transition-all
          ${isCollapsed ? "w-20" : "w-72"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="px-4 py-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Icon name="Briefcase" size={20} color="#fff" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold">AK Nexus</h2>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4">
          <ul className="space-y-1">
            {filteredNavigation.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition
                    ${isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"}
                    ${isCollapsed ? "justify-center" : ""}
                  `}
                >
                  <Icon name={item.icon} size={20} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        {!isCollapsed && (
          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted"
            >
              <Icon name="LogOut" size={20} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
