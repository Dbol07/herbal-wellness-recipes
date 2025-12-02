import React from 'react';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthWrapper from '@/components/AuthWrapper';
import { Toaster } from 'react-hot-toast';

const Index: React.FC = () => {
  return (
    <AuthProvider>
      <AuthWrapper>
        <AppProvider>
          <AppLayout />
          {/* Toast notifications available throughout the app */}
          <Toaster position="top-right" />
        </AppProvider>
      </AuthWrapper>
    </AuthProvider>
  );
};

export default Index;
