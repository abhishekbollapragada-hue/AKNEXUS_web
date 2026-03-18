import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ForgotPasswordSection = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(email);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();

    if (!email) {
      setError('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 2000);
  };

  const handleInputChange = (e) => {
    setEmail(e?.target?.value);
    if (error) {
      setError('');
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-4 md:space-y-5 lg:space-y-6">
        <div className="text-center space-y-3 md:space-y-4">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-success/10 rounded-full flex items-center justify-center">
            <Icon name="CheckCircle2" size={32} color="var(--color-success)" />
          </div>
          <h3 className="text-lg md:text-xl lg:text-2xl font-heading font-semibold text-foreground">
            Check Your Email
          </h3>
          <p className="text-sm md:text-base text-muted-foreground">
            We've sent password reset instructions to <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <div className="p-3 md:p-4 bg-muted rounded-lg">
          <div className="flex items-start gap-2 md:gap-3">
            <Icon name="Info" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
            <div className="space-y-1 md:space-y-2">
              <p className="text-xs md:text-sm text-foreground font-medium">Next Steps:</p>
              <ul className="text-xs md:text-sm text-muted-foreground space-y-1">
                <li>• Check your inbox and spam folder</li>
                <li>• Click the reset link within 15 minutes</li>
                <li>• Create a new secure password</li>
              </ul>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={onBack}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5 lg:space-y-6">
      <div className="text-center space-y-2 md:space-y-3">
        <h3 className="text-lg md:text-xl lg:text-2xl font-heading font-semibold text-foreground">
          Reset Your Password
        </h3>
        <p className="text-sm md:text-base text-muted-foreground">
          Enter your email address and we'll send you instructions to reset your password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        <Input
          type="email"
          name="email"
          label="Email Address"
          placeholder="Enter your work email"
          value={email}
          onChange={handleInputChange}
          error={error}
          required
          disabled={isLoading}
          className="w-full"
        />

        <div className="space-y-3 md:space-y-4">
          <Button
            type="submit"
            variant="default"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
            iconName="Send"
            iconPosition="right"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="lg"
            fullWidth
            onClick={onBack}
            disabled={isLoading}
            iconName="ArrowLeft"
            iconPosition="left"
          >
            Back to Login
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordSection;