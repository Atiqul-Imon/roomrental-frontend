/**
 * Welcome Modal Component
 * Phase 2: User Experience - Onboarding
 * 
 * Provides first-time user welcome experience
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Search, Heart, MapPin, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { H2, Body, Lead } from '@/components/ui/Typography';

interface WelcomeModalProps {
  onClose: () => void;
}

export function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const steps = [
    {
      icon: Search,
      title: 'Find Your Perfect Room',
      description: 'Search through thousands of available rooms across the United States. Use our advanced filters to find exactly what you\'re looking for.',
      color: 'primary',
    },
    {
      icon: Heart,
      title: 'Save Your Favorites',
      description: 'Found a room you love? Save it to your favorites to compare later and never lose track of your top picks.',
      color: 'secondary',
    },
    {
      icon: MapPin,
      title: 'Explore Locations',
      description: 'Discover rooms in your preferred neighborhoods. See nearby amenities, commute times, and local attractions.',
      color: 'info',
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'All listings are verified and our platform ensures secure communication between students and landlords.',
      color: 'success',
    },
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    localStorage.setItem('welcomeCompleted', 'true');
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('welcomeCompleted', 'true');
    onClose();
  };

  const currentStep = steps[step - 1];
  const IconComponent = currentStep.icon;

  return (
    <Modal isOpen={true} onClose={handleSkip} size="lg">
      <div className="relative">
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-0 right-0 p-2 text-grey-400 hover:text-grey-600 transition-colors"
          aria-label="Close welcome modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-grey-600">
              Step {step} of {totalSteps}
            </span>
            <span className="text-sm text-grey-500">
              {Math.round((step / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-grey-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-primary transition-all duration-300 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="text-center py-8">
          <div className={`mb-6 inline-flex p-4 rounded-full bg-${currentStep.color}-50`}>
            <IconComponent className={`w-12 h-12 text-${currentStep.color}-600`} />
          </div>

          <H2 className="mb-4">{currentStep.title}</H2>
          <Lead className="text-grey-600 max-w-md mx-auto mb-8">
            {currentStep.description}
          </Lead>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setStep(index + 1)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index + 1 === step
                    ? 'bg-primary-600 w-8'
                    : index + 1 < step
                    ? 'bg-primary-300'
                    : 'bg-grey-300'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                Previous
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleNext}
              className="flex-1 max-w-xs"
            >
              {step === totalSteps ? 'Get Started' : 'Next'}
            </Button>
          </div>

          <button
            onClick={handleSkip}
            className="mt-4 text-sm text-grey-500 hover:text-grey-700 transition-colors"
          >
            Skip tour
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Hook to check if welcome should be shown
export function useWelcomeModal() {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const welcomeCompleted = localStorage.getItem('welcomeCompleted');
    if (!welcomeCompleted) {
      // Show welcome after a short delay
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return {
    showWelcome,
    setShowWelcome,
  };
}















