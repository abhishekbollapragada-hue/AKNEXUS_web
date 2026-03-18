import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProgressOverviewCard from './components/ProgressOverviewCard';
import TaskCard from './components/TaskCard';
import SkillProgressBar from './components/SkillProgressBar';
import MentorFeedbackCard from './components/MentorFeedbackCard';
import PerformanceChart from './components/PerformanceChart';
import MilestoneTimeline from './components/MilestoneTimeline';
import DomainFilter from './components/DomainFilter';

const InternshipProgressTracker = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [userRole, setUserRole] = useState('employee');
  const [activeTab, setActiveTab] = useState('tasks');

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') || 'employee';
    setUserRole(storedRole);
  }, []);

  const overviewData = [
    {
      title: "Overall Progress",
      value: "68%",
      subtitle: "32% remaining",
      icon: "TrendingUp",
      trend: "up",
      trendValue: "+12%",
      color: "primary"
    },
    {
      title: "Tasks Completed",
      value: "24/35",
      subtitle: "11 tasks pending",
      icon: "CheckCircle2",
      trend: "up",
      trendValue: "+3",
      color: "success"
    },
    {
      title: "Performance Score",
      value: "85/100",
      subtitle: "Above average",
      icon: "Award",
      trend: "up",
      trendValue: "+5",
      color: "accent"
    },
    {
      title: "Skill Level",
      value: "Intermediate",
      subtitle: "3 skills mastered",
      icon: "Target",
      trend: "neutral",
      trendValue: "Stable",
      color: "warning"
    }
  ];

  const domains = [
    { id: "web-dev", name: "Web Development", taskCount: 12 },
    { id: "ui-ux", name: "UI/UX Design", taskCount: 8 },
    { id: "backend", name: "Backend Development", taskCount: 10 },
    { id: "testing", name: "Testing & QA", taskCount: 5 }
  ];

  const tasks = [
    {
      id: 1,
      title: "Build Responsive Landing Page",
      description: "Create a fully responsive landing page using React and Tailwind CSS with mobile-first approach",
      detailedDescription: "Design and develop a modern landing page that showcases company services. The page should include hero section, features grid, testimonials carousel, and contact form. Ensure cross-browser compatibility and optimize for performance with lazy loading images and code splitting.",
      status: "in-progress",
      priority: "high",
      dueDate: "2026-01-15",
      assignedBy: "Sarah Johnson",
      domain: "web-dev",
      attachments: [
        { name: "design-mockup.fig", size: "2.4 MB" },
        { name: "requirements.pdf", size: "156 KB" }
      ],
      mentorFeedback: "Good progress on the layout structure. Focus on improving the mobile navigation menu and add smooth scroll animations for better user experience."
    },
    {
      id: 2,
      title: "API Integration for User Dashboard",
      description: "Integrate REST APIs for user authentication and data fetching in the dashboard module",
      detailedDescription: "Implement secure API integration using Axios for user authentication flow including login, logout, and token refresh. Create reusable API service layer with error handling and loading states. Implement data caching strategy for improved performance.",
      status: "submitted",
      priority: "high",
      dueDate: "2026-01-10",
      assignedBy: "Michael Chen",
      domain: "backend",
      attachments: [
        { name: "api-documentation.pdf", size: "890 KB" }
      ],
      mentorFeedback: "Excellent implementation of authentication flow. Consider adding request interceptors for automatic token refresh and implement retry logic for failed requests."
    },
    {
      id: 3,
      title: "Design System Component Library",
      description: "Create reusable UI components following design system guidelines",
      detailedDescription: "Build a comprehensive component library including buttons, inputs, cards, modals, and navigation elements. Each component should have multiple variants, proper prop types, and accessibility features. Document usage examples and best practices.",
      status: "completed",
      priority: "medium",
      dueDate: "2026-01-05",
      assignedBy: "Emily Rodriguez",
      domain: "ui-ux",
      attachments: [
        { name: "design-tokens.json", size: "45 KB" },
        { name: "component-specs.pdf", size: "1.2 MB" }
      ],
      mentorFeedback: "Outstanding work on the component library! The documentation is thorough and components are well-structured. Great attention to accessibility standards."
    },
    {
      id: 4,
      title: "Unit Testing for Core Modules",
      description: "Write comprehensive unit tests for authentication and data management modules",
      detailedDescription: "Implement unit tests using Jest and React Testing Library. Cover all critical user flows, edge cases, and error scenarios. Achieve minimum 80% code coverage for core business logic. Include integration tests for API interactions.",
      status: "pending",
      priority: "medium",
      dueDate: "2026-01-20",
      assignedBy: "David Park",
      domain: "testing",
      attachments: []
    },
    {
      id: 5,
      title: "Performance Optimization",
      description: "Optimize application performance and reduce bundle size",
      detailedDescription: "Analyze current application performance using Lighthouse and Chrome DevTools. Implement code splitting, lazy loading, and tree shaking. Optimize images and assets. Reduce initial bundle size by at least 30%. Implement service worker for offline functionality.",
      status: "pending",
      priority: "low",
      dueDate: "2026-01-25",
      assignedBy: "Sarah Johnson",
      domain: "web-dev",
      attachments: [
        { name: "performance-audit.pdf", size: "678 KB" }
      ]
    }
  ];

  const skills = [
    {
      skill: "React Development",
      level: "Intermediate",
      progress: 65,
      achievements: [
        "Built 5 production-ready components",
        "Mastered React Hooks patterns",
        "Implemented custom hooks for data fetching"
      ]
    },
    {
      skill: "UI/UX Design",
      level: "Intermediate",
      progress: 58,
      achievements: [
        "Completed 3 design system projects",
        "Proficient in Figma and design tools",
        "Understanding of accessibility principles"
      ]
    },
    {
      skill: "API Integration",
      level: "Beginner",
      progress: 42,
      achievements: [
        "Successfully integrated 4 REST APIs",
        "Implemented error handling patterns",
        "Understanding of authentication flows"
      ]
    },
    {
      skill: "Testing & QA",
      level: "Beginner",
      progress: 35,
      achievements: [
        "Written 50+ unit tests",
        "Learned Jest and Testing Library",
        "Understanding of TDD principles"
      ]
    }
  ];

  const feedbackHistory = [
    {
      id: 1,
      mentorName: "Sarah Johnson",
      date: "2025-12-28",
      rating: 4,
      comment: "Excellent progress this week! Your React component architecture is improving significantly. The landing page implementation shows good understanding of responsive design principles.",
      strengths: [
        "Clean and maintainable code structure",
        "Good use of React best practices",
        "Responsive design implementation",
        "Attention to accessibility features"
      ],
      improvements: [
        "Add more comprehensive error handling",
        "Improve component documentation",
        "Consider performance optimization techniques"
      ],
      nextSteps: "Focus on completing the API integration task and start working on the testing module. Schedule a code review session for next week."
    },
    {
      id: 2,
      mentorName: "Michael Chen",
      date: "2025-12-21",
      rating: 5,
      comment: "Outstanding work on the authentication module! Your implementation of JWT token management and secure API calls demonstrates strong understanding of backend integration concepts.",
      strengths: [
        "Secure authentication implementation",
        "Proper error handling and validation",
        "Clean API service architecture",
        "Good understanding of security best practices"
      ],
      improvements: [
        "Add request caching for better performance",
        "Implement automatic token refresh",
        "Add more detailed API error messages"
      ],
      nextSteps: "Move forward with the dashboard data integration and implement real-time updates using WebSocket connections."
    },
    {
      id: 3,
      mentorName: "Emily Rodriguez",
      date: "2025-12-14",
      rating: 4,
      comment: "Great progress on the design system components. Your attention to detail in implementing variants and accessibility features is commendable. The documentation is thorough and helpful.",
      strengths: [
        "Comprehensive component variants",
        "Excellent documentation",
        "Strong accessibility implementation",
        "Consistent design patterns"
      ],
      improvements: [
        "Add more interactive examples",
        "Improve mobile responsiveness",
        "Consider adding animation guidelines"
      ],
      nextSteps: "Start working on the advanced components like data tables and charts. Review the Storybook setup for component showcase."
    }
  ];

  const performanceData = [
    { month: "Aug", score: 65 },
    { month: "Sep", score: 72 },
    { month: "Oct", score: 78 },
    { month: "Nov", score: 82 },
    { month: "Dec", score: 85 }
  ];

  const milestones = [
    {
      id: 1,
      title: "Onboarding & Setup",
      description: "Complete initial setup, environment configuration, and introduction to team and projects",
      date: "2025-08-01",
      status: "completed",
      completedDate: "2025-08-05"
    },
    {
      id: 2,
      title: "Foundation Skills",
      description: "Learn core technologies including React, JavaScript ES6+, and modern development tools",
      date: "2025-09-01",
      status: "completed",
      completedDate: "2025-09-15"
    },
    {
      id: 3,
      title: "First Project Delivery",
      description: "Complete and deploy first production-ready project with mentor guidance",
      date: "2025-10-15",
      status: "completed",
      completedDate: "2025-10-20"
    },
    {
      id: 4,
      title: "Mid-term Evaluation",
      description: "Comprehensive skills assessment and performance review with feedback session",
      date: "2025-11-30",
      status: "completed",
      completedDate: "2025-12-02",
      progress: 100
    },
    {
      id: 5,
      title: "Advanced Project Work",
      description: "Lead development of complex features and mentor junior team members",
      date: "2026-01-15",
      status: "current",
      progress: 68
    },
    {
      id: 6,
      title: "Final Evaluation",
      description: "Complete final project presentation and comprehensive performance assessment",
      date: "2026-02-28",
      status: "upcoming"
    },
    {
      id: 7,
      title: "Internship Completion",
      description: "Receive completion certificate and transition planning for full-time role",
      date: "2026-03-15",
      status: "upcoming"
    }
  ];

  const filteredTasks = selectedDomain === 'all' 
    ? tasks 
    : tasks?.filter(task => task?.domain === selectedDomain);

  const handleStatusUpdate = (taskId, newStatus) => {
    console.log(`Task ${taskId} status updated to ${newStatus}`);
  };

  const handleFileUpload = (taskId, file) => {
    console.log(`File uploaded for task ${taskId}:`, file?.name);
  };

  const handleExportReport = () => {
    console.log('Exporting progress report...');
  };

  const tabs = [
    { id: 'tasks', label: 'Tasks & Projects', icon: 'ListTodo' },
    { id: 'skills', label: 'Skill Progress', icon: 'Target' },
    { id: 'feedback', label: 'Mentor Feedback', icon: 'MessageSquare' },
    { id: 'performance', label: 'Performance', icon: 'TrendingUp' }
  ];

  return (
    <>
      <Helmet>
        <title>Internship Progress Tracker - AK Nexus</title>
        <meta name="description" content="Track your internship progress, manage tasks, monitor skill development, and receive mentor feedback in one comprehensive dashboard." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={setIsSidebarCollapsed} />

        <main className={`transition-smooth ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
          <div className="p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-2">
                    Internship Progress Tracker
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Monitor your development journey and track skill advancement
                  </p>
                </div>
                <Button variant="default" iconName="Download" iconPosition="left" onClick={handleExportReport}>
                  Export Report
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                {overviewData?.map((item, index) => (
                  <ProgressOverviewCard key={index} {...item} />
                ))}
              </div>

              <div className="mb-6 md:mb-8">
                <div className="bg-card rounded-xl border border-border shadow-warm overflow-x-auto">
                  <div className="flex p-2 gap-2 min-w-max">
                    {tabs?.map((tab) => (
                      <button
                        key={tab?.id}
                        onClick={() => setActiveTab(tab?.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-smooth flex-shrink-0 ${
                          activeTab === tab?.id
                            ? 'bg-primary text-primary-foreground shadow-warm'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon name={tab?.icon} size={18} />
                        <span>{tab?.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {activeTab === 'tasks' && (
                <div className="space-y-6">
                  <DomainFilter 
                    domains={domains}
                    selectedDomain={selectedDomain}
                    onDomainChange={setSelectedDomain}
                  />

                  <div className="grid grid-cols-1 gap-4 md:gap-6">
                    {filteredTasks?.map((task) => (
                      <TaskCard
                        key={task?.id}
                        task={task}
                        onStatusUpdate={handleStatusUpdate}
                        onFileUpload={handleFileUpload}
                        userRole={userRole}
                      />
                    ))}
                  </div>

                  {filteredTasks?.length === 0 && (
                    <div className="bg-card rounded-xl border border-border p-8 md:p-12 text-center">
                      <Icon name="Inbox" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                      <h3 className="text-lg font-heading font-semibold text-foreground mb-2">No tasks found</h3>
                      <p className="text-sm text-muted-foreground">
                        No tasks available for the selected domain filter
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  {skills?.map((skill, index) => (
                    <SkillProgressBar key={index} {...skill} />
                  ))}
                </div>
              )}

              {activeTab === 'feedback' && (
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  {feedbackHistory?.map((feedback) => (
                    <MentorFeedbackCard key={feedback?.id} feedback={feedback} />
                  ))}
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="lg:col-span-2">
                    <PerformanceChart 
                      data={performanceData}
                      title="Performance Trend (Last 5 Months)"
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <MilestoneTimeline milestones={milestones} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default InternshipProgressTracker;