import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '../../firebase/firebase';
import Icon from '../../components/AppIcon';

import LoginForm from './components/LoginForm';
import ForgotPasswordSection from './components/ForgotPasswordSection';
import SecurityBadges from './components/SecurityBadges';
import SessionInfo from './components/SessionInfo';

const AuthenticationPortal = () => {
   const navigate = useNavigate();
   const [showForgotPassword, setShowForgotPassword] = useState(false);
   const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
     const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCheckingAuth(false);
        return;
      }

      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
      
         // ---------->

          if (snap.exists()) {
            const role = snap.data().role;

            if (role === 'admin') {
              navigate('/admin/dashboard', { replace: true });
            } else if (role === 'mentor') {
              navigate('/mentor/dashboard', { replace: true });
            } else {
              navigate('/employee-self-service-portal', { replace: true });
            }
          }else {
          navigate('/employee-self-service-portal', { replace: true });
        }
      } catch (error) {
        console.error('Role redirect failed:', error);
        navigate('/employee-self-service-portal', { replace: true });
      } finally {
        setCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Checking session…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
        {/* LEFT SECTION */}
        <div className="hidden lg:flex flex-col justify-center space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-warm-lg">
                <Icon name="Briefcase" size={32} color="#FFFFFF" />
              </div>
              <div>
                <h1 className="text-4xl font-heading font-bold">AK Nexus</h1>
                <p className="text-muted-foreground">HR Management System</p>
              </div>
            </div>
          </div>

          <SessionInfo />
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md space-y-8">
            <div className="bg-card border border-border rounded-2xl shadow-warm-lg p-8">
              <div className="space-y-6">
                <div className="text-center lg:text-left">
                  <h2 className="text-2xl font-heading font-semibold">
                    {showForgotPassword ? 'Reset Password' : 'Sign In'}
                  </h2>
                </div>

                {showForgotPassword ? (
                  <ForgotPasswordSection onBack={() => setShowForgotPassword(false)} />
                ) : (
                  <>
                    <LoginForm />
                    <div className="text-center">
                      <button
                        onClick={() => setShowForgotPassword(true)}
                        className="text-primary font-medium"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <SecurityBadges />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationPortal;
