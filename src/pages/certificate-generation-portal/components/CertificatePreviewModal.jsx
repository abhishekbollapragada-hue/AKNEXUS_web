import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CertificatePreviewModal = ({ isOpen, onClose, certificate, onDownload }) => {
  if (!isOpen || !certificate) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-warm-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl md:text-2xl font-heading font-semibold text-foreground truncate">
              Certificate Preview
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {certificate?.recipientName} - {certificate?.certificateId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-smooth flex-shrink-0 ml-4"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-muted rounded-lg p-4 md:p-8 mb-6">
            <div className="bg-card rounded-lg overflow-hidden shadow-warm-lg">
              <Image
                src={certificate?.preview}
                alt={certificate?.previewAlt}
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="User" size={18} color="var(--color-primary)" />
                <span className="text-sm font-medium text-foreground">Recipient Details</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="text-foreground font-medium">{certificate?.recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-foreground">{certificate?.recipientEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="text-foreground">{certificate?.type}</span>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="Shield" size={18} color="var(--color-primary)" />
                <span className="text-sm font-medium text-foreground">Verification Details</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Certificate ID:</span>
                  <span className="text-foreground font-mono data-text">{certificate?.certificateId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issue Date:</span>
                  <span className="text-foreground">{certificate?.issueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-foreground capitalize">{certificate?.status}</span>
                </div>
              </div>
            </div>
          </div>

          {certificate?.verificationCode && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Icon name="QrCode" size={24} color="var(--color-primary)" className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-2">Verification Code</p>
                  <p className="text-sm font-mono text-foreground data-text break-all">{certificate?.verificationCode}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Use this code to verify certificate authenticity
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="default"
              iconName="Download"
              iconPosition="left"
              onClick={() => onDownload(certificate)}
              fullWidth
            >
              Download PDF
            </Button>
            <Button
              variant="outline"
              iconName="Mail"
              iconPosition="left"
              onClick={() => console.log('Send email')}
            >
              Send via Email
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreviewModal;