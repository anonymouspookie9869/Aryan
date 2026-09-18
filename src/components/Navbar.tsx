import React from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles, Image, BookOpen, Mail, Trophy, Gift, Volume2, VolumeX, Lock } from 'lucide-react';
import { romanticAudio } from '../utils/romanticAudio';
import { PartnerInfo } from '../types';

export type ActiveTab = 'celebrate' | 'memories' | 'gallery' | 'letters' | 'games' | 'gift';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  partner: PartnerInfo;
  isMusicPlaying: boolean;
  setIsMusicPlaying: (playing: boolean) => void;
  photoCount: number;
  onLockSite?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  partner,
  isMusicPlaying,
  setIsMusicPlaying,
  photoCount,
  onLockSite
}) => {
  const handleToggleMusic = () => {
    const playing = romanticAudio.toggleAmbientMusic(setIsMusicPlaying);
    setIsMusicPlaying(playing);
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'celebrate', label: 'Celebration', icon: <Sparkles className="w-4 h-4 text-pink-500" /> },
    { id: 'memories', label: 'Our Story', icon: <BookOpen className="w-4 h-4 text-pink-600" /> },
    { id: 'gallery', label: 'Photo Vault', icon: <Image className="w-4 h-4 text-rose-500" />, badge: photoCount },
    { id: 'letters', label: 'Open When...', icon: <Mail className="w-4 h-4 text-pink-500" /> },
    { id: 'games', label: 'Love Quiz', icon: <Trophy className="w-4 h-4 text-pink-500" /> },
    { id: 'gift', label: 'Gift Box & Wishes', icon: <Gift className="w-4 h-4 text-pink-500" /> },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#fff2f6]/95 border-b border-pink-200/80 shadow-xs transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20">
          
          {/* Logo / Sweetheart Header */}
          <div 
            onClick={() => setActiveTab('celebrate')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none min-w-0"
            id="brand-logo"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shadow-xs group-hover:scale-105 group-hover:bg-pink-200 transition-all duration-300 flex-shrink-0">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-pink-500 text-pink-500 animate-pulse-soft" />
            </div>
            <div className="truncate">
              <h1 className="font-display font-semibold text-base sm:text-xl text-stone-900 tracking-tight leading-tight group-hover:text-pink-700 transition-colors truncate">
                {partner.girlfriendName}
              </h1>
              <p className="text-[10px] sm:text-xs text-pink-600 font-medium font-sans-clean flex items-center gap-1">
                <span>Sept 19th</span>
                <span className="inline-block w-1 h-1 rounded-full bg-pink-400"></span>
                <span className="truncate">Forever & Always 🌸</span>
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-full text-xs lg:text-sm font-medium transition-colors duration-200 cursor-pointer ${
                    isActive
                      ? 'text-white'
                      : 'text-stone-700 hover:text-pink-900 hover:bg-pink-100/70'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPillDesktop"
                      className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-500 rounded-full shadow-xs shadow-pink-600/30"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className={`relative z-10 ${isActive ? 'text-white' : ''}`}>{item.icon}</span>
                  <span className="relative z-10">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`relative z-10 ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold leading-none ${
                        isActive ? 'bg-white/25 text-white' : 'bg-pink-100 text-pink-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Interactive Music & Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="ambient-music-toggle"
              onClick={handleToggleMusic}
              title={isMusicPlaying ? 'Pause Romantic Music' : 'Play Romantic Music'}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border transition-all duration-200 cursor-pointer ${
                isMusicPlaying
                  ? 'bg-pink-100/90 border-pink-300 text-pink-800 shadow-xs'
                  : 'bg-pink-50/90 border-pink-200/90 text-stone-700 hover:border-pink-300 hover:bg-pink-100/80 hover:text-pink-950'
              }`}
            >
              {isMusicPlaying ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-600 animate-pulse flex-shrink-0" />
                  <span className="hidden sm:inline text-pink-700">Music Playing</span>
                  <span className="flex gap-0.5 items-end h-3">
                    <span className="w-0.5 h-3 bg-pink-500 animate-pulse"></span>
                    <span className="w-0.5 h-2 bg-rose-400 animate-pulse"></span>
                    <span className="w-0.5 h-3 bg-pink-600 animate-pulse"></span>
                  </span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-500 flex-shrink-0" />
                  <span className="text-[11px] sm:text-xs">Play Music</span>
                </>
              )}
            </button>

            {/* Lock Site with Secret Code button */}
            {onLockSite && (
              <button
                onClick={onLockSite}
                title="Lock site with secret code 'love'"
                className="flex items-center gap-1 px-2.5 py-1.5 sm:py-2 rounded-full text-xs font-medium border border-pink-200 bg-white/70 hover:bg-pink-100/80 text-stone-600 hover:text-pink-900 transition-colors cursor-pointer"
              >
                <Lock className="w-3 h-3 text-pink-600" />
                <span className="hidden sm:inline">Lock</span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile Navigation Scrollbar with Touch-Friendly Targets */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1.5 scrollbar-none border-t border-pink-200/60 -mx-3 px-3">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-medium whitespace-nowrap active:scale-95 transition-all cursor-pointer ${
                  isActive
                    ? 'text-white'
                    : 'bg-pink-50/90 text-stone-700 border border-pink-200/80 shadow-2xs'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPillMobile"
                    className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-500 rounded-full shadow-xs"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className={`relative z-10 ${isActive ? 'text-white' : ''}`}>{item.icon}</span>
                <span className="relative z-10">{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`relative z-10 text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
