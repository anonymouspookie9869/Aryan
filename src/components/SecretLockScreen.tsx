import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Lock, KeyRound, Sparkles, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { romanticAudio } from '../utils/romanticAudio';

interface SecretLockScreenProps {
  onUnlock: () => void;
  partnerName: string;
}

export const SecretLockScreen: React.FC<SecretLockScreenProps> = ({ onUnlock, partnerName }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto focus on desktop or mobile after mount
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = passcode.trim().toLowerCase();

    if (clean === 'love') {
      setIsUnlocking(true);
      setError(false);
      setErrorMessage('');

      // Play victory chime and heart sparkles
      romanticAudio.playUnlockSuccess();

      // Fire confetti and floating heart fireworks
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#fbcfe8', '#fda4af', '#fb7185'],
      });

      // Automatically start background music on successful unlock gesture
      try {
        romanticAudio.startAmbientMusic();
      } catch {}

      // Short delay for visual lock opening animation
      setTimeout(() => {
        onUnlock();
      }, 700);
    } else {
      setError(true);
      setErrorMessage(
        passcode.trim() === ''
          ? 'Please enter the secret code, my love!'
          : 'That is not the secret word, sweetheart! Try again 💕'
      );
      romanticAudio.playPop();

      // Clear shake after animation
      setTimeout(() => setError(false), 600);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#2a1320] via-[#3d1a2f] to-[#1e0d17] text-white overflow-y-auto selection:bg-pink-500 selection:text-white"
    >
      {/* Floating ambient glow lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-rose-600/25 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-purple-500/15 blur-3xl" />

        {/* Ambient floating gentle heart sparkles */}
        {[
          { left: '12%', top: '20%', size: 'w-4 h-4', delay: '0s' },
          { left: '85%', top: '25%', size: 'w-5 h-5', delay: '1.5s' },
          { left: '20%', top: '75%', size: 'w-3 h-3', delay: '2.5s' },
          { left: '78%', top: '70%', size: 'w-4 h-4', delay: '0.8s' },
        ].map((h, i) => (
          <div
            key={i}
            className={`absolute ${h.size} text-pink-400/30 animate-pulse`}
            style={{ left: h.left, top: h.top, animationDelay: h.delay, animationDuration: '3.5s' }}
          >
            <Heart className="w-full h-full fill-current" />
          </div>
        ))}
      </div>

      {/* Main Lock Box Card */}
      <motion.div
        animate={
          error
            ? { x: [-10, 10, -8, 8, -4, 4, 0] }
            : isUnlocking
            ? { scale: [1, 1.03, 0.98] }
            : {}
        }
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md my-auto bg-gradient-to-b from-[#3a1d30]/90 to-[#291322]/95 backdrop-blur-xl border border-pink-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-pink-950/60 text-center"
      >
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-200 text-xs font-medium mb-5">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>Private Love Celebration</span>
        </div>

        {/* Padlock Icon with Heart Center */}
        <div className="relative mx-auto w-20 h-20 mb-5 flex items-center justify-center">
          <motion.div
            animate={
              isUnlocking
                ? { scale: [1, 1.25, 1.1], rotate: [0, -10, 10, 0] }
                : { scale: [1, 1.05, 1] }
            }
            transition={{ duration: isUnlocking ? 0.6 : 3, repeat: isUnlocking ? 0 : Infinity }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-600/40 ring-4 ring-pink-400/20"
          >
            {isUnlocking ? (
              <Sparkles className="w-10 h-10 text-white animate-spin" style={{ animationDuration: '3s' }} />
            ) : (
              <Lock className="w-9 h-9 text-white" />
            )}
          </motion.div>
          {/* Subtle center heart over lock */}
          <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-white text-rose-600 flex items-center justify-center shadow-md">
            <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
          </div>
        </div>

        {/* Titles */}
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
          For {partnerName || 'Anmol'} Only
        </h2>
        <p className="text-pink-200/80 text-xs sm:text-sm leading-relaxed mb-6">
          This universe is locked with a secret word. Enter the 4-letter word that defines everything we share.
        </p>

        {/* Passcode Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              ref={inputRef}
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Enter secret code..."
              // Text size >= 16px to prevent mobile iOS zoom-in on focus
              className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-2xl bg-white/10 border border-pink-400/40 text-base sm:text-lg text-center font-medium tracking-wider text-white placeholder:text-pink-300/50 focus:outline-none focus:border-pink-400 focus:bg-white/15 focus:ring-2 focus:ring-pink-500/30 transition-all"
            />
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {errorMessage && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-rose-300 font-medium"
              >
                {errorMessage}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Unlock Action Button */}
          <button
            type="submit"
            disabled={isUnlocking}
            className="w-full py-3 sm:py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 hover:from-pink-500 hover:to-rose-400 active:scale-[0.98] text-white font-semibold text-sm sm:text-base tracking-wide shadow-lg shadow-pink-600/35 border border-pink-400/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-75"
          >
            {isUnlocking ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Unlocking Our World...</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 fill-white text-white" />
                <span>Open The Celebration</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        {/* Hint Accordion */}
        <div className="mt-5 pt-4 border-t border-pink-500/20">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="inline-flex items-center gap-1.5 text-xs text-pink-300/80 hover:text-pink-200 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showHint ? 'Hide Hint' : 'Need a secret hint?'}</span>
          </button>

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 text-xs text-pink-200/90 bg-white/5 rounded-xl p-3 border border-pink-400/20 leading-relaxed italic"
              >
                &quot;The 4-letter feeling that started our story on January 4th, keeps us together forever, and is typed as <strong className="text-pink-300 font-semibold not-italic">love</strong> 💕&quot;
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Safe footer note */}
        <div className="mt-4 flex items-center justify-center gap-1 text-[11px] text-pink-300/50">
          <ShieldCheck className="w-3 h-3" />
          <span>Made exclusively for Anmol by Shivam</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
