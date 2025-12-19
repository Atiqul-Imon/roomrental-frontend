import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RoomRentalUSA - Find Your Perfect Room',
    short_name: 'RoomRentalUSA',
    description: 'Find single rooms for rent across the United States. Perfect for university students and young professionals.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3B82F6',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
    categories: ['housing', 'real estate', 'rentals'],
    lang: 'en-US',
    dir: 'ltr',
  };
}

