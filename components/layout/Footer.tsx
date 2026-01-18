/**
 * Footer Component
 * Phase 4: Accessibility - Semantic HTML & ARIA
 * 
 * Provides site footer with navigation and links
 */

import Link from 'next/link';
import { BodySmall, Caption } from '@/components/ui/Typography';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { href: '/listings', label: 'Browse Listings' },
      { href: '/listings/create', label: 'Create Listing' },
      { href: '/favorites', label: 'My Favorites' },
    ],
    support: [
      { href: '/help', label: 'Help Center' },
      { href: '/help#faq', label: 'FAQs' },
      { href: '/contact', label: 'Contact Us' },
    ],
    legal: [
      { href: '/terms', label: 'Terms of Service' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/accessibility', label: 'Accessibility' },
    ],
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white mt-auto" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <img 
                src="/logo/rrlogo-optimized.png" 
                alt="RoomRentalUSA" 
                className="h-12 w-auto sm:h-14 md:h-16"
              />
            </Link>
            <BodySmall className="text-gray-300 mb-4">
              Find your perfect room across the United States. Connecting students and young professionals with quality housing.
            </BodySmall>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <nav aria-label="Platform navigation">
              <ul className="space-y-2">
                {footerLinks.platform.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white hover:text-gray-200 transition-colors text-sm hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <nav aria-label="Support navigation">
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white hover:text-gray-200 transition-colors text-sm hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <nav aria-label="Legal navigation">
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white hover:text-gray-200 transition-colors text-sm hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <BodySmall className="text-gray-400">
            © {currentYear} RoomRentalUSA. All rights reserved.
          </BodySmall>
          <div className="flex items-center gap-4">
            <Link
              href="/accessibility"
              className="text-white hover:text-gray-200 transition-colors text-sm"
              aria-label="Accessibility statement"
            >
              Accessibility
            </Link>
            <span className="text-gray-600" aria-hidden="true">|</span>
            <Link
              href="/sitemap"
              className="text-white hover:text-gray-200 transition-colors text-sm"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
