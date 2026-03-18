import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import CertificateCard from './components/CertificateCard';
import TemplateCard from './components/TemplateCard';
import BulkGenerationModal from './components/BulkGenerationModal';
import CertificatePreviewModal from './components/CertificatePreviewModal';
import FilterPanel from './components/FilterPanel';
import StatsCard from './components/StatsCard';
import AnalyticsChart from './components/AnalyticsChart';

const CertificateGenerationPortal = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('certificates');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all',
    date: ''
  });

  useEffect(() => {
    document.title = 'Certificate Generation Portal - AK Nexus';
  }, []);

  const certificates = [
  {
    id: 1,
    certificateId: 'AK-INT-2026-001',
    title: 'Internship Completion Certificate',
    recipientName: 'Sarah Johnson',
    recipientEmail: 'sarah.johnson@example.com',
    type: 'Internship Completion',
    status: 'issued',
    issueDate: '12/15/2025',
    deliveryStatus: 'Delivered',
    verificationCode: 'VRF-2026-SJ-001-8A3F',
    preview: "https://img.rocket.new/generatedImages/rocket_gen_img_116bc163a-1765288922613.png",
    previewAlt: 'Professional internship completion certificate with blue border and company logo featuring recipient name Sarah Johnson and completion date'
  },
  {
    id: 2,
    certificateId: 'AK-EMP-2025-042',
    title: 'Employee Recognition Award',
    recipientName: 'Michael Chen',
    recipientEmail: 'michael.chen@example.com',
    type: 'Employee Recognition',
    status: 'issued',
    issueDate: '12/20/2025',
    deliveryStatus: 'Delivered',
    verificationCode: 'VRF-2025-MC-042-9B4G',
    preview: "https://img.rocket.new/generatedImages/rocket_gen_img_18b929499-1767290541305.png",
    previewAlt: 'Elegant employee recognition certificate with gold accents and achievement ribbon displaying Michael Chen as outstanding performer'
  },
  {
    id: 3,
    certificateId: 'AK-INT-2026-002',
    title: 'Training Completion Certificate',
    recipientName: 'Emily Rodriguez',
    recipientEmail: 'emily.rodriguez@example.com',
    type: 'Training Completion',
    status: 'pending',
    issueDate: '12/28/2025',
    deliveryStatus: 'Pending',
    verificationCode: null,
    preview: "https://img.rocket.new/generatedImages/rocket_gen_img_1c2bef12e-1766592634050.png",
    previewAlt: 'Modern training completion certificate with teal color scheme and educational icons showing Emily Rodriguez completed advanced React training'
  },
  {
    id: 4,
    certificateId: 'AK-EMP-2025-043',
    title: 'Achievement Award Certificate',
    recipientName: 'David Kumar',
    recipientEmail: 'david.kumar@example.com',
    type: 'Achievement Award',
    status: 'issued',
    issueDate: '12/10/2025',
    deliveryStatus: 'Delivered',
    verificationCode: 'VRF-2025-DK-043-7C2H',
    preview: "https://img.rocket.new/generatedImages/rocket_gen_img_1e8f8f73d-1767290539783.png",
    previewAlt: 'Distinguished achievement award certificate with silver border and star emblem recognizing David Kumar for exceptional project leadership'
  },
  {
    id: 5,
    certificateId: 'AK-INT-2026-003',
    title: 'Internship Completion Certificate',
    recipientName: 'Jessica Martinez',
    recipientEmail: 'jessica.martinez@example.com',
    type: 'Internship Completion',
    status: 'revoked',
    issueDate: '11/30/2025',
    deliveryStatus: 'Revoked',
    verificationCode: null,
    preview: "https://img.rocket.new/generatedImages/rocket_gen_img_127155bf6-1767290547123.png",
    previewAlt: 'Standard internship certificate with company branding and official seal for Jessica Martinez showing six month completion period'
  },
  {
    id: 6,
    certificateId: 'AK-EMP-2025-044',
    title: 'Training Completion Certificate',
    recipientName: 'Robert Thompson',
    recipientEmail: 'robert.thompson@example.com',
    type: 'Training Completion',
    status: 'issued',
    issueDate: '12/22/2025',
    deliveryStatus: 'Delivered',
    verificationCode: 'VRF-2025-RT-044-6D1J',
    preview: "https://img.rocket.new/generatedImages/rocket_gen_img_1f6881e8e-1766783522837.png",
    previewAlt: 'Professional training certificate with blue gradient background and completion badge for Robert Thompson in data analytics program'
  }];


  const templates = [
  {
    id: 'temp-001',
    name: 'Internship Completion - Standard',
    description: 'Default template for internship completion certificates with company branding',
    preview: "https://img.rocket.new/generatedImages/rocket_gen_img_116bc163a-1765288922613.png",
    previewAlt: 'Standard internship certificate template with blue border, company logo placement, and recipient name field',
    isDefault: true,
    createdDate: '10/15/2025',
    usageCount: 156
  },
  {
    id: 'temp-002',
    name: 'Employee Recognition - Premium',
    description: 'Elegant template for employee recognition awards with gold accents',
    preview: "https://img.rocket.new/generatedImages/rocket_gen_img_1c908ddf7-1764882167350.png",
    previewAlt: 'Premium employee recognition template featuring gold border, achievement ribbon, and formal typography',
    isDefault: false,
    createdDate: '11/20/2025',
    usageCount: 89
  },
  {
    id: 'temp-003',
    name: 'Training Completion - Modern',
    description: 'Contemporary design for training and course completion certificates',
    preview: "https://img.rocket.new/generatedImages/rocket_gen_img_189d8213b-1766855520424.png",
    previewAlt: 'Modern training certificate template with teal color scheme, educational icons, and clean layout',
    isDefault: false,
    createdDate: '09/05/2025',
    usageCount: 234
  },
  {
    id: 'temp-004',
    name: 'Achievement Award - Distinguished',
    description: 'Formal template for special achievement and excellence awards',
    preview: "https://img.rocket.new/generatedImages/rocket_gen_img_1d6951829-1767290542465.png",
    previewAlt: 'Distinguished achievement template with silver border, star emblem, and formal seal placement',
    isDefault: false,
    createdDate: '08/12/2025',
    usageCount: 67
  }];


  const analyticsData = [
  { month: 'Jul', issued: 45, pending: 8 },
  { month: 'Aug', issued: 52, pending: 12 },
  { month: 'Sep', issued: 68, pending: 15 },
  { month: 'Oct', issued: 71, pending: 9 },
  { month: 'Nov', issued: 89, pending: 18 },
  { month: 'Dec', issued: 94, pending: 11 }];


  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      type: 'all',
      date: ''
    });
  };

  const handlePreview = (certificate) => {
    setSelectedCertificate(certificate);
    setIsPreviewModalOpen(true);
  };

  const handleDownload = (certificate) => {
    console.log('Downloading certificate:', certificate?.certificateId);
    alert(`Certificate ${certificate?.certificateId} downloaded successfully!`);
  };

  const handleRevoke = (certificate) => {
    if (window.confirm(`Are you sure you want to revoke certificate ${certificate?.certificateId}?`)) {
      console.log('Revoking certificate:', certificate?.certificateId);
      alert(`Certificate ${certificate?.certificateId} has been revoked.`);
    }
  };

  const handleBulkGenerate = (data) => {
    console.log('Bulk generating certificates:', data);
    alert('Bulk certificate generation completed successfully!');
  };

  const filteredCertificates = certificates?.filter((cert) => {
    const matchesSearch = cert?.recipientName?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
    cert?.certificateId?.toLowerCase()?.includes(filters?.search?.toLowerCase());
    const matchesStatus = filters?.status === 'all' || cert?.status === filters?.status;
    const matchesType = filters?.type === 'all' || cert?.type === filters?.type;
    const matchesDate = !filters?.date || cert?.issueDate?.includes(filters?.date);

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      <div className={`transition-smooth ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <header className="sticky top-0 z-30 bg-card border-b border-border px-4 md:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                Certificate Generation Portal
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and generate certificates with automated workflows
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                iconName="Download"
                iconPosition="left"
                onClick={() => console.log('Export report')}>

                Export Report
              </Button>
              <Button
                variant="default"
                size="sm"
                iconName="Plus"
                iconPosition="left"
                onClick={() => setIsBulkModalOpen(true)}>

                Bulk Generate
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <StatsCard
              title="Total Certificates"
              value="419"
              icon="Award"
              trend="up"
              trendValue="+12%"
              color="primary" />

            <StatsCard
              title="Issued This Month"
              value="94"
              icon="CheckCircle2"
              trend="up"
              trendValue="+8%"
              color="success" />

            <StatsCard
              title="Pending Generation"
              value="11"
              icon="Clock"
              trend="down"
              trendValue="-3%"
              color="warning" />

            <StatsCard
              title="Verification Rate"
              value="98.5%"
              icon="Shield"
              trend="up"
              trendValue="+2%"
              color="success" />

          </div>

          <div className="mb-6 md:mb-8">
            <AnalyticsChart data={analyticsData} />
          </div>

          <div className="bg-card border border-border rounded-xl p-2 mb-6 inline-flex gap-1">
            <button
              onClick={() => setActiveTab('certificates')}
              className={`px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-smooth ${
              activeTab === 'certificates' ?
              'bg-primary text-primary-foreground shadow-warm' : 'text-foreground hover:bg-muted'}`
              }>

              <span className="flex items-center gap-2">
                <Icon name="Award" size={16} />
                Certificates
              </span>
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-smooth ${
              activeTab === 'templates' ? 'bg-primary text-primary-foreground shadow-warm' : 'text-foreground hover:bg-muted'}`
              }>

              <span className="flex items-center gap-2">
                <Icon name="FileText" size={16} />
                Templates
              </span>
            </button>
          </div>

          {activeTab === 'certificates' &&
          <>
              <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters} />


              <div className="mt-6 md:mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground">
                    All Certificates ({filteredCertificates?.length})
                  </h2>
                </div>

                {filteredCertificates?.length === 0 ?
              <div className="bg-card border border-border rounded-xl p-8 md:p-12 text-center">
                    <Icon name="FileX" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                    <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                      No certificates found
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters or generate new certificates
                    </p>
                  </div> :

              <div className="space-y-4 md:space-y-6">
                    {filteredCertificates?.map((certificate) =>
                <CertificateCard
                  key={certificate?.id}
                  certificate={certificate}
                  onDownload={handleDownload}
                  onPreview={handlePreview}
                  onRevoke={handleRevoke} />

                )}
                  </div>
              }
              </div>
            </>
          }

          {activeTab === 'templates' &&
          <div className="mt-6 md:mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground">
                  Certificate Templates ({templates?.length})
                </h2>
                <Button
                variant="default"
                size="sm"
                iconName="Plus"
                iconPosition="left"
                onClick={() => console.log('Create template')}>

                  Create Template
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {templates?.map((template) =>
              <TemplateCard
                key={template?.id}
                template={template}
                onEdit={(t) => console.log('Edit template:', t?.id)}
                onDelete={(t) => console.log('Delete template:', t?.id)}
                onUse={(t) => console.log('Use template:', t?.id)} />

              )}
              </div>
            </div>
          }
        </main>
      </div>
      <BulkGenerationModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        templates={templates}
        onGenerate={handleBulkGenerate} />

      <CertificatePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        certificate={selectedCertificate}
        onDownload={handleDownload} />

    </div>);

};

export default CertificateGenerationPortal;