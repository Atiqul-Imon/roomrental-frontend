'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { chatApi } from '@/lib/chat-api';
import { MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ContactButtonProps {
  landlordId: string;
  landlordRole?: string;
  listingId: string;
  listingTitle: string;
}

export function ContactButton({
  landlordId,
  landlordRole,
  listingId,
  listingTitle,
}: ContactButtonProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isContacting, setIsContacting] = useState(false);

  // Determine who to contact - if landlord role is admin/staff/super_admin, contact them as admin
  const contactUserId = landlordId;
  const isAdminListing = landlordRole && ['admin', 'staff', 'super_admin'].includes(landlordRole);
  const buttonText = isAdminListing ? 'Contact Admin' : 'Contact Landlord';

  const contactMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated || !user) {
        router.push(`/auth/login?redirect=/listings/${listingId}`);
        return;
      }

      // Don't allow contacting yourself
      if (user.id === contactUserId) {
        throw new Error("You can't contact yourself");
      }

      // Create or get conversation
      const conversation = await chatApi.createOrGetConversation(contactUserId, listingId);
      return conversation;
    },
    onSuccess: (conversation) => {
      if (conversation) {
        router.push(`/chat?conversationId=${conversation.id}`);
      }
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || error.message || 'Failed to start conversation');
      setIsContacting(false);
    },
  });

  const handleContact = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/listings/${listingId}`);
      return;
    }

    setIsContacting(true);
    contactMutation.mutate();
  };

  // Don't show button if user is the owner
  if (isAuthenticated && user?.id === contactUserId) {
    return null;
  }

  return (
    <Button
      onClick={handleContact}
      disabled={contactMutation.isPending || isContacting}
      className="w-full px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      aria-label={buttonText}
    >
      {contactMutation.isPending || isContacting ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <MessageSquare className="w-5 h-5" />
          {buttonText}
        </>
      )}
    </Button>
  );
}


