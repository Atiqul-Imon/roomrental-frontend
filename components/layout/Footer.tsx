'use client';

import Link from 'next/link';
import { 
  Home, 
  Search, 
  Heart, 
  User, 
  Building2, 
  GraduationCap, 
  HelpCircle, 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Shield,
  FileText,
  Lock,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-grey-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <h2 className="text-2xl font-bold text-gradient">
                RoomRentalUSA
              </h2>
            </Link>
            <p className="text-grey-300 mb-6 max-w-md leading-relaxed">
              Your trusted platform for finding the perfect room rental across the United States. 
              Connecting students and young professionals with quality housing options.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-grey-300">
                <Shield className="w-5 h-5 text-primary-400" />
                <span>Secure Platform</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-grey-300">
                <CheckCircle className="w-5 h-5 text-success" />
                <span>Verified Listings</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-grey-300">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>4.8/5 Rating</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-grey-400 mb-1">Follow us:</span>
              <div className="flex items-center gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-grey-800 hover:bg-primary-600 flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-grey-800 hover:bg-primary-600 flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-grey-800 hover:bg-secondary-500 flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-grey-800 hover:bg-primary-600 flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-grey-800 hover:bg-red-600 flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/listings" 
                  className="text-grey-300 hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <Search className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  <span>Browse Listings</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-grey-300 hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <HelpCircle className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/how-it-works" 
                  className="text-grey-300 hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  <span>How It Works</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="text-grey-300 hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <FileText className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  <span>Blog</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-grey-300 hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <Mail className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  <span>Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* For Landlords */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-400" />
              For Landlords
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/landlords" 
                  className="text-grey-300 hover:text-primary-400 transition-colors duration-200"
                >
                  List Your Property
                </Link>
              </li>
              <li>
                <Link 
                  href="/landlords/pricing" 
                  className="text-grey-300 hover:text-primary-400 transition-colors duration-200"
                >
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link 
                  href="/landlords/resources" 
                  className="text-grey-300 hover:text-primary-400 transition-colors duration-200"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link 
                  href="/landlords/success-stories" 
                  className="text-grey-300 hover:text-primary-400 transition-colors duration-200"
                >
                  Success Stories
                </Link>
              </li>
              <li>
                <Link 
                  href="/auth/register?role=landlord" 
                  className="text-grey-300 hover:text-primary-400 transition-colors duration-200 flex items-center gap-1 group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
            </ul>
          </div>

          {/* For Students */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-secondary-400" />
              For Students
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/students" 
                  className="text-grey-300 hover:text-primary-400 transition-colors duration-200"
                >
                  Find a Room
                </Link>
              </li>
              <li>
                <Link 
                  href="/students/guide" 
                  className="text-grey-300 hover:text-primary-400 transition-colors duration-200"
                >
                  Renting Guide
                </Link>
              </li>
              <li>
                <Link 
                  href="/students/safety" 
                  className="text-grey-300 hover:text-primary-400 transition-colors duration-200"
                >
                  Safety Tips
                </Link>
              </li>
              <li>
                <Link 
                  href="/students/faq" 
                  className="text-grey-300 hover:text-primary-400 transition-colors duration-200"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link 
                  href="/auth/register?role=student" 
                  className="text-grey-300 hover:text-primary-400 transition-colors duration-200 flex items-center gap-1 group"
                >
                  <span>Join Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-grey-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
              <p className="text-grey-300 text-sm">
                Get the latest room listings, tips, and exclusive offers delivered to your inbox.
              </p>
            </div>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-grey-800 border border-grey-700 text-white placeholder-grey-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-primary text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-grey-900"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-grey-800 bg-grey-950">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm text-grey-400 text-center md:text-left">
              <p>
                © {currentYear} RoomRentalUSA. All rights reserved.
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link 
                href="/privacy" 
                className="text-grey-400 hover:text-primary-400 transition-colors duration-200 flex items-center gap-1"
              >
                <Lock className="w-4 h-4" />
                <span>Privacy Policy</span>
              </Link>
              <Link 
                href="/terms" 
                className="text-grey-400 hover:text-primary-400 transition-colors duration-200 flex items-center gap-1"
              >
                <FileText className="w-4 h-4" />
                <span>Terms of Service</span>
              </Link>
              <Link 
                href="/cookies" 
                className="text-grey-400 hover:text-primary-400 transition-colors duration-200"
              >
                Cookie Policy
              </Link>
              <Link 
                href="/accessibility" 
                className="text-grey-400 hover:text-primary-400 transition-colors duration-200"
              >
                Accessibility
              </Link>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-grey-400">
              <a 
                href="mailto:support@roomrentalusa.com" 
                className="flex items-center gap-2 hover:text-primary-400 transition-colors duration-200"
              >
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">support@roomrentalusa.com</span>
                <span className="sm:hidden">Email</span>
              </a>
              <a 
                href="tel:+18005551234" 
                className="flex items-center gap-2 hover:text-primary-400 transition-colors duration-200"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">1-800-555-1234</span>
                <span className="sm:hidden">Call</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

