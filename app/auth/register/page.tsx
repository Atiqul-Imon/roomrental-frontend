import { Suspense } from 'react';
import { RegisterFormContent } from './RegisterPageClient';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

function RegisterFallback() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-comfort">
        <LoadingSpinner size="lg" text="Loading..." />
      </main>
      <Footer />
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterFormContent />
    </Suspense>
  );
}
