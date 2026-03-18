import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CertificateCard = ({ certificate, onDownload, onPreview, onRevoke }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'issued':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'revoked':
        return 'bg-error/10 text-error';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'issued':
        return 'CheckCircle2';
      case 'pending':
        return 'Clock';
      case 'revoked':
        return 'XCircle';
      default:
        return 'Circle';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-warm hover:shadow-warm-md transition-smooth">
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        <div className="w-full lg:w-48 h-48 lg:h-64 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
          <Image
            src={certificate?.preview}
            alt={certificate?.previewAlt}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-2 truncate">
                {certificate?.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {certificate?.recipientName}
              </p>
            </div>
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${getStatusColor(certificate?.status)} flex-shrink-0`}>
              <Icon name={getStatusIcon(certificate?.status)} size={14} />
              {certificate?.status?.charAt(0)?.toUpperCase() + certificate?.status?.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Hash" size={16} color="var(--color-muted-foreground)" />
              <span className="text-muted-foreground">ID:</span>
              <span className="text-foreground font-medium data-text">{certificate?.certificateId}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Calendar" size={16} color="var(--color-muted-foreground)" />
              <span className="text-muted-foreground">Issued:</span>
              <span className="text-foreground">{certificate?.issueDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Award" size={16} color="var(--color-muted-foreground)" />
              <span className="text-muted-foreground">Type:</span>
              <span className="text-foreground">{certificate?.type}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Mail" size={16} color="var(--color-muted-foreground)" />
              <span className="text-muted-foreground">Delivery:</span>
              <span className="text-foreground">{certificate?.deliveryStatus}</span>
            </div>
          </div>

          {certificate?.verificationCode && (
            <div className="bg-muted rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Shield" size={16} color="var(--color-primary)" />
                <span className="text-xs font-medium text-foreground">Verification Code</span>
              </div>
              <p className="text-sm font-mono text-foreground data-text">{certificate?.verificationCode}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="default"
              size="sm"
              iconName="Eye"
              iconPosition="left"
              onClick={() => onPreview(certificate)}
            >
              Preview
            </Button>
            {certificate?.status === 'issued' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Download"
                  iconPosition="left"
                  onClick={() => onDownload(certificate)}
                >
                  Download
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  iconName="XCircle"
                  iconPosition="left"
                  onClick={() => onRevoke(certificate)}
                >
                  Revoke
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;