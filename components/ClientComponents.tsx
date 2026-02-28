'use client';

import dynamic from 'next/dynamic';

// Dynamic imports for non-critical components (better performance)
// These are loaded only on the client side after initial page load

const ChatWidgetWrapper = dynamic(
  () => import('@/components/chat/ChatWidgetWrapper').then(mod => ({ default: mod.ChatWidgetWrapper })),
  { ssr: false }
);

const CookieConsent = dynamic(
  () => import('@/components/gdpr/CookieConsent').then(mod => ({ default: mod.CookieConsent })),
  { ssr: false }
);

const ErrorTrackingInitializer = dynamic(
  () => import('@/components/ErrorTrackingInitializer').then(mod => ({ default: mod.ErrorTrackingInitializer })),
  { ssr: false }
);

const PerformanceMonitoringInitializer = dynamic(
  () => import('@/components/PerformanceMonitoringInitializer').then(mod => ({ default: mod.PerformanceMonitoringInitializer })),
  { ssr: false }
);

const WebVitals = dynamic(
  () => import('@/components/WebVitals').then(mod => ({ default: mod.WebVitals })),
  { ssr: false }
);

export function ClientComponents() {
  return (
    <>
      <ErrorTrackingInitializer />
      <PerformanceMonitoringInitializer />
      <WebVitals />
      <ChatWidgetWrapper />
      <CookieConsent />
    </>
  );
}
