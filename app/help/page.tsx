import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HelpCenter } from '@/components/help/HelpCenter';

export const metadata = {
  title: 'Help Center - RoomRentalUSA',
  description: 'Get help with using RoomRentalUSA. Find answers to common questions and contact support.',
};

export default function HelpPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-grey-50 py-12">
        <HelpCenter />
      </main>
      <Footer />
    </>
  );
}













