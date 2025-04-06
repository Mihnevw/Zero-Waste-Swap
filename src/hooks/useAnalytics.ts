import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../config/firebase';

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Log page view only if analytics is supported
    analytics.then(analyticsInstance => {
      if (analyticsInstance) {
        logEvent(analyticsInstance, 'page_view', {
          page_path: location.pathname,
          page_title: document.title,
        });
      }
    });
  }, [location]);

  const trackEvent = async (eventName: string, eventParams?: Record<string, any>) => {
    const analyticsInstance = await analytics;
    if (analyticsInstance) {
      logEvent(analyticsInstance, eventName, eventParams);
    }
  };

  return { trackEvent };
}; 