export interface PartnerInfo {
  girlfriendName: string;
  clientName: string;
  nickname: string;
  birthdayDate: string; // YYYY-MM-DD
  anniversaryDate: string; // YYYY-MM-DD
  specialSongTitle: string;
  specialSongArtist: string;
  heroTagline: string;
  personalLoveNote: string;
}

export interface PhotoItem {
  id: string;
  url: string;
  fallbackUrl?: string;
  photoIndex?: number;
  caption: string;
  date?: string;
  location?: string;
  chapter?: string;
  isFavorite?: boolean;
  notes?: string;
  aspectRatio?: 'portrait' | 'landscape' | 'square';
}

export interface MemoryMoment {
  id: string;
  title: string;
  chapter: 'Beginning' | 'Adventures' | 'Everyday Magic' | 'Unforgettable' | 'Milestones';
  date: string;
  location: string;
  lat?: number;
  lng?: number;
  story: string;
  photoUrl?: string;
  emotionEmoji: string;
  secretThought?: string;
}

export interface LoveLetter {
  id: string;
  title: string;
  prompt: string; // e.g. "Open when you miss my hugs"
  sealColor: string;
  opened: boolean;
  openedAt?: string;
  content: string;
  signature: string;
}

export interface LoveCoupon {
  id: string;
  title: string;
  category: string;
  perk: string;
  redeemed: boolean;
  iconName: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

export interface LoveReason {
  id: string;
  number: number;
  reason: string;
  category: 'Personality' | 'Little Things' | 'Adventures' | 'How You Make Me Feel';
  favorite?: boolean;
}

export interface AppDataState {
  partner: PartnerInfo;
  photos: PhotoItem[];
  memories: MemoryMoment[];
  letters: LoveLetter[];
  coupons: LoveCoupon[];
  quiz: QuizQuestion[];
  reasons: LoveReason[];
}
