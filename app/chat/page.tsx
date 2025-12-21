'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ConversationList } from '@/components/chat/ConversationList';
import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-grey-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-medium overflow-hidden">
              <div className="p-6 border-b border-grey-200">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-primary-600" />
                  <h1 className="text-2xl font-bold text-grey-900">Messages</h1>
                </div>
              </div>
              <ConversationList />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}


