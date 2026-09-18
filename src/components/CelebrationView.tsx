import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, Flame, Clock, Gift, Award, PartyPopper } from 'lucide-react';
import { PartnerInfo } from '../types';
import { romanticAudio } from '../utils/romanticAudio';

interface CelebrationViewProps {
  partner: PartnerInfo;
  onNavigateTab: (tab: 'celebrate' | 'memories' | 'gallery' | 'letters' | 'games' | 'gift') => void;
}

interface Balloon {
  id: number;
  color: string;
  left: number;
  speed: number;
  popped: boolean;
  message: string;
}

export const CelebrationView: React.FC<CelebrationViewProps> = ({ partner, onNavigateTab }) => {
  // Cake Type: defaults to 'fastfood' because Anmol loves fast food and dislikes sweets!
  const [cakeType, setCakeType] = useState<'fastfood' | 'cake'>('fastfood');

  // 5 Interactive Candles on the cake/burger tower
  const [candles, setCandles] = useState<boolean[]>([true, true, true, true, true]);
  const [allCandlesBlown, setAllCandlesBlown] = useState(false);
  const [showWishModal, setShowWishModal] = useState(false);
  const [balloons, setBalloons] = useState<Balloon[]>([
    { id: 1, color: 'bg-pink-400', left: 10, speed: 18, popped: false, message: "4 January: Woh pehli baat jisne meri duniya badal di ✨" },
    { id: 2, color: 'bg-rose-400', left: 25, speed: 22, popped: false, message: "13 February: Pehli baar saath ghumne gaye the 🌸" },
    { id: 3, color: 'bg-pink-500', left: 50, speed: 20, popped: false, message: "16 May: Jab hum officially relationship mein aaye 💑" },
    { id: 4, color: 'bg-fuchsia-400', left: 75, speed: 24, popped: false, message: "6 August: Pehli baar bike se ghumne nikle the 🏍️" },
    { id: 5, color: 'bg-pink-300', left: 90, speed: 19, popped: false, message: "19 September: Happy Birthday to Meri Anmol! Mitha no, fast food yes 🍔🎂" },
  ]);
  const [poppedMessage, setPoppedMessage] = useState<string | null>(null);

  // Time together calculator
  const [timeTogether, setTimeTogether] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Birthday countdown calculator for September 19th
  const [birthdayCountdown, setBirthdayCountdown] = useState({
    isToday: false,
    targetDay: 19,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateBirthday = () => {
      const now = new Date();
      const parts = partner.birthdayDate.split('-');
      const targetMonth = parts.length > 1 ? parseInt(parts[1], 10) - 1 : 8; // September is month 8 (0-indexed)
      const targetDay = parts.length > 2 ? parseInt(parts[2], 10) : 19;

      const isToday = now.getMonth() === targetMonth && now.getDate() === targetDay;

      let target = new Date(now.getFullYear(), targetMonth, targetDay, 0, 0, 0);
      if (now.getTime() > target.getTime() + 86400000 && !isToday) {
        target = new Date(now.getFullYear() + 1, targetMonth, targetDay, 0, 0, 0);
      }

      const diff = target.getTime() - now.getTime();
      if (diff <= 0 || isToday) {
        setBirthdayCountdown({ isToday: true, targetDay, days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setBirthdayCountdown({ isToday: false, targetDay, days, hours, minutes, seconds });
      }
    };

    calculateBirthday();
    const interval = setInterval(calculateBirthday, 1000);
    return () => clearInterval(interval);
  }, [partner.birthdayDate]);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      
      // Relationship anniversary: 16th May of this year
      let month = 4; // May (0-indexed: 4 is May)
      let day = 16;
      
      if (partner.anniversaryDate) {
        const parts = partner.anniversaryDate.split('-');
        if (parts.length === 3) {
          month = parseInt(parts[1], 10) - 1;
          day = parseInt(parts[2], 10);
        }
      }

      // If the anniversary date in this current year has passed, start from this year; otherwise from previous year
      let anniversaryYear = now.getFullYear();
      const anniversaryThisYear = new Date(now.getFullYear(), month, day, 0, 0, 0);
      if (now.getTime() < anniversaryThisYear.getTime()) {
        anniversaryYear = now.getFullYear() - 1;
      } else {
        anniversaryYear = now.getFullYear();
      }

      const start = new Date(anniversaryYear, month, day, 0, 0, 0).getTime();
      const diff = Math.max(0, now.getTime() - start);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeTogether({ days, hours, minutes, seconds });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [partner.anniversaryDate]);

  // Handle candle blow
  const blowCandle = (index: number) => {
    if (!candles[index]) return;
    romanticAudio.playBlowCandle();

    const newCandles = [...candles];
    newCandles[index] = false;
    setCandles(newCandles);

    // If all are now blown
    if (newCandles.every(c => !c)) {
      handleAllCandlesBlown();
    }
  };

  const blowAllCandles = () => {
    romanticAudio.playBlowCandle();
    setCandles([false, false, false, false, false]);
    handleAllCandlesBlown();
  };

  const handleAllCandlesBlown = () => {
    setAllCandlesBlown(true);
    romanticAudio.playBirthdayMelody();

    // Trigger grand confetti
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fb7185', '#fda4af', '#f59e0b', '#ec4899', '#ffffff']
    });

    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#e11d48', '#f43f5e', '#fbbf24']
      });
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#e11d48', '#f43f5e', '#fbbf24']
      });
    }, 400);

    setTimeout(() => {
      setShowWishModal(true);
    }, 1200);
  };

  const relightCandles = () => {
    romanticAudio.playChime();
    setCandles([true, true, true, true, true]);
    setAllCandlesBlown(false);
    setShowWishModal(false);
  };

  // Pop Balloon
  const handlePopBalloon = (id: number, message: string) => {
    romanticAudio.playPop();
    setPoppedMessage(message);

    confetti({
      particleCount: 30,
      spread: 40,
      origin: { y: 0.4 },
      colors: ['#f43f5e', '#fb7185', '#f59e0b']
    });

    setBalloons(prev => prev.map(b => b.id === id ? { ...b, popped: true } : b));

    setTimeout(() => {
      setPoppedMessage(null);
    }, 4000);
  };

  // Shower hearts effect
  const handleShowerHearts = () => {
    romanticAudio.playChime([659.25, 880, 1046.5]);
    confetti({
      particleCount: 60,
      spread: 100,
      origin: { y: 0.7 },
      shapes: ['circle'],
      colors: ['#f43f5e', '#ec4899', '#fda4af']
    });
  };

  return (
    <div className="relative overflow-hidden pb-20">
      
      {/* Floating Interactive Balloons Area */}
      <div className="max-w-6xl mx-auto px-4 pt-4 relative">
        <div className="flex justify-between items-center bg-pink-100/70 backdrop-blur-xs rounded-2xl p-3 sm:p-4 border border-pink-200 mb-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-pink-950 font-medium">
            <Sparkles className="w-4 h-4 text-pink-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span><strong>Birthday balloons:</strong> Tap any balloon to pop a sweet hidden note!</span>
          </div>
          <button
            onClick={handleShowerHearts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-semibold shadow-xs shadow-pink-500/25 cursor-pointer active:scale-95 transition-all"
          >
            <Heart className="w-3.5 h-3.5 fill-white" />
            <span>Send Love Sparks</span>
          </button>
        </div>

        {/* Popped Message Notification Toast */}
        {poppedMessage && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-stone-900/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce border border-rose-300/30">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            <p className="font-handwriting text-xl text-rose-200 tracking-wide font-bold">{poppedMessage}</p>
          </div>
        )}

        {/* Interactive Balloon Row */}
        <div className="flex justify-around items-end h-28 sm:h-32 mb-4 px-2">
          {balloons.map((b) => (
            <div key={b.id} className="relative group flex flex-col items-center">
              {!b.popped ? (
                <button
                  onClick={() => handlePopBalloon(b.id, b.message)}
                  className="cursor-pointer focus:outline-none transition-transform hover:scale-110 active:scale-90"
                  title="Click to pop balloon!"
                >
                  {/* Balloon Body */}
                  <div className={`w-12 h-16 sm:w-16 sm:h-20 rounded-full ${b.color} shadow-md relative flex items-center justify-center animate-float`} style={{ animationDuration: `${3 + b.id}s` }}>
                    <div className="absolute top-2 left-2 w-3 h-5 bg-white/40 rounded-full blur-[0.5px] transform -rotate-45"></div>
                    <Heart className="w-4 h-4 text-white/80 fill-white/40" />
                    {/* Balloon Knot */}
                    <div className={`absolute -bottom-1.5 w-2 h-2 ${b.color} rotate-45`}></div>
                  </div>
                  {/* Balloon String */}
                  <div className="w-[1px] h-10 sm:h-12 bg-stone-300 mx-auto -mt-0.5"></div>
                </button>
              ) : (
                <div className="h-28 flex flex-col items-center justify-center text-xs text-rose-500 font-medium">
                  <Heart className="w-4 h-4 fill-rose-400 text-rose-400 animate-ping" />
                  <span className="text-[10px] text-stone-400 mt-1">Popped!</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hero Birthday Greeting */}
      <section className="max-w-4xl mx-auto px-4 text-center mb-12 sm:mb-16">
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-900 text-xs sm:text-sm font-semibold mb-4 border border-pink-200/90 shadow-xs">
          <PartyPopper className="w-4 h-4 text-pink-600" />
          <span>Birthday Celebration • September 19th</span>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-pink-400"></span>
          <span className="text-pink-700 font-bold">
            {birthdayCountdown.isToday
              ? "🎉 It's Anmol's Birthday Today!"
              : `🎂 ${birthdayCountdown.days} Day${birthdayCountdown.days === 1 ? '' : 's'} to Go!`}
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold text-stone-900 tracking-tight mb-4">
          Happy Birthday, <br />
          <span className="text-pink-600 italic font-cormorant">{partner.girlfriendName}</span>
        </h1>

        <p className="font-sans-clean text-stone-700 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed mb-6">
          {partner.heroTagline}
        </p>

        {/* September 19th Birthday Status Card */}
        <div className="max-w-xl mx-auto mb-8 p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-pink-100/70 border border-pink-200/90 shadow-xs flex items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
              Sep 19
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-pink-700">
                {birthdayCountdown.isToday ? "Today is the Big Day!" : "Official Birthday Date"}
              </p>
              <p className="text-sm font-semibold text-stone-900">
                {birthdayCountdown.isToday
                  ? "Happy September 19th to the love of my life, Anmol! 💖"
                  : `September 19th • In ${birthdayCountdown.days}d ${birthdayCountdown.hours}h ${birthdayCountdown.minutes}m`}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-pink-700 bg-pink-100/90 px-3 py-1 rounded-full border border-pink-200 shadow-2xs whitespace-nowrap">
            {birthdayCountdown.isToday ? "Celebrate Now 🎂" : "Celebration Ready ✨"}
          </span>
        </div>

        {/* Live Together Timer */}
        <div className="bg-[#fff0f6]/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-pink-200 shadow-sm shadow-pink-200/50 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-pink-600 font-semibold text-xs sm:text-sm uppercase tracking-wider mb-4">
            <Clock className="w-4 h-4 text-pink-500" />
            <span>Every Single Second Loving You Since 16th May</span>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
            <div className="bg-pink-100/60 rounded-2xl p-3 sm:p-4 border border-pink-200/80">
              <span className="block font-display text-2xl sm:text-4xl font-bold text-stone-900">
                {timeTogether.days}
              </span>
              <span className="text-[11px] sm:text-xs text-stone-600 font-medium">Days</span>
            </div>
            <div className="bg-pink-100/60 rounded-2xl p-3 sm:p-4 border border-pink-200/80">
              <span className="block font-display text-2xl sm:text-4xl font-bold text-stone-900">
                {timeTogether.hours}
              </span>
              <span className="text-[11px] sm:text-xs text-stone-600 font-medium">Hours</span>
            </div>
            <div className="bg-pink-100/60 rounded-2xl p-3 sm:p-4 border border-pink-200/80">
              <span className="block font-display text-2xl sm:text-4xl font-bold text-stone-900">
                {timeTogether.minutes}
              </span>
              <span className="text-[11px] sm:text-xs text-stone-600 font-medium">Minutes</span>
            </div>
            <div className="bg-pink-100/60 rounded-2xl p-3 sm:p-4 border border-pink-200/80">
              <span className="block font-display text-2xl sm:text-4xl font-bold text-pink-600">
                {timeTogether.seconds}
              </span>
              <span className="text-[11px] sm:text-xs text-pink-700 font-medium">Seconds</span>
            </div>
          </div>

          <p className="font-handwriting text-xl sm:text-2xl text-pink-900/80 mt-4">
            "And I would choose you in every single lifetime."
          </p>
        </div>
      </section>

      {/* Interactive Birthday Cake / Fast Food Tower Section */}
      <section className="max-w-4xl mx-auto px-4 mb-16 sm:mb-20">
        <div className="bg-gradient-to-b from-pink-100/70 via-[#ffeef6] to-pink-100/50 rounded-3xl p-6 sm:p-10 border border-pink-200 shadow-md text-center relative">
          
          <div className="mb-4">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
              Make A Birthday Wish! 🎂✨
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-1">
              Click the candles to blow them out, or click the magic button below!
            </p>
          </div>

          {/* Sweet vs Fast Food Mode Toggle */}
          <div className="inline-flex p-1 bg-pink-100/80 rounded-2xl mb-6 shadow-inner border border-pink-200/60">
            <button
              onClick={() => setCakeType('fastfood')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                cakeType === 'fastfood'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-sm'
                  : 'text-stone-700 hover:text-pink-900'
              }`}
            >
              <span>🍔🍟 Anmol's Fast Food Birthday Tower</span>
            </button>
            <button
              onClick={() => setCakeType('cake')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                cakeType === 'cake'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-sm'
                  : 'text-stone-700 hover:text-pink-900'
              }`}
            >
              <span>🎂 Traditional Cake</span>
            </button>
          </div>

          {cakeType === 'fastfood' ? (
            /* Special Fast Food Tower for Anmol */
            <div className="mb-2">
              <div className="inline-block px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold mb-4">
                🍟 Anmol Special: Kyunki Anmol ko mitha nahi, Fast Food pasand hai! 🍔
              </div>

              <div className="relative w-72 sm:w-84 mx-auto my-4 flex flex-col items-center select-none">
                {/* Candles Row on top of Burger */}
                <div className="flex justify-center items-end gap-3 sm:gap-5 mb-1 z-20">
                  {candles.map((isLit, idx) => (
                    <div
                      key={idx}
                      onClick={() => blowCandle(idx)}
                      className="flex flex-col items-center cursor-pointer group"
                      title={isLit ? "Click to blow out candle!" : "Candle is blown out"}
                    >
                      {/* Flame or Smoke */}
                      <div className="h-8 flex items-end justify-center mb-0.5">
                        {isLit ? (
                          <div className="w-3.5 h-6 bg-gradient-to-t from-amber-500 via-orange-400 to-yellow-200 rounded-full animate-flame group-hover:scale-125 transition-transform shadow-lg shadow-amber-400/50"></div>
                        ) : (
                          <div className="w-1.5 h-4 bg-stone-400/60 rounded-full animate-pulse-soft blur-[0.5px]"></div>
                        )}
                      </div>
                      <div className="w-0.5 h-2 bg-stone-700"></div>
                      <div className={`w-3.5 sm:w-4 h-12 rounded-t-sm shadow-xs ${
                        idx % 2 === 0 ? 'bg-gradient-to-b from-amber-400 to-orange-500' : 'bg-gradient-to-b from-rose-400 to-red-500'
                      } border-x border-t border-white/50 relative overflow-hidden`}>
                        <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,white_4px,white_8px)]"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Burger Top Bun with Sesame Seeds */}
                <div className="w-52 sm:w-64 h-16 bg-gradient-to-b from-amber-600 via-amber-500 to-amber-600 rounded-t-full shadow-md relative flex items-center justify-center border-t-2 border-amber-300">
                  {/* Sesame seeds */}
                  <div className="absolute inset-x-6 top-3 flex justify-around opacity-90">
                    <span className="w-1.5 h-2 bg-amber-100 rounded-full rotate-12"></span>
                    <span className="w-1.5 h-2 bg-amber-100 rounded-full -rotate-12"></span>
                    <span className="w-1.5 h-2 bg-amber-100 rounded-full rotate-45"></span>
                    <span className="w-1.5 h-2 bg-amber-100 rounded-full -rotate-30"></span>
                    <span className="w-1.5 h-2 bg-amber-100 rounded-full rotate-12"></span>
                  </div>
                  <span className="font-handwriting text-xl sm:text-2xl font-bold text-amber-100 tracking-wider mt-4">
                    Happy Birthday Anmol!
                  </span>
                </div>

                {/* Melted Cheese Layer */}
                <div className="w-56 sm:w-68 h-5 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 relative shadow-xs">
                  <div className="absolute -bottom-2 left-6 w-4 h-3 bg-yellow-400 rounded-b-full"></div>
                  <div className="absolute -bottom-3 left-20 w-5 h-4 bg-yellow-400 rounded-b-full"></div>
                  <div className="absolute -bottom-2 right-12 w-4 h-3 bg-yellow-400 rounded-b-full"></div>
                </div>

                {/* Sizzling Patty Layer */}
                <div className="w-56 sm:w-68 h-7 bg-gradient-to-r from-stone-800 via-amber-950 to-stone-800 rounded-md shadow-inner flex items-center justify-center">
                  <span className="text-[10px] font-bold tracking-widest text-amber-200 uppercase">
                    Crispy & Loaded With Love
                  </span>
                </div>

                {/* Fresh Lettuce & Tomato Layer */}
                <div className="w-58 sm:w-70 h-4 bg-emerald-500 rounded-md relative flex items-center justify-between px-3">
                  <div className="w-8 h-2 bg-red-500 rounded-full"></div>
                  <div className="w-12 h-2 bg-red-500 rounded-full"></div>
                  <div className="w-8 h-2 bg-red-500 rounded-full"></div>
                </div>

                {/* Burger Bottom Bun */}
                <div className="w-52 sm:w-64 h-10 bg-gradient-to-b from-amber-500 to-amber-700 rounded-b-2xl shadow-sm"></div>

                {/* Pizza Crust Stand with Fries */}
                <div className="w-72 sm:w-88 h-7 bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 rounded-full shadow-lg mt-1 relative flex items-center justify-center border-t border-amber-300">
                  <span className="text-[11px] font-bold text-amber-100 tracking-wider uppercase">
                    🍕 Pizza Base & Crispy French Fries Platter 🍟
                  </span>
                </div>

                {/* Stand Base */}
                <div className="w-32 sm:w-40 h-3 bg-stone-300 rounded-b-xl shadow-xs"></div>
              </div>
            </div>
          ) : (
            /* Traditional Cake */
            <div className="relative w-64 sm:w-80 mx-auto my-6 flex flex-col items-center select-none">
              {/* Candles Row */}
              <div className="flex justify-center items-end gap-3 sm:gap-5 mb-1 z-10">
                {candles.map((isLit, idx) => (
                  <div
                    key={idx}
                    onClick={() => blowCandle(idx)}
                    className="flex flex-col items-center cursor-pointer group"
                    title={isLit ? "Click to blow out candle!" : "Candle is blown out"}
                  >
                    {/* Flame or Smoke */}
                    <div className="h-8 flex items-end justify-center mb-0.5">
                      {isLit ? (
                        <div className="w-3.5 h-6 bg-gradient-to-t from-amber-500 via-orange-400 to-yellow-200 rounded-full animate-flame group-hover:scale-125 transition-transform shadow-lg shadow-amber-400/50"></div>
                      ) : (
                        <div className="w-1.5 h-4 bg-stone-400/60 rounded-full animate-pulse-soft blur-[0.5px]"></div>
                      )}
                    </div>
                    <div className="w-0.5 h-2 bg-stone-700"></div>
                    <div className={`w-3.5 sm:w-4 h-12 rounded-t-sm shadow-xs ${
                      idx % 2 === 0 ? 'bg-gradient-to-b from-rose-300 to-rose-400' : 'bg-gradient-to-b from-amber-200 to-amber-300'
                    } border-x border-t border-white/50 relative overflow-hidden`}>
                      <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,white_4px,white_8px)]"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cake Top Layer */}
              <div className="w-48 sm:w-60 h-16 bg-gradient-to-r from-rose-200 via-pink-100 to-rose-200 rounded-t-3xl border-t-4 border-rose-300 shadow-inner relative flex items-center justify-center">
                <div className="absolute -bottom-2 inset-x-0 flex justify-around">
                  <span className="w-5 h-4 bg-pink-100 rounded-b-full"></span>
                  <span className="w-6 h-5 bg-pink-100 rounded-b-full"></span>
                  <span className="w-5 h-4 bg-pink-100 rounded-b-full"></span>
                  <span className="w-7 h-5 bg-pink-100 rounded-b-full"></span>
                  <span className="w-5 h-4 bg-pink-100 rounded-b-full"></span>
                </div>
                <span className="font-handwriting text-2xl font-bold text-rose-700 tracking-wide">
                  Happy Birthday Anmol
                </span>
              </div>

              {/* Cake Bottom Layer */}
              <div className="w-64 sm:w-80 h-24 bg-gradient-to-r from-rose-300 via-rose-200 to-rose-300 rounded-b-3xl border-b-4 border-rose-400/60 shadow-lg relative flex items-center justify-center">
                <div className="absolute top-2 inset-x-4 flex justify-between px-2">
                  {[...Array(9)].map((_, i) => (
                    <span key={i} className="w-2.5 h-2.5 rounded-full bg-white/90 shadow-xs"></span>
                  ))}
                </div>
                <div className="font-display font-bold text-white/90 tracking-widest text-sm uppercase">
                  Forever In Love
                </div>
              </div>

              {/* Cake Plate Stand */}
              <div className="w-72 sm:w-92 h-3.5 bg-gradient-to-r from-stone-200 via-white to-stone-200 rounded-full shadow-md mt-1 border-t border-white"></div>
              <div className="w-28 sm:w-36 h-3 bg-stone-300 rounded-b-xl shadow-xs"></div>
            </div>
          )}

          {/* Action Buttons for Cake */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {!allCandlesBlown ? (
              <button
                id="blow-all-candles-btn"
                onClick={blowAllCandles}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 hover:from-pink-700 hover:to-rose-600 text-white font-semibold text-sm sm:text-base shadow-md shadow-pink-500/25 hover:shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <Flame className="w-5 h-5 text-amber-300" />
                <span>Blow Out All Candles & Make A Wish!</span>
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2 text-pink-600 font-semibold text-sm sm:text-base">
                  <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
                  <span>Your birthday wish has been released to the universe! ✨</span>
                </div>
                <button
                  onClick={relightCandles}
                  className="px-4 py-2 rounded-full border border-pink-300 bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-semibold shadow-2xs cursor-pointer"
                >
                  Relight Candles 🕯️
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Birthday Wish Modal */}
      {showWishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fff0f6] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-pink-200 shadow-2xl text-center relative">
            <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4 text-pink-600">
              <Award className="w-8 h-8 text-pink-600" />
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
              May All Your Wishes Come True, Anmol! 🌟
            </h3>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6">
              Meri pyaari Anmol, you deserve all the joy in the universe, endless crispy fries, cheesy burgers, long peaceful bike rides, and a lifetime filled with laughter and unconditional love.
            </p>

            <div className="bg-pink-100/70 rounded-2xl p-4 border border-pink-200 mb-6 text-left">
              <p className="text-xs uppercase tracking-wider text-pink-600 font-bold mb-1">
                A Birthday Promise From {partner.clientName}
              </p>
              <p className="font-handwriting text-xl text-stone-800 leading-snug">
                "From our first conversation on 4th January to 16th May and that unforgettable 6th August bike ride, loving you has been the best decision of my life. Happy Birthday my queen!"
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWishModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-pink-100 hover:bg-pink-200 text-stone-700 font-semibold text-sm transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowWishModal(false);
                  onNavigateTab('gallery');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-semibold text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>View Our Photos</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Birthday Features Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
            Created Specially For You
          </h3>
          <p className="text-stone-600 text-sm mt-1">
            Explore every chapter, memory, and surprise waiting inside:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1: Photos */}
          <div
            onClick={() => onNavigateTab('gallery')}
            className="group bg-[#fff0f6]/95 rounded-2xl p-5 border border-pink-200/90 shadow-xs hover:shadow-md hover:border-pink-300 hover:bg-pink-100/50 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 mb-4 group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6 fill-pink-500 text-pink-500" />
            </div>
            <h4 className="font-display font-bold text-lg text-stone-900 group-hover:text-pink-600 transition-colors">
              Photo Vault & Polaroids
            </h4>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 leading-relaxed">
              Draggable polaroid snapshots, interactive slideshows, and our favorite moments together.
            </p>
          </div>

          {/* Card 2: Memory Timeline */}
          <div
            onClick={() => onNavigateTab('memories')}
            className="group bg-[#fff0f6]/95 rounded-2xl p-5 border border-pink-200/90 shadow-xs hover:shadow-md hover:border-pink-300 hover:bg-pink-100/50 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-pink-500" />
            </div>
            <h4 className="font-display font-bold text-lg text-stone-900 group-hover:text-pink-600 transition-colors">
              Our Journey Timeline
            </h4>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 leading-relaxed">
              From our first glance to midnight road trips and every sweet milestone.
            </p>
          </div>

          {/* Card 3: Love Letters */}
          <div
            onClick={() => onNavigateTab('letters')}
            className="group bg-[#fff0f6]/95 rounded-2xl p-5 border border-pink-200/90 shadow-xs hover:shadow-md hover:border-pink-300 hover:bg-pink-100/50 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 mb-4 group-hover:scale-110 transition-transform">
              <PartyPopper className="w-6 h-6 text-pink-500" />
            </div>
            <h4 className="font-display font-bold text-lg text-stone-900 group-hover:text-pink-600 transition-colors">
              "Open When..." Letters
            </h4>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 leading-relaxed">
              Wax-sealed envelopes and scratch-off love coupons waiting to be revealed.
            </p>
          </div>

          {/* Card 4: Gift Box */}
          <div
            onClick={() => onNavigateTab('gift')}
            className="group bg-[#fff0f6]/95 rounded-2xl p-5 border border-pink-200/90 shadow-xs hover:shadow-md hover:border-pink-300 hover:bg-pink-100/50 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 mb-4 group-hover:scale-110 transition-transform">
              <Gift className="w-6 h-6 text-pink-500" />
            </div>
            <h4 className="font-display font-bold text-lg text-stone-900 group-hover:text-pink-600 transition-colors">
              Gift Box & 100 Reasons
            </h4>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 leading-relaxed">
              Untie the interactive ribbon and pluck glowing origami stars with reasons why I love you.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};
