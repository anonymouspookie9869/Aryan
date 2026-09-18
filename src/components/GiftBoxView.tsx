import React, { useState } from 'react';
import { Gift, Sparkles, Heart, Music, Wand2, RefreshCw, Send, Plus, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LoveReason, PartnerInfo } from '../types';
import { romanticAudio } from '../utils/romanticAudio';

interface GiftBoxViewProps {
  partner: PartnerInfo;
  reasons: LoveReason[];
  onAddReason: (reason: string, category: string) => void;
}

export const GiftBoxView: React.FC<GiftBoxViewProps> = ({ partner, reasons, onAddReason }) => {
  // Gift Box State
  const [isBoxOpened, setIsBoxOpened] = useState(false);

  // Plucked Reason State
  const [currentReason, setCurrentReason] = useState<LoveReason | null>(null);
  const [newReasonInput, setNewReasonInput] = useState('');

  // AI Love Poem Generator State
  const [poemMood, setPoemMood] = useState('Soulmate & Deep Gratitude');
  const [customQualities, setCustomQualities] = useState('her radiant smile, gentle kindness, infectious laugh');
  const [generatedPoem, setGeneratedPoem] = useState<string | null>(null);
  const [isGeneratingPoem, setIsGeneratingPoem] = useState(false);

  // Open Gift Box
  const handleOpenGiftBox = () => {
    if (isBoxOpened) return;
    romanticAudio.playChime([523.25, 659.25, 783.99, 1046.50]);
    setIsBoxOpened(true);

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#a855f7', '#ec4899', '#f43f5e', '#fbbf24', '#ffffff']
    });
  };

  // Pluck a star from the jar
  const handlePluckReason = () => {
    romanticAudio.playChime([659.25, 880]);
    const randomIndex = Math.floor(Math.random() * reasons.length);
    setCurrentReason(reasons[randomIndex]);

    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#ec4899']
    });
  };

  // Generate Poem via Backend
  const handleGeneratePoem = async () => {
    setIsGeneratingPoem(true);
    romanticAudio.playChime([523.25, 783.99]);

    try {
      const res = await fetch('/api/generate-poem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          girlfriendName: partner.girlfriendName,
          mood: poemMood,
          qualities: customQualities
        })
      });
      const data = await res.json();
      if (data.poem) {
        setGeneratedPoem(data.poem);
      }
    } catch (e) {
      console.error(e);
      setGeneratedPoem(`To ${partner.girlfriendName},\n\nThe world grew brighter the moment you arrived,\nAnd in your laughter, my favorite memories thrived.\nYou bring a calm that stills the restless night,\nA gentle fire, an everlasting light.\n\nHappy Birthday, my love ❤️`);
    } finally {
      setIsGeneratingPoem(false);
    }
  };

  // Handle Add New Reason
  const handleAddNewReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReasonInput.trim()) return;
    onAddReason(newReasonInput.trim(), 'Personality');
    setNewReasonInput('');
    romanticAudio.playChime([523.25, 659.25]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      
      {/* SECTION 1: THE INTERACTIVE GIFT BOX */}
      <section className="mb-16">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-800 text-xs font-semibold mb-3 border border-pink-200">
            <Gift className="w-3.5 h-3.5 text-pink-600" />
            <span>A Birthday Present Just For You</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight">
            The Birthday Surprise Box
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-2">
            {!isBoxOpened
              ? "A sealed birthday box tied with satin ribbon. Tap the ribbon to untie and open it!"
              : "You opened the surprise! Explore your birthday dedications below:"}
          </p>
        </div>

        {/* 3D Gift Box Interactive Graphic */}
        <div className="max-w-md mx-auto text-center mb-10">
          {!isBoxOpened ? (
            <div
              onClick={handleOpenGiftBox}
              className="group cursor-pointer perspective select-none inline-block"
              title="Click to untie ribbon & open gift!"
            >
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto bg-gradient-to-tr from-pink-600 via-rose-500 to-pink-500 rounded-3xl shadow-2xl shadow-pink-500/20 group-hover:scale-105 group-hover:rotate-1 transition-all duration-300 flex items-center justify-center border-4 border-pink-300/60">
                
                {/* Horizontal Ribbon */}
                <div className="absolute inset-x-0 h-10 bg-amber-200/95 shadow-xs flex items-center justify-center">
                  <div className="w-full h-1 bg-amber-300"></div>
                </div>

                {/* Vertical Ribbon */}
                <div className="absolute inset-y-0 w-10 bg-amber-200/95 shadow-xs flex items-center justify-center">
                  <div className="h-full w-1 bg-amber-300"></div>
                </div>

                {/* Ribbon Bow on Top */}
                <div className="absolute -top-7 z-20 flex items-center justify-center">
                  <div className="relative flex items-center">
                    <div className="w-10 h-10 rounded-full border-4 border-amber-200 bg-amber-300 shadow-md transform -rotate-45"></div>
                    <div className="w-10 h-10 rounded-full border-4 border-amber-200 bg-amber-300 shadow-md transform rotate-45 -ml-4"></div>
                    <div className="absolute w-6 h-6 rounded-full bg-amber-400 border-2 border-white shadow-xs"></div>
                  </div>
                </div>

                {/* Gift Tag */}
                <div className="absolute bottom-4 right-4 bg-[#fff0f6]/95 px-3 py-1.5 rounded-lg shadow-md border border-pink-200 text-left transform rotate-6 group-hover:rotate-12 transition-transform">
                  <p className="text-[9px] uppercase tracking-wider text-pink-500 font-bold">To My Love</p>
                  <p className="font-handwriting text-base font-bold text-pink-600">{partner.girlfriendName}</p>
                </div>

                {/* Center Callout */}
                <div className="z-10 bg-[#fff0f6]/95 backdrop-blur-xs px-4 py-2 rounded-full shadow-lg border border-pink-200">
                  <p className="font-display text-xs font-bold text-pink-900">
                    Tap Ribbon to Open 🎁
                  </p>
                </div>

              </div>
            </div>
          ) : (
            // Opened Gift Box Celebration Content
            <div className="bg-[#fff0f6]/95 rounded-3xl p-6 sm:p-8 border-2 border-pink-200 shadow-xl shadow-pink-200/50 animate-fadeIn text-left">
              <div className="flex items-center gap-2 text-pink-600 font-semibold text-xs uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <span>Birthday Surprise Unlocked</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 mb-3">
                "You are my favorite melody, my peace, and my home."
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                Inside this box is a promise for another year of holding hands through every sunset, laughing till our sides hurt, and loving you unconditionally.
              </p>

              {/* Special Mixtape Dedicated Card */}
              <div className="bg-gradient-to-r from-stone-900 via-[#2d1b24] to-stone-900 rounded-2xl p-5 text-white flex items-center justify-between gap-4 mb-6 border border-pink-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/25 flex items-center justify-center text-pink-300">
                    <Music className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-pink-400 font-bold block">
                      Our Song Dedication
                    </span>
                    <h4 className="font-semibold text-sm sm:text-base text-white">
                      {partner.specialSongTitle}
                    </h4>
                    <p className="text-xs text-stone-400">By {partner.specialSongArtist}</p>
                  </div>
                </div>
                <span className="text-xs text-pink-300 bg-pink-950/70 px-2.5 py-1 rounded-full border border-pink-700/50">
                  On Repeat ❤️
                </span>
              </div>

              {/* AI Romantic Poem Section */}
              <div className="bg-pink-100/60 rounded-2xl p-5 border border-pink-200">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-pink-600" />
                    <h4 className="font-display font-bold text-stone-900 text-base">
                      Personalized Birthday Love Poem
                    </h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-200 text-pink-800 font-semibold">
                    AI Craft
                  </span>
                </div>

                <p className="text-stone-600 text-xs mb-3">
                  Request a newly composed poem written just for {partner.girlfriendName}:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Poetic Mood
                    </label>
                    <select
                      value={poemMood}
                      onChange={(e) => setPoemMood(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-pink-200 bg-pink-50/80 text-xs focus:outline-none focus:border-pink-500"
                    >
                      <option value="Soulmate & Deep Gratitude">Soulmate & Deep Gratitude</option>
                      <option value="Whimsical & Playful Romance">Whimsical & Playful Romance</option>
                      <option value="Passionate & Forever In Love">Passionate & Forever In Love</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Her Qualities to Highlight
                    </label>
                    <input
                      type="text"
                      value={customQualities}
                      onChange={(e) => setCustomQualities(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-pink-200 bg-pink-50/80 text-xs focus:outline-none focus:border-pink-500"
                      placeholder="e.g. her laugh, patience, eyes"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGeneratePoem}
                  disabled={isGeneratingPoem}
                  className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isGeneratingPoem ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Composing With Love...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Compose Custom Birthday Poem</span>
                    </>
                  )}
                </button>

                {generatedPoem && (
                  <div className="mt-4 p-4 bg-[#fff5f9] rounded-xl border border-pink-200 text-stone-800 text-sm leading-relaxed whitespace-pre-line font-serif animate-fadeIn">
                    {generatedPoem}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: THE 100 REASONS WISH JAR */}
      <section>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-800 text-xs font-semibold mb-3 border border-pink-200">
            <Sparkles className="w-3.5 h-3.5 text-pink-600" />
            <span>The Origami Wish Jar</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Reasons Why I Love You
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-2">
            Click the glowing star jar to pluck a folded note and reveal a reason why my heart belongs to you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#fff0f6]/95 rounded-3xl p-6 sm:p-10 border border-pink-200/90 shadow-md shadow-pink-200/50">
          
          {/* Visual Jar Graphic & Button */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative w-48 h-64 sm:w-56 sm:h-72 bg-gradient-to-b from-pink-50/90 to-rose-100/50 rounded-3xl border-4 border-pink-200/90 shadow-inner flex flex-col justify-between p-4 overflow-hidden mb-4">
              
              {/* Wooden Cork Lid */}
              <div className="absolute -top-1 inset-x-8 h-6 bg-stone-700 rounded-b-md shadow-md border-b-2 border-stone-800"></div>

              {/* Glowing Origami Stars floating inside */}
              <div className="h-full flex flex-wrap gap-2 items-center justify-center pt-8">
                {[...Array(14)].map((_, idx) => (
                  <span
                    key={idx}
                    className="text-2xl animate-float cursor-pointer hover:scale-125 transition-transform"
                    style={{ animationDuration: `${2 + (idx % 4)}s` }}
                  >
                    {idx % 3 === 0 ? '🌸' : idx % 3 === 1 ? '💖' : '✨'}
                  </span>
                ))}
              </div>

              {/* Jar Label */}
              <div className="bg-[#fff0f6]/95 rounded-xl p-2 border border-pink-200 shadow-xs z-10">
                <p className="font-handwriting text-lg font-bold text-pink-700">
                  {reasons.length} Reasons & Counting
                </p>
              </div>
            </div>

            <button
              onClick={handlePluckReason}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-semibold text-sm shadow-md shadow-pink-500/25 hover:shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-pink-100" />
              <span>Pluck A Glowing Note!</span>
            </button>
          </div>

          {/* Unfolded Star Result & Add Reason Form */}
          <div className="space-y-6">
            {currentReason ? (
              <div className="bg-pink-50/90 rounded-2xl p-6 border-2 border-pink-200 animate-fadeIn">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wider text-pink-800 font-bold bg-pink-200/80 px-2.5 py-0.5 rounded-full">
                    Reason #{currentReason.number}
                  </span>
                  <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                </div>
                <p className="font-handwriting text-2xl sm:text-3xl text-stone-900 leading-snug">
                  "{currentReason.reason}"
                </p>
                <div className="mt-4 pt-3 border-t border-pink-200/70 flex items-center justify-between text-xs text-pink-800">
                  <span>Category: {currentReason.category}</span>
                  <span className="font-medium">Plucked for you ❤️</span>
                </div>
              </div>
            ) : (
              <div className="bg-pink-50/40 rounded-2xl p-8 border border-dashed border-pink-300 text-center">
                <Sparkles className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <h4 className="font-display font-bold text-stone-800 text-base mb-1">
                  Ready to Pluck A Note?
                </h4>
                <p className="text-stone-500 text-xs sm:text-sm">
                  Click the button on the left to draw a sweet reason from the jar.
                </p>
              </div>
            )}

            {/* Quick Add Reason Input */}
            <form onSubmit={handleAddNewReason} className="bg-[#fff5f9] rounded-2xl p-4 border border-pink-200 shadow-2xs">
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Add another reason to the jar:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Because you always hold my hand in crowded places"
                  value={newReasonInput}
                  onChange={(e) => setNewReasonInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-pink-200 bg-pink-50/80 text-xs focus:outline-none focus:border-pink-500 focus:bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-semibold cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </form>

          </div>

        </div>
      </section>

    </div>
  );
};
