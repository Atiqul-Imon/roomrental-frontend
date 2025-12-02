import { Metadata } from 'next';
import { api } from '@/lib/api';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  
  try {
    const response = await api.get(`/listings/${resolvedParams.id}`);
    const listing = response.data.data;

    return {
      title: listing.title,
      description: listing.description.substring(0, 160),
      openGraph: {
        title: listing.title,
        description: listing.description.substring(0, 160),
        images: listing.images.length > 0 ? [listing.images[0]] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: listing.title,
        description: listing.description.substring(0, 160),
        images: listing.images.length > 0 ? [listing.images[0]] : [],
      },
    };
  } catch {
    return {
      title: 'Listing Not Found',
    };
  }
}

