import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ImportUsersModal = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationResults, setValidationResults] = useState(null);

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === 'dragenter' || e?.type === 'dragover') {
      setDragActive(true);
    } else if (e?.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFile(e?.dataTransfer?.files?.[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFile(e?.target?.files?.[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (selectedFile?.type === 'text/csv' || selectedFile?.name?.endsWith('.csv')) {
      setFile(selectedFile);
      validateFile(selectedFile);
    } else {
      alert('Please upload a CSV file');
    }
  };

  const validateFile = (file) => {
    const mockResults = {
      totalRows: 45,
      validRows: 42,
      invalidRows: 3,
      errors: [
        { row: 12, field: 'email', message: 'Invalid email format' },
        { row: 28, field: 'phone', message: 'Phone number required' },
        { row: 35, field: 'department', message: 'Invalid department code' }
      ]
    };
    setValidationResults(mockResults);
  };

  const handleImport = () => {
    if (file && validationResults && validationResults?.validRows > 0) {
      onImport(file, validationResults);
      handleClose();
    }
  };

  const handleClose = () => {
    setFile(null);
    setValidationResults(null);
    onClose();
  };

  const downloadTemplate = () => {
    const csvContent = "Name,Email,Phone,Role,Department,Joining Date,Status\nJohn Doe,john@example.com,+1234567890,employee,engineering,2026-01-01,active";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL?.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    a?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-warm-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground">Import Users</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            iconName="X"
            iconSize={20}
            aria-label="Close modal"
          />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-custom p-4 md:p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-heading font-semibold text-foreground">CSV Template</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                iconName="Download"
                iconPosition="left"
                iconSize={14}
              >
                Download Template
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Download the CSV template to ensure your data is formatted correctly. Required fields: Name, Email, Phone, Role, Department, Joining Date, Status.
            </p>
          </div>

          <div
            className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-smooth ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon name="Upload" size={32} color="var(--color-primary)" className="md:w-10 md:h-10" />
              </div>
              <div>
                <p className="text-base md:text-lg font-medium text-foreground mb-2">
                  {file ? file?.name : 'Drop your CSV file here'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">or</p>
                <label className="inline-block">
                  <Button variant="outline" as="span">
                    Browse Files
                  </Button>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileInput}
                    className="hidden"
                    aria-label="Upload CSV file"
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">Maximum file size: 10MB</p>
            </div>
          </div>

          {validationResults && (
            <div className="mt-6 space-y-4">
              <h3 className="text-base font-heading font-semibold text-foreground">Validation Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Total Rows</p>
                  <p className="text-2xl font-heading font-semibold text-foreground">{validationResults?.totalRows}</p>
                </div>
                <div className="bg-success/10 rounded-lg p-4">
                  <p className="text-xs text-success mb-1">Valid Rows</p>
                  <p className="text-2xl font-heading font-semibold text-success">{validationResults?.validRows}</p>
                </div>
                <div className="bg-error/10 rounded-lg p-4">
                  <p className="text-xs text-error mb-1">Invalid Rows</p>
                  <p className="text-2xl font-heading font-semibold text-error">{validationResults?.invalidRows}</p>
                </div>
              </div>

              {validationResults?.errors?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Errors Found</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-custom">
                    {validationResults?.errors?.map((error, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-error/5 border border-error/20 rounded-lg">
                        <Icon name="AlertCircle" size={16} color="var(--color-error)" className="flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">Row {error?.row}: {error?.field}</p>
                          <p className="text-xs text-muted-foreground">{error?.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-4 md:p-6 border-t border-border">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleImport}
            disabled={!file || !validationResults || validationResults?.validRows === 0}
            iconName="Upload"
            iconPosition="left"
            iconSize={16}
          >
            Import {validationResults ? `${validationResults?.validRows} Users` : 'Users'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImportUsersModal;