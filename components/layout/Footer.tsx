/**
 * Footer Component
 * Phase 4: Accessibility - Semantic HTML & ARIA
 * 
 * Provides site footer with navigation and links
 */

import Link from 'next/link';
import { Home, HelpCircle, Mail, Shield, FileText } from 'lucide-react';
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
    <footer className="bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900 text-white mt-auto" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gradient-warm">RoomRentalUSA</h3>
            <BodySmall className="text-accent-100 mb-4">
              Find your perfect room across the United States. Connecting students and young professionals with quality housing.
            </BodySmall>
            <div className="flex items-center gap-2 text-accent-200">
              <Shield className="w-4 h-4" aria-hidden="true" />
              <Caption className="text-xs">Secure & Verified</Caption>
            </div>
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
                      className="text-accent-100 hover:text-accent-300 transition-colors text-sm hover:translate-x-1 inline-block"
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
                      className="text-accent-100 hover:text-accent-300 transition-colors text-sm hover:translate-x-1 inline-block"
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
                      className="text-accent-100 hover:text-accent-300 transition-colors text-sm hover:translate-x-1 inline-block"
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
        <div className="border-t border-primary-700/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <BodySmall className="text-accent-200">
            © {currentYear} RoomRentalUSA. All rights reserved.
          </BodySmall>
          <div className="flex items-center gap-4">
            <Link
              href="/accessibility"
              className="text-accent-200 hover:text-accent-300 transition-colors text-sm"
              aria-label="Accessibility statement"
            >
              Accessibility
            </Link>
            <span className="text-accent-300" aria-hidden="true">|</span>
            <Link
              href="/sitemap"
              className="text-accent-200 hover:text-accent-300 transition-colors text-sm"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
