import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { CelebrationView } from './components/CelebrationView';
import { MemoryLaneView } from './components/MemoryLaneView';
import { PhotoGalleryView } from './components/PhotoGalleryView';
import { LettersAndCouponsView } from './components/LettersAndCouponsView';
import { GamesView } from './components/GamesView';
import { GiftBoxView } from './components/GiftBoxView';
import { SecretLockScreen } from './components/SecretLockScreen';
import { HeartExplosionEffect } from './components/HeartExplosionEffect';
import { AnimatePresence, motion } from 'motion/react';
import { initialData } from './data/initialData';
import { AppDataState, PhotoItem, MemoryMoment, PartnerInfo } from './types';
import { Heart, Sparkles } from 'lucide-react';
import { romanticAudio } from './utils/romanticAudio';

export default function App() {
  const [data, setData] = useState<AppDataState>(initialData);
  const [activeTab, setActiveTab] = useState<ActiveTab>('celebrate');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Secret code "love" lock state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('anmol_birthday_unlocked_love') === 'true';
    } catch {
      return false;
    }
  });

  const handleUnlock = () => {
    try {
      sessionStorage.setItem('anmol_birthday_unlocked_love', 'true');
    } catch {}
    setIsUnlocked(true);
    setIsMusicPlaying(true);
  };

  const handleLock = () => {
    try {
      sessionStorage.removeItem('anmol_birthday_unlocked_love');
    } catch {}
    setIsUnlocked(false);
  };

  // Load from server on mount
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(result => {
        if (result?.data) {
          setData(result.data);
        }
      })
      .catch(err => {
        console.warn("Using offline / initial state fallback:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Scroll smoothly to top on tab switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Handlers for photos
  const handleAddPhotos = async (newPhotos: Partial<PhotoItem>[]) => {
    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPhotos)
      });
      const result = await res.json();
      if (result.photos) {
        setData(prev => ({ ...prev, photos: result.photos }));
      }
    } catch {
      // Optimistic update
      const processed: PhotoItem[] = newPhotos.map((p, idx) => ({
        id: `p_local_${Date.now()}_${idx}`,
        url: p.url || '',
        caption: p.caption || 'A precious moment',
        date: p.date || 'Recently',
        location: p.location || 'Together',
        chapter: p.chapter || 'Everyday Magic',
        isFavorite: Boolean(p.isFavorite),
        notes: p.notes || ''
      }));
      setData(prev => ({ ...prev, photos: [...processed, ...prev.photos] }));
    }
  };

  const handleDeletePhoto = async (id: string) => {
    try {
      const res = await fetch(`/api/photos/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.photos) {
        setData(prev => ({ ...prev, photos: result.photos }));
      }
    } catch {
      setData(prev => ({ ...prev, photos: prev.photos.filter(p => p.id !== id) }));
    }
  };

  const handleToggleFavorite = async (id: string) => {
    romanticAudio.playChime([523.25, 659.25]);
    try {
      const res = await fetch(`/api/photos/${id}/toggle-fav`, { method: 'POST' });
      const result = await res.json();
      if (result.photos) {
        setData(prev => ({ ...prev, photos: result.photos }));
      }
    } catch {
      setData(prev => ({
        ...prev,
        photos: prev.photos.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)
      }));
    }
  };

  // Handlers for memories
  const handleAddMemory = async (memory: Partial<MemoryMoment>) => {
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memory)
      });
      const result = await res.json();
      if (result.memories) {
        setData(prev => ({ ...prev, memories: result.memories }));
      }
    } catch {
      const newMem: MemoryMoment = {
        id: `m_local_${Date.now()}`,
        title: memory.title || 'Special Moment',
        chapter: memory.chapter || 'Everyday Magic',
        date: memory.date || 'Recently',
        location: memory.location || 'Together',
        story: memory.story || '',
        photoUrl: memory.photoUrl,
        emotionEmoji: memory.emotionEmoji || '💖',
        secretThought: memory.secretThought
      };
      setData(prev => ({ ...prev, memories: [newMem, ...prev.memories] }));
    }
  };

  // Handlers for letters & coupons
  const handleOpenLetter = async (id: string) => {
    try {
      await fetch(`/api/letters/${id}/open`, { method: 'POST' });
    } catch {}
    setData(prev => ({
      ...prev,
      letters: prev.letters.map(l => l.id === id ? { ...l, opened: true } : l)
    }));
  };

  const handleRedeemCoupon = async (id: string) => {
    try {
      await fetch(`/api/coupons/${id}/redeem`, { method: 'POST' });
    } catch {}
    setData(prev => ({
      ...prev,
      coupons: prev.coupons.map(c => c.id === id ? { ...c, redeemed: !c.redeemed } : c)
    }));
  };

  // Handlers for reasons
  const handleAddReason = async (reason: string, category: string) => {
    try {
      const res = await fetch('/api/reasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, category })
      });
      const result = await res.json();
      if (result.reasons) {
        setData(prev => ({ ...prev, reasons: result.reasons }));
      }
    } catch {
      const newReason = {
        id: `r_local_${Date.now()}`,
        number: data.reasons.length + 1,
        reason,
        category: category as any,
        favorite: true
      };
      setData(prev => ({ ...prev, reasons: [...prev.reasons, newReason] }));
    }
  };

  // Partner Settings update
  const handleUpdatePartner = async (updated: Partial<PartnerInfo>) => {
    try {
      const res = await fetch('/api/partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const result = await res.json();
      if (result.partner) {
        setData(prev => ({ ...prev, partner: result.partner }));
      }
    } catch {
      setData(prev => ({ ...prev, partner: { ...prev.partner, ...updated } }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ffe8ef] via-[#fff0f5] to-[#fce4ec] text-[#2d1b24] selection:bg-pink-300 selection:text-pink-950 relative">
      {/* Interactive Heart Explosion Particle Effect on Background Clicks */}
      <HeartExplosionEffect />

      {/* Gentle floating ambient pink petal / glow accents in background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-50">
        <div className="absolute top-10 left-[8%] w-80 h-80 rounded-full bg-pink-400/20 blur-3xl"></div>
        <div className="absolute top-1/3 right-[5%] w-96 h-96 rounded-full bg-rose-300/20 blur-3xl"></div>
        <div className="absolute bottom-20 left-[15%] w-96 h-96 rounded-full bg-pink-300/25 blur-3xl"></div>
        
        {/* Floating Pink Rose Petals */}
        {[
          { left: '10%', delay: '0s', duration: '11s', size: 'w-4 h-4' },
          { left: '25%', delay: '3s', duration: '14s', size: 'w-3 h-3' },
          { left: '42%', delay: '1s', duration: '12s', size: 'w-5 h-5' },
          { left: '60%', delay: '5s', duration: '15s', size: 'w-4 h-4' },
          { left: '78%', delay: '2s', duration: '13s', size: 'w-3.5 h-3.5' },
          { left: '90%', delay: '4s', duration: '16s', size: 'w-4 h-4' },
        ].map((petal, i) => (
          <div
            key={i}
            className={`absolute -top-6 ${petal.size} rounded-full bg-pink-400/40 pointer-events-none`}
            style={{
              left: petal.left,
              animation: `float-petal ${petal.duration} linear infinite`,
              animationDelay: petal.delay,
              clipPath: 'polygon(50% 0%, 80% 30%, 100% 70%, 50% 100%, 0% 70%, 20% 30%)'
            }}
          />
        ))}
      </div>
      
      {/* Secret Passcode "love" Lock Screen */}
      <AnimatePresence>
        {!isUnlocked && (
          <SecretLockScreen
            onUnlock={handleUnlock}
            partnerName={data.partner.girlfriendName}
          />
        )}
      </AnimatePresence>

      {/* Sticky Top Interactive Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab)}
        partner={data.partner}
        isMusicPlaying={isMusicPlaying}
        setIsMusicPlaying={setIsMusicPlaying}
        photoCount={data.photos.length}
        onLockSite={handleLock}
      />

      {/* Main Multi-Page Container with Smooth Fade-In Transitions */}
      <main className="flex-1 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(2px)' }}
            transition={{
              duration: 0.38,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full"
          >
            {activeTab === 'celebrate' && (
              <CelebrationView
                partner={data.partner}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'memories' && (
              <MemoryLaneView
                memories={data.memories}
                onAddMemory={handleAddMemory}
              />
            )}

            {activeTab === 'gallery' && (
              <PhotoGalleryView
                photos={data.photos}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {activeTab === 'letters' && (
              <LettersAndCouponsView
                letters={data.letters}
                coupons={data.coupons}
                onOpenLetter={handleOpenLetter}
                onRedeemCoupon={handleRedeemCoupon}
              />
            )}

            {activeTab === 'games' && (
              <GamesView
                quiz={data.quiz}
                partner={data.partner}
              />
            )}

            {activeTab === 'gift' && (
              <GiftBoxView
                partner={data.partner}
                reasons={data.reasons}
                onAddReason={handleAddReason}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Engagement Tip */}
      <div className="fixed bottom-4 left-4 z-30 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-pink-100/95 backdrop-blur-md border border-pink-200/90 shadow-md text-[11px] font-medium text-pink-900 pointer-events-none select-none">
        <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-spin" style={{ animationDuration: '6s' }} />
        <span>Click anywhere for heart explosions 💕</span>
      </div>

      {/* Romantic Pink Footer */}
      <footer className="border-t border-pink-300/80 bg-[#fce4ee]/95 py-8 text-center text-xs text-pink-900/80 relative z-10">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 fill-pink-500 text-pink-500 animate-pulse-soft" />
            <span className="font-display font-semibold text-pink-950">
              {data.partner.girlfriendName} & {data.partner.clientName}
            </span>
          </div>
          <p className="font-handwriting text-xl text-pink-800 font-semibold">
            "Every day is a gift because you are in it."
          </p>
          <div className="text-[11px] text-pink-700/80 font-medium">
            Made with all my love for Anmol's 19th September Birthday 🌸🎂
          </div>
        </div>
      </footer>

    </div>
  );
}
