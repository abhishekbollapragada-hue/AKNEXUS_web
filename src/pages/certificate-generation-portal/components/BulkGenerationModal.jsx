import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';


const BulkGenerationModal = ({ isOpen, onClose, templates, onGenerate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [recipientFile, setRecipientFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const templateOptions = templates?.map(template => ({
    value: template?.id,
    label: template?.name,
    description: template?.description
  }));

  const handleFileChange = (e) => {
    const file = e?.target?.files?.[0];
    if (file && (file?.type === 'text/csv' || file?.name?.endsWith('.csv'))) {
      setRecipientFile(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || !recipientFile) return;

    setIsGenerating(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsGenerating(false);
            onGenerate({ templateId: selectedTemplate, file: recipientFile });
            onClose();
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-warm-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
            Bulk Certificate Generation
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-smooth"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <Select
              label="Select Template"
              description="Choose the certificate template for bulk generation"
              options={templateOptions}
              value={selectedTemplate}
              onChange={setSelectedTemplate}
              required
              searchable
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Upload Recipients CSV
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-smooth">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Icon name="Upload" size={32} color="var(--color-muted-foreground)" className="mx-auto mb-3" />
                  <p className="text-sm text-foreground mb-1">
                    {recipientFile ? recipientFile?.name : 'Click to upload CSV file'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    CSV should contain: name, email, completion_date, certificate_type
                  </p>
                </label>
              </div>
            </div>

            {isGenerating && (
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Generating Certificates...</span>
                  <span className="text-sm font-medium text-foreground data-text">{progress}%</span>
                </div>
                <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">CSV Format Requirements:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>First row must contain column headers</li>
                    <li>Required columns: name, email, completion_date, certificate_type</li>
                    <li>Date format: MM/DD/YYYY</li>
                    <li>Maximum 500 recipients per batch</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="default"
              iconName="FileCheck"
              iconPosition="left"
              onClick={handleGenerate}
              disabled={!selectedTemplate || !recipientFile || isGenerating}
              loading={isGenerating}
              fullWidth
            >
              Generate Certificates
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isGenerating}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkGenerationModal;