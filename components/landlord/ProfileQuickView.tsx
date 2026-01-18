'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { User, Edit, Settings } from 'lucide-react';
import Image from 'next/image';

export function ProfileQuickView() {
  const { user } = useAuth();

  return (
    <Link
      href="/landlord/profile"
      className="block bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
    >
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          {user?.profileImage ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
              <Image
                src={user.profileImage}
                alt={user.name || 'Profile'}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30 shadow-lg">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-md">
            <Edit className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-lg sm:text-xl truncate">
              {user?.name || 'Your Profile'}
            </h3>
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white/80 flex-shrink-0" />
          </div>
          <p className="text-sm sm:text-base text-white/90 truncate mb-2">
            {user?.email}
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
              LANDLORD
            </span>
            <span className="text-xs text-white/80">Tap to edit</span>
          </div>
        </div>
      </div>
    </Link>
  );
}





