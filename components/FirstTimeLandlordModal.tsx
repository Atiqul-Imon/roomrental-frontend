'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus, BarChart3, MessageCircle, X, ArrowRight } from 'lucide-react';

interface FirstTimeLandlordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export function FirstTimeLandlordModal({ isOpen, onClose, userName }: FirstTimeLandlordModalProps) {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Delay to trigger animation
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateListing = () => {
    onClose();
    router.push('/listings/create');
  };

  const handleGoToDashboard = () => {
    onClose();
    router.push('/landlord/dashboard');
  };

  const features = [
    {
      icon: Plus,
      title: 'Create Listings',
      description: 'Post unlimited property listings with photos and detailed descriptions',
    },
    {
      icon: MessageCircle,
      title: 'Connect with Tenants',
      description: 'Receive and respond to inquiries from interested students',
    },
    {
      icon: BarChart3,
      title: 'Track Performance',
      description: 'Monitor views, favorites, and engagement on your listings',
    },
  ];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
      show ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
        show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-grey-100 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-grey-600" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-coral-500 to-coral-600 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">
              Welcome to Landlord Mode{userName ? `, ${userName}` : ''}! 🎉
            </h2>
            <p className="text-coral-50 text-lg">
              You're now ready to start listing your properties and connecting with potential tenants.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Features Grid */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-grey-900 mb-6">What you can do now:</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl border-2 border-grey-200 hover:border-coral-300 hover:bg-coral-50/30 transition-all duration-200 group"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-coral-100 rounded-xl mb-4 group-hover:bg-coral-200 transition-colors">
                    <feature.icon className="w-6 h-6 text-coral-600" />
                  </div>
                  <h4 className="font-semibold text-grey-900 mb-2">{feature.title}</h4>
                  <p className="text-sm text-grey-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-accent-50 border-2 border-accent-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-grey-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Tips for Success
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-grey-700">
                <div className="w-6 h-6 rounded-full bg-accent-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-accent-700 font-bold text-xs">1</span>
                </div>
                <span><strong>High-quality photos</strong> - Listings with 5+ photos get 3x more inquiries</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-grey-700">
                <div className="w-6 h-6 rounded-full bg-accent-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-accent-700 font-bold text-xs">2</span>
                </div>
                <span><strong>Detailed descriptions</strong> - Include amenities, location details, and nearby attractions</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-grey-700">
                <div className="w-6 h-6 rounded-full bg-accent-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-accent-700 font-bold text-xs">3</span>
                </div>
                <span><strong>Quick responses</strong> - Reply to inquiries within 24 hours for best results</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleCreateListing}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-xl font-semibold hover:from-coral-600 hover:to-coral-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100"
            >
              <Plus className="w-5 h-5" />
              Create Your First Listing
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleGoToDashboard}
              className="px-6 py-4 border-2 border-grey-300 text-grey-700 rounded-xl font-semibold hover:bg-grey-50 transition-all"
            >
              Go to Dashboard
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-center text-sm text-grey-500 mt-6">
            💡 You can always switch back to Student mode from your profile settings
          </p>
        </div>
      </div>
    </div>
  );
}
