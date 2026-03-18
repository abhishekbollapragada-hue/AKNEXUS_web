import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const DocumentUploadSection = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');

  const documentTypes = [
    { value: 'offer-letter', label: 'Offer Letter' },
    { value: 'internship-letter', label: 'Internship Letter' },
    { value: 'id-proof', label: 'ID Proof (Aadhar/PAN)' },
    { value: 'resume', label: 'Resume/CV' },
    { value: 'certificates', label: 'Educational Certificates' },
    { value: 'nda', label: 'NDA Document' },
    { value: 'other', label: 'Other Documents' }
  ];

  const uploadedDocuments = [
    {
      id: 1,
      name: "Resume_JohnDoe_2025.pdf",
      type: "Resume/CV",
      size: "2.4 MB",
      uploadDate: "2025-12-15",
      status: "approved",
      icon: "FileText"
    },
    {
      id: 2,
      name: "Aadhar_Card.pdf",
      type: "ID Proof",
      size: "1.8 MB",
      uploadDate: "2025-12-15",
      status: "approved",
      icon: "CreditCard"
    },
    {
      id: 3,
      name: "Educational_Certificate.pdf",
      type: "Educational Certificates",
      size: "3.2 MB",
      uploadDate: "2025-12-20",
      status: "pending",
      icon: "Award"
    },
    {
      id: 4,
      name: "NDA_Signed.pdf",
      type: "NDA Document",
      size: "856 KB",
      uploadDate: "2025-12-22",
      status: "approved",
      icon: "FileCheck"
    }
  ];

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === "dragenter" || e?.type === "dragover") {
      setDragActive(true);
    } else if (e?.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      console.log('Files dropped:', e?.dataTransfer?.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e?.target?.files && e?.target?.files?.[0]) {
      console.log('File selected:', e?.target?.files?.[0]);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      approved: 'bg-success/10 text-success border-success/20',
      pending: 'bg-warning/10 text-warning border-warning/20',
      rejected: 'bg-error/10 text-error border-error/20'
    };
    return colors?.[status] || colors?.pending;
  };

  return (
    <div className="bg-card rounded-xl shadow-warm-md p-4 md:p-6 border border-border">
      <div className="mb-6">
        <h2 className="text-lg md:text-xl lg:text-2xl font-heading font-semibold text-foreground mb-1">
          Document Management
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Upload and manage your required documents
        </p>
      </div>
      <div className="mb-6">
        <Select
          label="Document Type"
          placeholder="Select document type"
          options={documentTypes}
          value={selectedDocType}
          onChange={setSelectedDocType}
          required
          className="mb-4"
        />

        <div
          className={`relative border-2 border-dashed rounded-xl p-6 md:p-8 transition-smooth ${
            dragActive
              ? 'border-primary bg-primary/5' :'border-border bg-muted/30 hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Icon name="Upload" size={32} color="var(--color-primary)" />
            </div>
            <p className="text-base md:text-lg font-medium text-foreground mb-2">
              Drop files here or click to upload
            </p>
            <p className="text-xs md:text-sm text-muted-foreground text-center">
              Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
            </p>
          </label>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-heading font-semibold text-foreground">
            Uploaded Documents
          </h3>
          <span className="text-sm text-muted-foreground">
            {uploadedDocuments?.length} document{uploadedDocuments?.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-3">
          {uploadedDocuments?.map((doc) => (
            <div
              key={doc?.id}
              className="bg-muted/30 rounded-xl p-4 border border-border hover:border-primary/30 transition-smooth"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name={doc?.icon} size={20} color="var(--color-primary)" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm md:text-base font-medium text-foreground truncate mb-1">
                        {doc?.name}
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground">{doc?.type}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(doc?.status)} capitalize flex-shrink-0`}>
                      {doc?.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Icon name="HardDrive" size={12} />
                      <span>{doc?.size}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="Calendar" size={12} />
                      <span>{new Date(doc.uploadDate)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Eye"
                      iconPosition="left"
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Download"
                      iconPosition="left"
                    >
                      Download
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      iconName="Trash2"
                      iconPosition="left"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadSection;