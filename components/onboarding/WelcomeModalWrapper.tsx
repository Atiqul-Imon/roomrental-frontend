/**
 * Welcome Modal Wrapper
 * Client component wrapper for welcome modal
 */

'use client';

import { WelcomeModal, useWelcomeModal } from './WelcomeModal';

export function WelcomeModalWrapper() {
  const { showWelcome, setShowWelcome } = useWelcomeModal();

  if (!showWelcome) return null;

  return <WelcomeModal onClose={() => setShowWelcome(false)} />;
}




