'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getAvatarInitial, warmAvatarGradientClass } from '@/lib/user-avatar';

export type UserAvatarSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | 'edit'
  | 'hero'
  /** Landlord profile card (96px → 128px) */
  | 'profileCard';

export type UserAvatarTone =
  | 'default'
  /** Conversation row selected (on brand gradient background) */
  | 'selected-row'
  /** Light frosted circle on dark / colored headers (e.g. admin sidebar) */
  | 'glass-dark'
  /** Frosted warm highlight on blue gradient cards (landlord dashboard) */
  | 'glass-on-blue';

const SIZE_MAP: Record<
  UserAvatarSize,
  { box: string; text: string; img: number }
> = {
  xs: { box: 'w-6 h-6 min-w-[24px] min-h-[24px]', text: 'text-[10px] font-semibold', img: 24 },
  sm: { box: 'w-8 h-8 min-w-[32px] min-h-[32px]', text: 'text-xs font-semibold', img: 32 },
  md: { box: 'w-10 h-10 min-w-[40px] min-h-[40px]', text: 'text-sm font-semibold', img: 40 },
  lg: { box: 'w-12 h-12 min-w-[48px] min-h-[48px]', text: 'text-sm font-semibold', img: 48 },
  xl: { box: 'w-14 h-14 min-w-[56px] min-h-[56px]', text: 'text-base font-semibold', img: 56 },
  '2xl': {
    box: 'w-16 h-16 min-w-[64px] min-h-[64px] sm:w-20 sm:h-20 sm:min-w-[80px] sm:min-h-[80px]',
    text: 'text-lg font-bold sm:text-xl',
    img: 80,
  },
  edit: { box: 'w-32 h-32 min-w-[128px] min-h-[128px]', text: 'text-5xl font-bold', img: 128 },
  hero: {
    box: 'w-24 h-24 min-w-[96px] min-h-[96px] sm:w-28 sm:h-28 sm:min-w-[112px] sm:min-h-[112px] md:w-32 md:h-32 md:min-w-[128px] md:min-h-[128px]',
    text: 'text-4xl font-bold sm:text-5xl',
    img: 128,
  },
  profileCard: {
    box: 'w-24 h-24 min-w-[96px] min-h-[96px] sm:w-32 sm:h-32 sm:min-w-[128px] sm:min-h-[128px]',
    text: 'text-4xl font-bold sm:text-5xl',
    img: 128,
  },
};

const TONE_FALLBACK: Record<UserAvatarTone, string> = {
  default: '',
  'selected-row':
    'bg-white/25 text-white ring-1 ring-inset ring-white/40 shadow-inner backdrop-blur-[2px]',
  'glass-dark':
    'bg-white/20 backdrop-blur-sm text-white border-2 border-white/35 shadow-lg',
  'glass-on-blue':
    'bg-gradient-to-br from-white/40 via-white/20 to-amber-200/25 backdrop-blur-md text-white border-2 border-white/40 shadow-lg',
};

export interface UserAvatarProps {
  name: string | undefined | null;
  profileImage?: string | null;
  /** Defaults to `name`; use user id for stable color when name changes rarely */
  seed?: string | null;
  size?: UserAvatarSize;
  tone?: UserAvatarTone;
  className?: string;
  imageClassName?: string;
  alt?: string;
  priority?: boolean;
}

export function UserAvatar({
  name,
  profileImage,
  seed,
  size = 'md',
  tone = 'default',
  className,
  imageClassName,
  alt,
  priority = false,
}: UserAvatarProps) {
  const { box, text, img } = SIZE_MAP[size];
  const initial = getAvatarInitial(name);
  const seedValue = (seed ?? name ?? '').trim() || 'user';
  const displayAlt = alt ?? (name ? `${name}` : 'User');

  const fallbackBase =
    tone === 'default'
      ? cn(
          warmAvatarGradientClass(seedValue),
          'text-white shadow-sm ring-1 ring-black/[0.06]',
        )
      : TONE_FALLBACK[tone];

  if (profileImage) {
  const isHero = size === 'hero' || size === 'profileCard';
  return (
      <div className={cn('relative rounded-full overflow-hidden flex-shrink-0', box, className)}>
        {isHero ? (
          <Image
            src={profileImage}
            alt={displayAlt}
            fill
            className={cn('object-cover', imageClassName)}
            sizes="128px"
            priority={priority}
          />
        ) : (
          <Image
            src={profileImage}
            alt={displayAlt}
            width={img}
            height={img}
            className={cn('w-full h-full object-cover', imageClassName)}
            priority={priority}
          />
        )}
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={displayAlt}
      className={cn(
        'rounded-full flex items-center justify-center flex-shrink-0',
        box,
        text,
        fallbackBase,
        className,
      )}
    >
      <span aria-hidden className="select-none leading-none tracking-tight drop-shadow-sm">
        {initial}
      </span>
    </div>
  );
}
