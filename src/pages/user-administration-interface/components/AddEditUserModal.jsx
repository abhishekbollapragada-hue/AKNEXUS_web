import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Image from '../../../components/AppImage';

const AddEditUserModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'employee',
    department: '',
    joiningDate: '',
    internshipDuration: '',
    college: '',
    year: '',
    skills: [],
    mentor: '',
    status: 'active',
    photo: '',
    salary: '',
    performanceRating: ''
  });

  const [photoPreview, setPhotoPreview] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        role: user?.role || 'employee',
        department: user?.department || '',
        joiningDate: user?.joiningDate || '',
        internshipDuration: user?.internshipDuration || '',
        college: user?.college || '',
        year: user?.year || '',
        skills: user?.skills || [],
        mentor: user?.mentor || '',
        status: user?.status || 'active',
        photo: user?.photo || '',
        salary: user?.salary || '',
        performanceRating: user?.performanceRating || ''
      });
      setPhotoPreview(user?.photo || '');
    } else {
      resetForm();
    }
  }, [user, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'employee',
      department: '',
      joiningDate: '',
      internshipDuration: '',
      college: '',
      year: '',
      skills: [],
      mentor: '',
      status: 'active',
      photo: '',
      salary: '',
      performanceRating: ''
    });
    setPhotoPreview('');
    setErrors({});
  };

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'employee', label: 'Employee' },
    { value: 'intern', label: 'Intern' }
  ];

  const departmentOptions = [
    { value: 'engineering', label: 'Engineering' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'finance', label: 'Finance' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const skillOptions = [
    { value: 'react', label: 'React' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'nodejs', label: 'Node.js' },
    { value: 'sql', label: 'SQL' },
    { value: 'aws', label: 'AWS' },
    { value: 'docker', label: 'Docker' },
    { value: 'figma', label: 'Figma' },
    { value: 'photoshop', label: 'Photoshop' }
  ];

  const mentorOptions = [
    { value: 'mentor1', label: 'Sarah Johnson - Engineering' },
    { value: 'mentor2', label: 'Michael Chen - Design' },
    { value: 'mentor3', label: 'Emily Davis - Marketing' },
    { value: 'mentor4', label: 'David Wilson - Sales' }
  ];

  const yearOptions = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
    { value: 'graduate', label: 'Graduate' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader?.result);
        handleChange('photo', reader?.result);
      };
      reader?.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) newErrors.name = 'Name is required';
    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData?.phone?.trim()) newErrors.phone = 'Phone is required';
    if (!formData?.department) newErrors.department = 'Department is required';
    if (!formData?.joiningDate) newErrors.joiningDate = 'Joining date is required';

    if (formData?.role === 'intern') {
      if (!formData?.college?.trim()) newErrors.college = 'College is required for interns';
      if (!formData?.year) newErrors.year = 'Year is required for interns';
      if (!formData?.internshipDuration) newErrors.internshipDuration = 'Duration is required for interns';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
      resetForm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-warm-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground">
            {user ? 'Edit User' : 'Add New User'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            iconName="X"
            iconSize={20}
            aria-label="Close modal"
          />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-custom p-4 md:p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-4">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 flex flex-col items-center gap-4">
                  <div className="relative">
                    {photoPreview ? (
                      <Image
                        src={photoPreview}
                        alt="User profile preview showing uploaded photo"
                        className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-muted flex items-center justify-center">
                        <Icon name="User" size={40} color="var(--color-muted-foreground)" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-smooth">
                      <Icon name="Camera" size={16} color="var(--color-primary-foreground)" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        aria-label="Upload photo"
                      />
                    </label>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">Upload profile photo (Max 5MB)</p>
                </div>

                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData?.name}
                  onChange={(e) => handleChange('name', e?.target?.value)}
                  error={errors?.name}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="user@example.com"
                  value={formData?.email}
                  onChange={(e) => handleChange('email', e?.target?.value)}
                  error={errors?.email}
                  required
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData?.phone}
                  onChange={(e) => handleChange('phone', e?.target?.value)}
                  error={errors?.phone}
                  required
                />

                <Input
                  label="Joining Date"
                  type="date"
                  value={formData?.joiningDate}
                  onChange={(e) => handleChange('joiningDate', e?.target?.value)}
                  error={errors?.joiningDate}
                  required
                />
              </div>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-4">Role & Department</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Role"
                  options={roleOptions}
                  value={formData?.role}
                  onChange={(value) => handleChange('role', value)}
                  required
                />

                <Select
                  label="Department"
                  options={departmentOptions}
                  value={formData?.department}
                  onChange={(value) => handleChange('department', value)}
                  error={errors?.department}
                  required
                />

                <Select
                  label="Status"
                  options={statusOptions}
                  value={formData?.status}
                  onChange={(value) => handleChange('status', value)}
                  required
                />

                <Select
                  label="Skills"
                  options={skillOptions}
                  value={formData?.skills}
                  onChange={(value) => handleChange('skills', value)}
                  multiple
                  searchable
                  clearable
                  description="Select multiple skills"
                />
              </div>
            </div>

            {(formData?.role === 'intern' || formData?.role === 'employee') && (
              <div>
                <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-4">
                  {formData?.role === 'intern' ? 'Internship Details' : 'Additional Details'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData?.role === 'intern' && (
                    <>
                      <Input
                        label="College/University"
                        type="text"
                        placeholder="Enter college name"
                        value={formData?.college}
                        onChange={(e) => handleChange('college', e?.target?.value)}
                        error={errors?.college}
                        required
                      />

                      <Select
                        label="Year"
                        options={yearOptions}
                        value={formData?.year}
                        onChange={(value) => handleChange('year', value)}
                        error={errors?.year}
                        required
                      />

                      <Input
                        label="Internship Duration (months)"
                        type="number"
                        placeholder="3"
                        value={formData?.internshipDuration}
                        onChange={(e) => handleChange('internshipDuration', e?.target?.value)}
                        error={errors?.internshipDuration}
                        min="1"
                        max="12"
                        required
                      />
                    </>
                  )}

                  <Select
                    label="Assign Mentor"
                    options={mentorOptions}
                    value={formData?.mentor}
                    onChange={(value) => handleChange('mentor', value)}
                    searchable
                    clearable
                  />
                </div>
              </div>
            )}

            <div>
              <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-4">HR Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Salary (USD)"
                  type="number"
                  placeholder="50000"
                  value={formData?.salary}
                  onChange={(e) => handleChange('salary', e?.target?.value)}
                  description="Annual salary in USD"
                />

                <Input
                  label="Performance Rating"
                  type="number"
                  placeholder="4.5"
                  value={formData?.performanceRating}
                  onChange={(e) => handleChange('performanceRating', e?.target?.value)}
                  min="1"
                  max="5"
                  step="0.1"
                  description="Rating out of 5"
                />
              </div>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 p-4 md:p-6 border-t border-border">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            iconName="Save"
            iconPosition="left"
            iconSize={16}
          >
            {user ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddEditUserModal;