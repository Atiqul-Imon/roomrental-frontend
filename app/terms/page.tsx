'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { format } from 'date-fns';

export default function TermsOfServicePage() {
  const lastUpdated = '2024-01-18';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-comfort">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <article className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-12">
            <header className="mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-grey-900 mb-4">
                Terms of Service
              </h1>
              <p className="text-grey-600">
                Last Updated: {format(new Date(lastUpdated), 'MMMM dd, yyyy')}
              </p>
            </header>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-grey-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-grey-700 mb-4">
                  By accessing and using RoomRentalUSA (&quot;the Service&quot;), you accept and agree to be bound by 
                  the terms and provision of this agreement. If you do not agree to abide by the above, please do not 
                  use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-grey-900 mb-4">2. Description of Service</h2>
                <p className="text-grey-700 mb-4">
                  RoomRentalUSA is an online platform that connects property owners (landlords) with individuals seeking 
                  rental accommodations (students and young professionals). We facilitate the listing, searching, and 
                  communication between parties but are not a party to any rental agreement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-grey-900 mb-4">3. User Accounts</h2>
                <h3 className="text-xl font-semibold text-grey-900 mb-3">3.1 Registration</h3>
                <p className="text-grey-700 mb-4">
                  To use certain features of our Service, you must register for an account. You agree to provide accurate, 
                  current, and complete information during registration and to update such information to keep it accurate, 
                  current, and complete.
                </p>
                
                <h3 className="text-xl font-semibold text-grey-900 mb-3">3.2 Account Security</h3>
                <p className="text-grey-700 mb-4">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities 
                  that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-grey-900 mb-4">4. User Conduct</h2>
                <p className="text-grey-700 mb-4">You agree not to:</p>
                <ul className="list-disc list-inside text-grey-700 space-y-2 mb-4">
                  <li>Post false, misleading, or fraudulent information</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon the rights of others</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Use the Service for any illegal or unauthorized purpose</li>
                  <li>Transmit any viruses, malware, or harmful code</li>
                  <li>Attempt to gain unauthorized access to the Service</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-grey-900 mb-4">5. Listings and Content</h2>
                <h3 className="text-xl font-semibold text-grey-900 mb-3">5.1 Listing Accuracy</h3>
                <p className="text-grey-700 mb-4">
                  Landlords are responsible for ensuring that all listing information is accurate, complete, and up-to-date. 
                  We reserve the right to remove any listing that violates our policies or contains false information.
                </p>

                <h3 className="text-xl font-semibold text-grey-900 mb-3">5.2 Content Ownership</h3>
                <p className="text-grey-700 mb-4">
                  You retain ownership of any content you post on our Service. By posting content, you grant us a 
                  worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content in connection 
                  with the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-grey-900 mb-4">6. Fees and Payments</h2>
                <p className="text-grey-700 mb-4">
                  Certain features of our Service may require payment. All fees are stated in U.S. dollars and are 
                  non-refundable unless otherwise stated. We reserve the right to change our fees at any time with 
                  reasonable notice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-grey-900 mb-4">7. Disclaimers</h2>
                <p className="text-grey-700 mb-4">
                  THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, 
                  EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
                </p>
                <p className="text-grey-700 mb-4">
                  We are not responsible for the accuracy, completeness, or reliability of any listings or user-generated 
                  content. We do not verify the identity of users or the accuracy of information provided.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-grey-900 mb-4">8. Limitation of Liability</h2>
                <p className="text-grey-700 mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
                  CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR 
                  INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-grey-900 mb-4">9. Indemnification</h2>
                <p className="text-grey-700 mb-4">
                  You agree to indemnify and hold harmless RoomRentalUSA, its officers, directors, employees, and agents 
                  from any claims, damages, losses, liabilities, and expenses (including legal fees) arising out of or 
                  relating to your use of the Service or violation of these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-grey-900 mb-4">10. Termination</h2>
                <p className="text-grey-700 mb-4">
                  We may terminate or suspend your account and access to the Service immediately, without prior notice, 
                  for any reason, including breach of these Terms. Upon termination, your right to use the Service 
                  will immediately cease.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-grey-900 mb-4">11. Governing Law</h2>
                <p className="text-grey-700 mb-4">
                  These Terms shall be governed by and construed in accordance with the laws of the United States, 
                  without regard to its conflict of law provisions. Any disputes arising from these Terms shall be 
                  resolved in the courts of the United States.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-grey-900 mb-4">12. Changes to Terms</h2>
                <p className="text-grey-700 mb-4">
                  We reserve the right to modify these Terms at any time. We will notify users of any material changes 
                  by posting the new Terms on this page and updating the &quot;Last Updated&quot; date. Your continued 
                  use of the Service after such changes constitutes acceptance of the new Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-grey-900 mb-4">13. Contact Information</h2>
                <p className="text-grey-700 mb-4">
                  If you have any questions about these Terms, please contact us at:
                </p>
                <div className="bg-grey-50 rounded-lg p-4">
                  <p className="text-grey-700">
                    <strong>Email:</strong>{' '}
                    <a href="mailto:legal@roomrentalusa.com" className="text-primary-600 hover:text-primary-700 underline">
                      legal@roomrentalusa.com
                    </a>
                  </p>
                </div>
              </section>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}

