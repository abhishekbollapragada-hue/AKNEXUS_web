import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/ui/Sidebar';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import UserStatsCard from './components/UserStatsCard';
import UserTableRow from './components/UserTableRow';
import UserFilterPanel from './components/UserFilterPanel';
import BulkActionsBar from './components/BulkActionsBar';
import AddEditUserModal from './components/AddEditUserModal';
import UserDetailsModal from './components/UserDetailsModal';
import AuditTrailPanel from './components/AuditTrailPanel';
import ImportUsersModal from './components/ImportUsersModal';

const UserAdministrationInterface = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    role: 'all',
    department: 'all',
    status: 'all',
    joiningDateFrom: ''
  });

  const usersPerPage = 25;

  const mockUsers = [
  {
    id: 1,
    userId: 'AK-EMP-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@aknexus.com',
    phone: '+1 (555) 123-4567',
    role: 'admin',
    department: 'Human Resources',
    status: 'active',
    joiningDate: '01/15/2024',
    photo: "https://img.rocket.new/generatedImages/rocket_gen_img_1ffde516e-1763293580273.png",
    photoAlt: 'Professional woman with brown hair in business attire smiling at camera in office setting',
    college: '',
    year: '',
    internshipDuration: '',
    skills: ['Leadership', 'HR Management', 'Recruitment'],
    mentor: '',
    salary: '85000',
    performanceRating: '4.8',
    recentActivity: [
    { icon: 'UserPlus', action: 'Created 5 new user accounts', timestamp: '2 hours ago' },
    { icon: 'Edit', action: 'Updated department policies', timestamp: '5 hours ago' }]

  },
  {
    id: 2,
    userId: 'AK-EMP-002',
    name: 'Michael Chen',
    email: 'michael.chen@aknexus.com',
    phone: '+1 (555) 234-5678',
    role: 'mentor',
    department: 'Engineering',
    status: 'active',
    joiningDate: '03/20/2024',
    photo: "https://img.rocket.new/generatedImages/rocket_gen_img_1fef7a519-1763296502128.png",
    photoAlt: 'Asian man with glasses wearing blue shirt in modern office environment',
    college: '',
    year: '',
    internshipDuration: '',
    skills: ['React', 'Node.js', 'AWS', 'Mentoring'],
    mentor: '',
    salary: '95000',
    performanceRating: '4.9',
    recentActivity: [
    { icon: 'MessageSquare', action: 'Reviewed intern daily updates', timestamp: '1 hour ago' },
    { icon: 'CheckCircle', action: 'Approved 3 task submissions', timestamp: '3 hours ago' }]

  },
  {
    id: 3,
    userId: 'AK-INT-001',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@aknexus.com',
    phone: '+1 (555) 345-6789',
    role: 'intern',
    department: 'Design',
    status: 'active',
    joiningDate: '06/01/2025',
    photo: "https://img.rocket.new/generatedImages/rocket_gen_img_170deb1ce-1763300485528.png",
    photoAlt: 'Young Hispanic woman with long dark hair wearing casual attire in creative workspace',
    college: 'Stanford University',
    year: '3rd Year',
    internshipDuration: '6',
    skills: ['Figma', 'UI Design', 'Prototyping'],
    mentor: 'Michael Chen - Engineering',
    salary: '',
    performanceRating: '4.5',
    recentActivity: [
    { icon: 'Upload', action: 'Submitted design mockups', timestamp: '30 minutes ago' },
    { icon: 'FileText', action: 'Completed daily update', timestamp: '2 hours ago' }]

  },
  {
    id: 4,
    userId: 'AK-EMP-003',
    name: 'David Wilson',
    email: 'david.wilson@aknexus.com',
    phone: '+1 (555) 456-7890',
    role: 'employee',
    department: 'Marketing',
    status: 'active',
    joiningDate: '02/10/2024',
    photo: "https://img.rocket.new/generatedImages/rocket_gen_img_1eaf2285b-1763294070475.png",
    photoAlt: 'Caucasian man with short blonde hair in formal business suit at corporate office',
    college: '',
    year: '',
    internshipDuration: '',
    skills: ['Digital Marketing', 'SEO', 'Content Strategy'],
    mentor: '',
    salary: '72000',
    performanceRating: '4.6',
    recentActivity: [
    { icon: 'TrendingUp', action: 'Launched new campaign', timestamp: '4 hours ago' }]

  },
  {
    id: 5,
    userId: 'AK-INT-002',
    name: 'Priya Patel',
    email: 'priya.patel@aknexus.com',
    phone: '+1 (555) 567-8901',
    role: 'intern',
    department: 'Engineering',
    status: 'active',
    joiningDate: '07/15/2025',
    photo: "https://img.rocket.new/generatedImages/rocket_gen_img_1c9c4cb91-1763298879130.png",
    photoAlt: 'Indian woman with black hair wearing tech company hoodie in modern workspace',
    college: 'MIT',
    year: '4th Year',
    internshipDuration: '3',
    skills: ['Python', 'Machine Learning', 'Data Analysis'],
    mentor: 'Sarah Johnson - Engineering',
    salary: '',
    performanceRating: '4.7',
    recentActivity: [
    { icon: 'Code', action: 'Pushed code to repository', timestamp: '1 hour ago' }]

  },
  {
    id: 6,
    userId: 'AK-EMP-004',
    name: 'James Anderson',
    email: 'james.anderson@aknexus.com',
    phone: '+1 (555) 678-9012',
    role: 'mentor',
    department: 'Sales',
    status: 'active',
    joiningDate: '04/05/2024',
    photo: "https://img.rocket.new/generatedImages/rocket_gen_img_1b63cf058-1763294966331.png",
    photoAlt: 'African American man in professional attire with confident smile in sales office',
    college: '',
    year: '',
    internshipDuration: '',
    skills: ['Sales Strategy', 'Client Relations', 'Negotiation'],
    mentor: '',
    salary: '88000',
    performanceRating: '4.8',
    recentActivity: [
    { icon: 'Users', action: 'Conducted team training', timestamp: '3 hours ago' }]

  },
  {
    id: 7,
    userId: 'AK-INT-003',
    name: 'Sophie Martin',
    email: 'sophie.martin@aknexus.com',
    phone: '+1 (555) 789-0123',
    role: 'intern',
    department: 'Finance',
    status: 'pending',
    joiningDate: '08/01/2025',
    photo: "https://img.rocket.new/generatedImages/rocket_gen_img_1fb76be0b-1763298886536.png",
    photoAlt: 'Young woman with red hair wearing business casual attire in finance department',
    college: 'Harvard Business School',
    year: '2nd Year',
    internshipDuration: '4',
    skills: ['Financial Analysis', 'Excel', 'Accounting'],
    mentor: 'David Wilson - Marketing',
    salary: '',
    performanceRating: '',
    recentActivity: []
  },
  {
    id: 8,
    userId: 'AK-EMP-005',
    name: 'Robert Taylor',
    email: 'robert.taylor@aknexus.com',
    phone: '+1 (555) 890-1234',
    role: 'employee',
    department: 'Engineering',
    status: 'inactive',
    joiningDate: '01/20/2024',
    photo: "https://img.rocket.new/generatedImages/rocket_gen_img_1507b6e2a-1763293256195.png",
    photoAlt: 'Middle-aged man with gray hair in casual tech company attire at workstation',
    college: '',
    year: '',
    internshipDuration: '',
    skills: ['Java', 'Spring Boot', 'Microservices'],
    mentor: '',
    salary: '92000',
    performanceRating: '4.4',
    recentActivity: []
  }];


  const mockAuditActivities = [
  {
    id: 1,
    action: 'created',
    description: 'Created new user account for Emily Rodriguez',
    timestamp: '2 hours ago',
    adminName: 'Sarah Johnson',
    adminPhoto: "https://img.rocket.new/generatedImages/rocket_gen_img_128683b30-1763296674609.png",
    adminPhotoAlt: 'Professional woman with brown hair in business attire'
  },
  {
    id: 2,
    action: 'updated',
    description: 'Updated role for Michael Chen from Employee to Mentor',
    timestamp: '5 hours ago',
    adminName: 'Sarah Johnson',
    adminPhoto: "https://img.rocket.new/generatedImages/rocket_gen_img_128683b30-1763296674609.png",
    adminPhotoAlt: 'Professional woman with brown hair in business attire'
  },
  {
    id: 3,
    action: 'status-changed',
    description: 'Changed status for Robert Taylor to Inactive',
    timestamp: '1 day ago',
    adminName: 'Sarah Johnson',
    adminPhoto: "https://img.rocket.new/generatedImages/rocket_gen_img_128683b30-1763296674609.png",
    adminPhotoAlt: 'Professional woman with brown hair in business attire'
  },
  {
    id: 4,
    action: 'activated',
    description: 'Activated user account for Priya Patel',
    timestamp: '2 days ago',
    adminName: 'Sarah Johnson',
    adminPhoto: "https://img.rocket.new/generatedImages/rocket_gen_img_128683b30-1763296674609.png",
    adminPhotoAlt: 'Professional woman with brown hair in business attire'
  }];


  const stats = [
  {
    icon: 'Users',
    label: 'Total Users',
    value: '248',
    trend: 'up',
    trendValue: '+12%',
    color: 'primary'
  },
  {
    icon: 'UserCheck',
    label: 'Active Users',
    value: '215',
    trend: 'up',
    trendValue: '+8%',
    color: 'success'
  },
  {
    icon: 'UserPlus',
    label: 'New This Month',
    value: '32',
    trend: 'up',
    trendValue: '+24%',
    color: 'accent'
  },
  {
    id: 4,
    icon: 'UserX',
    label: 'Pending Approval',
    value: '15',
    trend: 'down',
    trendValue: '-5%',
    color: 'warning'
  }];


  const filteredUsers = mockUsers?.filter((user) => {
    const matchesSearch = user?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    user?.email?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    user?.userId?.toLowerCase()?.includes(searchQuery?.toLowerCase());

    const matchesRole = filters?.role === 'all' || user?.role === filters?.role;
    const matchesDepartment = filters?.department === 'all' || user?.department?.toLowerCase() === filters?.department;
    const matchesStatus = filters?.status === 'all' || user?.status === filters?.status;

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers?.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers?.slice(startIndex, endIndex);

  const handleSelectUser = (userId, isSelected) => {
    if (isSelected) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers?.filter((id) => id !== userId));
    }
  };

  const handleSelectAll = (e) => {
    if (e?.target?.checked) {
      setSelectedUsers(currentUsers?.map((user) => user?.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkAction = (action) => {
    console.log(`Applying ${action} to users:`, selectedUsers);
    alert(`Bulk action "${action}" applied to ${selectedUsers?.length} user(s)`);
    setSelectedUsers([]);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      role: 'all',
      department: 'all',
      status: 'all',
      joiningDateFrom: ''
    });
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsAddEditModalOpen(true);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      console.log('Deleting user:', userId);
      alert('User deleted successfully');
    }
  };

  const handleSaveUser = (userData) => {
    console.log('Saving user:', userData);
    alert(selectedUser ? 'User updated successfully' : 'User created successfully');
  };

  const handleImportUsers = (file, validationResults) => {
    console.log('Importing users from file:', file?.name);
    console.log('Validation results:', validationResults);
    alert(`Successfully imported ${validationResults?.validRows} users`);
  };

  const handleExportUsers = () => {
    console.log('Exporting users...');
    alert('User data exported successfully');
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className={`transition-smooth ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <div className="p-4 md:p-6 lg:p-8">
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-2">
                  User Administration
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Manage users, roles, and permissions across the organization
                </p>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsImportModalOpen(true)}
                  iconName="Upload"
                  iconPosition="left"
                  iconSize={16}
                  className="flex-1 md:flex-initial">

                  Import
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportUsers}
                  iconName="Download"
                  iconPosition="left"
                  iconSize={16}
                  className="flex-1 md:flex-initial">

                  Export
                </Button>
                <Button
                  variant="default"
                  onClick={handleAddUser}
                  iconName="UserPlus"
                  iconPosition="left"
                  iconSize={16}
                  className="flex-1 md:flex-initial">

                  Add User
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {stats?.map((stat, index) =>
              <UserStatsCard key={index} {...stat} />
              )}
            </div>
          </div>

          <UserFilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            onApply={handleApplyFilters} />


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl border border-border shadow-warm">
                <div className="p-4 md:p-6 border-b border-border">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h2 className="text-base md:text-lg font-heading font-semibold text-foreground">
                      User Directory ({filteredUsers?.length})
                    </h2>
                    <div className="flex-1 md:max-w-md">
                      <Input
                        type="search"
                        placeholder="Search by name, email, or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e?.target?.value)} />

                    </div>
                  </div>
                </div>

                <BulkActionsBar
                  selectedCount={selectedUsers?.length}
                  onBulkAction={handleBulkAction}
                  onClearSelection={() => setSelectedUsers([])} />


                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-3 py-3 md:px-4 md:py-4 text-left">
                          <input
                            type="checkbox"
                            checked={selectedUsers?.length === currentUsers?.length && currentUsers?.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            aria-label="Select all users" />

                        </th>
                        <th className="px-3 py-3 md:px-4 md:py-4 text-left text-xs md:text-sm font-medium text-muted-foreground">
                          User
                        </th>
                        <th className="px-3 py-3 md:px-4 md:py-4 text-left text-xs md:text-sm font-medium text-muted-foreground">
                          Email
                        </th>
                        <th className="px-3 py-3 md:px-4 md:py-4 text-left text-xs md:text-sm font-medium text-muted-foreground">
                          Role
                        </th>
                        <th className="px-3 py-3 md:px-4 md:py-4 text-left text-xs md:text-sm font-medium text-muted-foreground">
                          Department
                        </th>
                        <th className="px-3 py-3 md:px-4 md:py-4 text-left text-xs md:text-sm font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="px-3 py-3 md:px-4 md:py-4 text-left text-xs md:text-sm font-medium text-muted-foreground">
                          Joined
                        </th>
                        <th className="px-3 py-3 md:px-4 md:py-4 text-left text-xs md:text-sm font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers?.map((user) =>
                      <UserTableRow
                        key={user?.id}
                        user={user}
                        isSelected={selectedUsers?.includes(user?.id)}
                        onSelect={handleSelectUser}
                        onEdit={handleEditUser}
                        onDelete={handleDeleteUser}
                        onViewDetails={handleViewDetails} />

                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-6 border-t border-border">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers?.length)} of {filteredUsers?.length} users
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      iconName="ChevronLeft"
                      iconSize={16}>

                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 md:w-10 md:h-10 rounded-lg text-xs md:text-sm font-medium transition-smooth ${
                            currentPage === pageNum ?
                            'bg-primary text-primary-foreground' :
                            'text-foreground hover:bg-muted'}`
                            }>

                            {pageNum}
                          </button>);

                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      iconName="ChevronRight"
                      iconSize={16}>

                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <AuditTrailPanel activities={mockAuditActivities} />
            </div>
          </div>
        </div>
      </div>
      <AddEditUserModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser} />

      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        user={selectedUser} />

      <ImportUsersModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportUsers} />

    </div>);

};

export default UserAdministrationInterface;