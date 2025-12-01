import React from 'react';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthWrapper from '@/components/AuthWrapper';

const Index: React.FC = () => {
  return (
    <AuthProvider>
      <AuthWrapper>
        <AppProvider>
          <AppLayout />
        </AppProvider>
      </AuthWrapper>
    </AuthProvider>
  );
};

export default Index;
