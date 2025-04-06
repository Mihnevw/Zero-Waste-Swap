import React, { createContext, useContext, useEffect } from 'react';

interface AnalyticsContextType {
  logPageView: (page: string) => void;
  logEvent: (event: string, properties?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  logPageView: () => {},
  logEvent: () => {},
});

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const logPageView = (page: string) => {
    // Implement your analytics tracking here
    console.log(`Page viewed: ${page}`);
  };

  const logEvent = (event: string, properties?: Record<string, any>) => {
    // Implement your event tracking here
    console.log(`Event: ${event}`, properties);
  };

  return (
    <AnalyticsContext.Provider value={{ logPageView, logEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
}; 