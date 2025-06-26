import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { BookingProvider } from './src/context/BookingContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <AppNavigator />
      </BookingProvider>
    </AuthProvider>
  );
}
