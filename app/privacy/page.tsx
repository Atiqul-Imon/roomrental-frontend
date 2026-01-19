'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { format } from 'date-fns';

export default function PrivacyPolicyPage() {
  const lastUpdated = '2024-01-18';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-comfort">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <article className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-12">
            <header className="mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-grey-900 mb-4">
                Privacy Policy
              </h1>
              <p className="text-grey-600">
                Last Updated: {format(new Date(lastUpdated), 'MMMM dd, yyyy')}
              </p>
            </header>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-grey-900 mb-4">1. Introduction</h2>
                <p className="text-grey-700 mb-4">
                  RoomRentalUSA (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit 
                  our website and use our services.
                </p>
                <p className="text-grey-700">
                  By using our services, you agree to the collection and use of information in accordance with this policy. 
                  If you do not agree with our policies and practices, please do not use our services.
                </p>
              </section>

              <section id="information-we-collect">
                <h2 className="text-2xl font-bold text-grey-900 mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold text-grey-900 mb-3">2.1 Personal Information</h3>
                <p className="text-grey-700 mb-4">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-grey-700 space-y-2 mb-4">
                  <li>Name, email address, phone number, and mailing address</li>
                  <li>Profile information and photos</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Property listing details and descriptions</li>
                  <li>Messages and communications with other users</li>
                  <li>Search history and preferences</li>
                </ul>

                <h3 className="text-xl font-semibold text-grey-900 mb-3">2.2 Automatically Collected Information</h3>
                <p className="text-grey-700 mb-4">
                  When you access our website, we automatically collect certain information, including:
                </p>
                <ul className="list-disc list-inside text-grey-700 space-y-2 mb-4">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent on pages</li>
                  <li>Referring website addresses</li>
                  <li>Location data (with your consent)</li>
                </ul>

                <h3 className="text-xl font-semibold text-grey-900 mb-3">2.3 Cookies and Tracking Technologies</h3>
                <p className="text-grey-700 mb-4">
                  We use cookies, web beacons, and similar tracking technologies to track activity on our website 
                  and store certain information. See our{' '}
                  <a href="#cookies" className="text-primary-600 hover:text-primary-700 underline">
                    Cookie Policy
                  </a>{' '}
                  section below for more details.
                </p>
              </section>

              <section id="how-we-use-information">
                <h2 className="text-2xl font-bold text-grey-900 mb-4">3. How We Use Your Information</h2>
                <p className="text-grey-700 mb-4">We use the information we collect to:</p>
                <ul className="list-disc list-inside text-grey-700 space-y-2 mb-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send you technical notices, updates, and support messages</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Monitor and analyze trends, usage, and activities</li>
                  <li>Detect, prevent, and address technical issues and fraudulent activity</li>
                  <li>Personalize your experience and deliver content relevant to your interests</li>
                  <li>Send you marketing communications (with your consent)</li>
                </ul>
              </section>

              <section id="legal-basis">
                <h2 className="text-2xl font-bold text-grey-900 mb-4">4. Legal Basis for Processing (GDPR)</h2>
                <p className="text-grey-700 mb-4">
                  If you are located in the European Economic Area (EEA), we process your personal data based on the following legal bases:
                </p>
                <ul className="list-disc list-inside text-grey-700 space-y-2 mb-4">
                  <li><strong>Consent:</strong> You have given consent to the processing of your personal data</li>
                  <li><strong>Contract:</strong> Processing is necessary for the performance of a contract</li>
                  <li><strong>Legal Obligation:</strong> Processing is necessary for compliance with a legal obligation</li>
                  <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate business interests</li>
                </ul>
              </section>

              <section id="data-sharing">
                <h2 className="text-2xl font-bold text-grey-900 mb-4">5. Information Sharing and Disclosure</h2>
                <p className="text-grey-700 mb-4">
                  We do not sell your personal information. We may share your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-grey-700 space-y-2 mb-4">
                  <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>With Your Consent:</strong> When you have given us explicit permission</li>
                </ul>
              </section>

              <section id="cookies">
                <h2 className="text-2xl font-bold text-grey-900 mb-4">6. Cookie Policy</h2>
                <p className="text-grey-700 mb-4">
                  We use different types of cookies on our website:
                </p>
                
                <h3 className="text-xl font-semibold text-grey-900 mb-3">6.1 Necessary Cookies</h3>
                <p className="text-grey-700 mb-4">
                  These cookies are essential for the website to function properly. They enable core functionality 
                  such as security, network management, and accessibility. You cannot opt-out of these cookies.
                </p>

                <h3 className="text-xl font-semibold text-grey-900 mb-3">6.2 Analytics Cookies</h3>
                <p className="text-grey-700 mb-4">
                  These cookies help us understand how visitors interact with our website by collecting and reporting 
                  information anonymously. This helps us improve our website and services.
                </p>

                <h3 className="text-xl font-semibold text-grey-900 mb-3">6.3 Marketing Cookies</h3>
                <p className="text-grey-700 mb-4">
                  These cookies are used to deliver advertisements that are relevant to you and your interests. 
                  They may also be used to limit the number of times you see an advertisement.
                </p>

                <p className="text-grey-700">
                  You can manage your cookie preferences at any time through our{' '}
                  <a href="/privacy#cookie-preferences" className="text-primary-600 hover:text-primary-700 underline">
                    Cookie Preferences
                  </a>{' '}
                  page or by clicking the cookie settings link in our cookie consent banner.
                </p>
              </section>

              <section id="data-security">
                <h2 className="text-2xl font-bold text-grey-900 mb-4">7. Data Security</h2>
                <p className="text-grey-700 mb-4">
                  We implement appropriate technical and organizational security measures to protect your personal information 
                  against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
                  over the Internet or electronic storage is 100% secure.
                </p>
              </section>

              <section id="data-retention">
                <h2 className="text-2xl font-bold text-grey-900 mb-4">8. Data Retention</h2>
                <p className="text-grey-700 mb-4">
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this 
                  Privacy Policy, unless a longer retention period is required or permitted by law.
                </p>
              </section>

              <section id="your-rights">
                <h2 className="text-2xl font-bold text-grey-900 mb-4">9. Your Rights (GDPR & CCPA)</h2>
                <p className="text-grey-700 mb-4">
                  Depending on your location, you may have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-grey-700 space-y-2 mb-4">
                  <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
                  <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                  <li><strong>Right to Restrict Processing:</strong> Request limitation of how we process your data</li>
                  <li><strong>Right to Data Portability:</strong> Request transfer of your data to another service</li>
                  <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
                  <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
                  <li><strong>Right to Opt-Out:</strong> Opt-out of sale of personal information (CCPA)</li>
                </ul>
                <p className="text-grey-700">
                  To exercise these rights, please contact us at{' '}
                  <a href="mailto:privacy@roomrentalusa.com" className="text-primary-600 hover:text-primary-700 underline">
                    privacy@roomrentalusa.com
                  </a>
                  {' '}or use our{' '}
                  <a href="/account/data-request" className="text-primary-600 hover:text-primary-700 underline">
                    Data Request Portal
                  </a>
                  .
                </p>
              </section>

              <section id="children-privacy">
                <h2 className="text-2xl font-bold text-grey-900 mb-4">10. Children&apos;s Privacy</h2>
                <p className="text-grey-700 mb-4">
                  Our services are not intended for individuals under the age of 18. We do not knowingly collect 
                  personal information from children. If you believe we have collected information from a child, 
                  please contact us immediately.
                </p>
              </section>

              <section id="international-transfers">
                <h2 className="text-2xl font-bold text-grey-900 mb-4">11. International Data Transfers</h2>
                <p className="text-grey-700 mb-4">
                  Your information may be transferred to and processed in countries other than your country of residence. 
                  We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
                </p>
              </section>

              <section id="changes">
                <h2 className="text-2xl font-bold text-grey-900 mb-4">12. Changes to This Privacy Policy</h2>
                <p className="text-grey-700 mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                  the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
                </p>
              </section>

              <section id="contact">
                <h2 className="text-2xl font-bold text-grey-900 mb-4">13. Contact Us</h2>
                <p className="text-grey-700 mb-4">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-grey-50 rounded-lg p-4">
                  <p className="text-grey-700 mb-2">
                    <strong>Email:</strong>{' '}
                    <a href="mailto:privacy@roomrentalusa.com" className="text-primary-600 hover:text-primary-700 underline">
                      privacy@roomrentalusa.com
                    </a>
                  </p>
                  <p className="text-grey-700">
                    <strong>Data Protection Officer:</strong> dpo@roomrentalusa.com
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

