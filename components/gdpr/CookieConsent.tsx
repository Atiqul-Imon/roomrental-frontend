'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, Settings } from 'lucide-react';
import Link from 'next/link';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    savePreferences(onlyNecessary);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowPreferences(false);
    setShowBanner(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    // Dispatch event for other components to listen to
    window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: prefs }));
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Consent Banner */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[200] bg-white border-t-2 border-primary-500 shadow-2xl"
        role="dialog"
        aria-labelledby="cookie-consent-title"
        aria-live="polite"
      >
        <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Cookie className="h-5 w-5 text-primary-600" />
                <h3 id="cookie-consent-title" className="font-semibold text-grey-900 text-lg">
                  We Value Your Privacy
                </h3>
              </div>
              <p className="text-sm text-grey-700 mb-3">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                By clicking &quot;Accept All&quot;, you consent to our use of cookies.{' '}
                <Link href="/privacy#cookies" className="text-primary-600 hover:text-primary-700 underline">
                  Learn more
                </Link>
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  aria-label="Accept all cookies"
                >
                  Accept All
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 bg-grey-200 text-grey-800 rounded-lg hover:bg-grey-300 transition-colors text-sm font-medium"
                  aria-label="Reject all optional cookies"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="px-4 py-2 border border-grey-300 text-grey-700 rounded-lg hover:bg-grey-50 transition-colors text-sm font-medium flex items-center gap-1"
                  aria-label="Customize cookie preferences"
                >
                  <Settings className="h-4 w-4" />
                  Customize
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="absolute top-2 right-2 sm:relative sm:top-0 sm:right-0 p-1 text-grey-500 hover:text-grey-700 transition-colors"
              aria-label="Close cookie consent banner"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cookie Preferences Modal */}
      {showPreferences && (
        <div
          className="fixed inset-0 z-[201] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowPreferences(false)}
          role="dialog"
          aria-labelledby="cookie-preferences-title"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-grey-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-6 w-6 text-primary-600" />
                  <h2 id="cookie-preferences-title" className="text-2xl font-bold text-grey-900">
                    Cookie Preferences
                  </h2>
                </div>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="p-1 text-grey-500 hover:text-grey-700 transition-colors"
                  aria-label="Close preferences"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-sm text-grey-600">
                Manage your cookie preferences. You can enable or disable different types of cookies below. 
                Learn more in our{' '}
                <Link href="/privacy#cookies" className="text-primary-600 hover:text-primary-700 underline">
                  Privacy Policy
                </Link>
                .
              </p>

              {/* Necessary Cookies */}
              <div className="border border-grey-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-grey-900">Necessary Cookies</h3>
                    <p className="text-sm text-grey-600">Required for the website to function properly</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-grey-500 mr-2">Always Active</span>
                    <div className="w-12 h-6 bg-primary-600 rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-grey-500 mt-2">
                  These cookies are essential for authentication, security, and core functionality. 
                  They cannot be disabled.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-grey-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-grey-900">Analytics Cookies</h3>
                    <p className="text-sm text-grey-600">Help us understand how visitors interact with our website</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => togglePreference('analytics')}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-grey-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-grey-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <p className="text-xs text-grey-500 mt-2">
                  These cookies collect information about how you use our website, such as pages visited and errors encountered.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="border border-grey-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-grey-900">Marketing Cookies</h3>
                    <p className="text-sm text-grey-600">Used to deliver personalized advertisements</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => togglePreference('marketing')}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-grey-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-grey-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <p className="text-xs text-grey-500 mt-2">
                  These cookies track your browsing habits to show you relevant ads on other websites.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-grey-200 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-4 py-2 border border-grey-300 text-grey-700 rounded-lg hover:bg-grey-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


