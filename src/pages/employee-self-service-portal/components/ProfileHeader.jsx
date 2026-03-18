import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ NEW
import Image from "../../../components/AppImage";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import useUserProfile from "../../../hooks/useUserProfile";

const ProfileHeader = () => {
  const navigate = useNavigate(); // ✅ NEW
  const { profile, loading } = useUserProfile();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-error/10 text-error";
      case "mentor":
        return "bg-warning/10 text-warning";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const userData = useMemo(() => {
    const name = profile?.name || profile?.fullName || "User";
    const email = profile?.email || "";
    const role = profile?.role || "employee";
    const department = profile?.department || profile?.team || "";
    const photoURL = profile?.photoURL || profile?.profileImage || "";

    const joinedRaw =
      profile?.joinedAt ||
      profile?.joinDate ||
      profile?.joiningDate ||
      profile?.createdAt ||
      null;

    return { name, email, role, department, photoURL, joinedRaw };
  }, [profile]);

  const joinedLabel = useMemo(() => {
    const raw = userData.joinedRaw;
    if (!raw) return "Joined —";

    // Firestore Timestamp
    if (typeof raw?.toDate === "function") {
      const d = raw.toDate();
      return `Joined ${d.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })}`;
    }

    // Timestamp-like object {seconds, nanoseconds}
    if (typeof raw === "object" && raw?.seconds) {
      const d = new Date(raw.seconds * 1000);
      return `Joined ${d.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })}`;
    }

    // String or Date
    const d = raw instanceof Date ? raw : new Date(raw);
    if (Number.isNaN(d.getTime())) return "Joined —";

    return `Joined ${d.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })}`;
  }, [userData.joinedRaw]);

  const avatarUrl =
    userData.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userData.name || "User"
    )}&background=0D9488&color=fff`;

  return (
    <div className="bg-card rounded-xl shadow-warm-md p-4 md:p-6 lg:p-8 border border-border">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 md:gap-6">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-xl overflow-hidden border-4 border-primary/20 bg-muted">
            <Image
              src={avatarUrl}
              alt="Profile photo"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute -bottom-2 -right-2 w-8 h-8 md:w-10 md:h-10 bg-success rounded-full border-4 border-card flex items-center justify-center">
            <Icon name="Check" size={16} color="#FFFFFF" />
          </div>
        </div>

        <div className="flex-1 min-w-0 w-full lg:w-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground">
              {getGreeting()}, {loading ? "Loading..." : userData.name}
            </h1>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs md:text-sm font-medium capitalize ${getRoleBadgeColor(
                userData.role
              )} w-fit`}
            >
              <Icon name="Shield" size={14} />
              {userData.role}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm md:text-base text-muted-foreground">
            <div className="flex items-center gap-2">
              <Icon name="Mail" size={16} />
              <span className="truncate">{userData.email || "—"}</span>
            </div>

            <div className="hidden sm:block w-1 h-1 rounded-full bg-muted-foreground" />

            <div className="flex items-center gap-2">
              <Icon name="Briefcase" size={16} />
              <span>{userData.department || "—"}</span>
            </div>

            <div className="hidden sm:block w-1 h-1 rounded-full bg-muted-foreground" />

            <div className="flex items-center gap-2">
              <Icon name="Calendar" size={16} />
              <span>{joinedLabel}</span>
            </div>
          </div>
        </div>

        {/* ✅ Right side: Settings */}
        <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto">
          <Button
            variant="outline"
            iconName="Settings"
            iconPosition="left"
            className="flex-1 lg:flex-initial"
            onClick={() => navigate("settings")} // ✅ NOW WORKS
          >
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
