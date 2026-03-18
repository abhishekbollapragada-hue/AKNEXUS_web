import React from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../../components/AppIcon";

const QuickActionsPanel = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 1,
      title: "View Attendance",
      description: "Check your attendance records",
      icon: "Clock",
      color: "primary",
      route: "/employee-self-service-portal/attendance",
    },
    {
      id: 2,
      title: "Assigned Tasks",
      description: "View and update your tasks",
      icon: "ClipboardList",
      color: "success",
      route: "/employee-self-service-portal/assigned-tasks",
    },
    {
      id: 3,
      title: "Get Certificate",
      description: "Download your certificates",
      icon: "Award",
      color: "warning",
      route: "/employee-self-service-portal/certificates",
    },
    {
      id: 4,
      title: "Submit Feedback",
      description: "Share suggestions and ideas",
      icon: "MessageSquare",
      color: "primary",
      // ✅ IMPORTANT: change this if your feedback page route is different
      route: "/employee-self-service-portal/feedback",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: {
        bg: "bg-primary/10",
        hover: "hover:bg-primary/20",
        icon: "var(--color-primary)",
      },
      success: {
        bg: "bg-success/10",
        hover: "hover:bg-success/20",
        icon: "var(--color-success)",
      },
      warning: {
        bg: "bg-warning/10",
        hover: "hover:bg-warning/20",
        icon: "var(--color-warning)",
      },
    };
    return colors?.[color] || colors?.primary;
  };

  return (
    <div className="bg-card rounded-xl shadow-warm-md p-4 md:p-6 border border-border">
      <h2 className="text-lg md:text-xl lg:text-2xl font-heading font-semibold text-foreground mb-6">
        Quick Actions
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {quickActions?.map((action) => {
          const colorClasses = getColorClasses(action?.color);

          return (
            <button
              key={action?.id}
              onClick={() => navigate(action?.route)}
              className={`${colorClasses?.bg} ${colorClasses?.hover} rounded-xl p-4 md:p-5 border border-border transition-smooth text-left group`}
              type="button"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-background rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-smooth">
                  <Icon name={action?.icon} size={24} color={colorClasses?.icon} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-1">
                    {action?.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {action?.description}
                  </p>
                </div>

                <Icon
                  name="ChevronRight"
                  size={20}
                  className="flex-shrink-0 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-smooth"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsPanel;
