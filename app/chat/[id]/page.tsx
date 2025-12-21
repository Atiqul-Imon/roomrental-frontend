'use client';

import { useState, useEffect, use } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChatWindow } from '@/components/chat/ChatWindow';

export default function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Note: In Next.js 15, params is a Promise
  const resolvedParams = use(params);
  const conversationId = resolvedParams.id;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-grey-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-medium h-[calc(100vh-12rem)]">
              <ChatWindow conversationId={conversationId} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

