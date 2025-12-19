/**
 * Help Center Component
 * Phase 4: Accessibility - Content & Help
 * 
 * Provides help documentation and FAQs
 */

'use client';

import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Book, MessageCircle, Mail } from 'lucide-react';
import { H3, Body, BodySmall } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'searching' | 'listings' | 'account' | 'payments';
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'How do I search for rooms?',
    answer: 'Use the search bar at the top of the page to search by city, state, or keywords. You can also use the filter sidebar to narrow down results by price, amenities, and availability date.',
    category: 'searching',
  },
  {
    id: '2',
    question: 'How do I save a listing to favorites?',
    answer: 'Click the heart icon on any listing card or listing detail page. You can view all your saved favorites in the Favorites section.',
    category: 'listings',
  },
  {
    id: '3',
    question: 'How do I create a listing?',
    answer: 'Sign up as a landlord, then click the "Create Listing" button. Fill out the listing form with details about your room, upload photos, and set your price.',
    category: 'listings',
  },
  {
    id: '4',
    question: 'Is it free to create an account?',
    answer: 'Yes, creating an account is completely free. You can browse listings, save favorites, and contact landlords at no cost.',
    category: 'account',
  },
  {
    id: '5',
    question: 'How do I contact a landlord?',
    answer: 'Once you find a listing you&apos;re interested in, click on it to view details. You can then use the contact button to message the landlord directly.',
    category: 'listings',
  },
  {
    id: '6',
    question: 'What information do I need to create a listing?',
    answer: 'You&apos;ll need: room title, description, price, location (city, state, ZIP), number of bedrooms/bathrooms, amenities, availability date, and at least one photo.',
    category: 'listings',
  },
];

export function HelpCenter() {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'general', label: 'General' },
    { id: 'searching', label: 'Searching' },
    { id: 'listings', label: 'Listings' },
    { id: 'account', label: 'Account' },
  ];

  const filteredFAQs = selectedCategory === 'all'
    ? faqs
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex p-4 bg-primary-50 rounded-full mb-4">
          <HelpCircle className="w-12 h-12 text-primary-600" />
        </div>
        <H3 className="mb-3">Help Center</H3>
        <Body className="text-grey-600 max-w-2xl mx-auto">
          Find answers to common questions and learn how to get the most out of RoomRentalUSA
        </Body>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              'px-4 py-2 rounded-lg border-2 transition-all duration-200',
              selectedCategory === category.id
                ? 'bg-primary-50 border-primary-500 text-primary-700 font-medium'
                : 'bg-white border-grey-300 text-grey-700 hover:border-primary-400'
            )}
            aria-pressed={selectedCategory === category.id}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* FAQs */}
      <div className="space-y-4">
        {filteredFAQs.map((faq) => (
          <div
            key={faq.id}
            className="bg-white border border-grey-200 rounded-xl overflow-hidden shadow-soft"
          >
            <button
              onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-grey-50 transition-colors"
              aria-expanded={openFAQ === faq.id}
              aria-controls={`faq-answer-${faq.id}`}
            >
              <span className="font-semibold text-grey-900 pr-4">{faq.question}</span>
              {openFAQ === faq.id ? (
                <ChevronUp className="w-5 h-5 text-grey-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-grey-400 flex-shrink-0" />
              )}
            </button>
            {openFAQ === faq.id && (
              <div
                id={`faq-answer-${faq.id}`}
                className="px-6 py-4 border-t border-grey-200 bg-grey-50"
                role="region"
                aria-labelledby={`faq-question-${faq.id}`}
              >
                <Body className="text-grey-700">{faq.answer}</Body>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <div className="mt-12 p-6 bg-primary-50 rounded-xl border border-primary-200">
        <div className="flex items-start gap-4">
          <MessageCircle className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-grey-900 mb-2">Still need help?</h4>
            <BodySmall className="text-grey-600 mb-4">
              Can&apos;t find what you&apos;re looking for? Contact our support team and we&apos;ll get back to you as soon as possible.
            </BodySmall>
            <Button variant="primary" size="sm" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

