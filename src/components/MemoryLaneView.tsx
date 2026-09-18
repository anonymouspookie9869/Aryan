import React, { useState } from 'react';
import { Sparkles, MapPin, Calendar, Plus, Eye, EyeOff, Heart, MessageCircleHeart, X, Map as MapIcon, ListOrdered } from 'lucide-react';
import { MemoryMoment } from '../types';
import { romanticAudio } from '../utils/romanticAudio';
import { InteractiveMemoryMap } from './InteractiveMemoryMap';
import { RomanticPhotoImg } from './RomanticPhotoImg';

interface MemoryLaneViewProps {
  memories: MemoryMoment[];
  onAddMemory: (memory: Partial<MemoryMoment>) => void;
}

export const MemoryLaneView: React.FC<MemoryLaneViewProps> = ({ memories, onAddMemory }) => {
  const [viewMode, setViewMode] = useState<'map' | 'timeline'>('map');
  const [selectedChapter, setSelectedChapter] = useState<string>('All');
  const [revealedThoughts, setRevealedThoughts] = useState<Record<string, boolean>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Memory Form State
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState<MemoryMoment['chapter']>('Everyday Magic');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [story, setStory] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [emotionEmoji, setEmotionEmoji] = useState('💖');
  const [secretThought, setSecretThought] = useState('');

  const chapters = ['All', 'Beginning', 'Adventures', 'Everyday Magic', 'Unforgettable', 'Milestones'];

  const filteredMemories = selectedChapter === 'All'
    ? memories
    : memories.filter(m => m.chapter === selectedChapter);

  const toggleSecretThought = (id: string) => {
    romanticAudio.playChime([523.25, 783.99]);
    setRevealedThoughts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !story) return;

    onAddMemory({
      title,
      chapter,
      date: date || 'Recently',
      location: location || 'Together',
      lat: lat || 28.58 + (Math.random() - 0.5) * 0.25,
      lng: lng || 77.20 + (Math.random() - 0.5) * 0.25,
      story,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
      emotionEmoji: emotionEmoji || '💖',
      secretThought: secretThought || 'I was so happy to be right beside you.'
    });

    // Reset
    setTitle('');
    setDate('');
    setLocation('');
    setLat(undefined);
    setLng(undefined);
    setStory('');
    setPhotoUrl('');
    setSecretThought('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-800 text-xs font-semibold mb-3 border border-pink-200">
          <Sparkles className="w-3.5 h-3.5 text-pink-600" />
          <span>Our Love Story In Chapters & Locations</span>
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight">
          The Journey of Us
        </h2>
        <p className="text-stone-600 text-sm sm:text-base mt-2">
          Key moments, spontaneous getaways, and quiet evenings mapped across our beautiful journey together.
        </p>

        {/* View Mode Toggle & Add Memory Action */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {/* View Mode Switcher */}
          <div className="inline-flex p-1 rounded-full bg-pink-100/90 border border-pink-200/90 shadow-2xs">
            <button
              onClick={() => {
                setViewMode('map');
                romanticAudio.playHeartSpark();
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                viewMode === 'map'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                  : 'text-stone-700 hover:text-pink-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Interactive Love Map</span>
            </button>
            <button
              onClick={() => {
                setViewMode('timeline');
                romanticAudio.playHeartSpark();
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                viewMode === 'timeline'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                  : 'text-stone-700 hover:text-pink-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Story Timeline</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs sm:text-sm font-semibold shadow-xs shadow-pink-500/25 hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add A New Memory Moment</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'map' ? (
        <div className="mb-14">
          <InteractiveMemoryMap
            memories={memories}
            selectedChapter={selectedChapter}
            onSelectChapter={setSelectedChapter}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        </div>
      ) : (
        <div>
          {/* Chapter Filter Pills for Timeline View */}
          <div className="flex justify-center items-center gap-1.5 flex-wrap mb-12">
            {chapters.map(chap => (
              <button
                key={chap}
                onClick={() => setSelectedChapter(chap)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                  selectedChapter === chap
                    ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs shadow-pink-500/25'
                    : 'bg-pink-100/70 text-stone-700 border border-pink-200/80 hover:bg-pink-200/80 hover:text-pink-950'
                }`}
              >
                {chap}
              </button>
            ))}
          </div>

      {/* Chronological Timeline Container */}
      <div className="relative">
        {/* Timeline Center Line */}
        <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-pink-300 via-rose-300 to-pink-200"></div>

        <div className="space-y-12 sm:space-y-16">
          {filteredMemories.map((mem, index) => {
            const isEven = index % 2 === 0;
            const isThoughtRevealed = Boolean(revealedThoughts[mem.id]);

            return (
              <div
                key={mem.id}
                className={`relative flex flex-col md:flex-row items-center ${
                  isEven ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Timeline Center Node */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-pink-50 border-4 border-pink-400 items-center justify-center text-base z-10 shadow-md shadow-pink-200/60">
                  <span>{mem.emotionEmoji}</span>
                </div>

                {/* Content Box */}
                <div className="w-full md:w-1/2 px-0 md:px-8">
                  <div className="bg-[#fff0f6]/95 rounded-3xl p-6 sm:p-7 border border-pink-200/90 shadow-sm shadow-pink-200/40 hover:shadow-md hover:border-pink-300 hover:bg-[#ffebf3] transition-all">
                    
                    {/* Top Metadata */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200/80">
                        {mem.chapter}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-pink-500" />
                          {mem.date}
                        </span>
                        {mem.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-pink-400" />
                            {mem.location}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900 mb-3">
                      {mem.title}
                    </h3>

                    {/* Photo if present */}
                    {mem.photoUrl && (
                      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4 border border-pink-100 group">
                        <RomanticPhotoImg
                          src={mem.photoUrl}
                          alt={mem.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Story Narrative */}
                    <p className="text-stone-700 text-sm sm:text-base leading-relaxed mb-4">
                      {mem.story}
                    </p>

                    {/* Interactive Secret Thought Button */}
                    {mem.secretThought && (
                      <div className="mt-4 pt-3 border-t border-pink-100">
                        <button
                          onClick={() => toggleSecretThought(mem.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-pink-600 hover:text-pink-700 cursor-pointer"
                        >
                          {isThoughtRevealed ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Hide my secret thought</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>What I was secretly thinking at that moment 💭</span>
                            </>
                          )}
                        </button>

                        {isThoughtRevealed && (
                          <div className="mt-2.5 p-3.5 bg-pink-50/80 rounded-2xl border border-pink-200/80 animate-fadeIn">
                            <p className="text-xs uppercase tracking-wider text-pink-700 font-bold mb-1 flex items-center gap-1">
                              <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
                              <span>My Secret Thought:</span>
                            </p>
                            <p className="font-handwriting text-xl text-stone-800 leading-snug">
                              "{mem.secretThought}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>

                {/* Empty side for layout balance on desktop */}
                <div className="hidden md:block w-1/2"></div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
      )}

      {/* Add Memory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fff0f6] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-pink-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-pink-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display text-2xl font-bold text-stone-900 mb-1">
              Add A Special Memory
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm mb-5">
              Record a precious moment, road trip, or date you two shared.
            </p>

            <form onSubmit={handleCreateMemory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Memory Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stargazing on the hood of the car"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-pink-200 bg-pink-50/80 text-sm focus:outline-none focus:border-pink-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Chapter
                  </label>
                  <select
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-pink-500"
                  >
                    <option value="Beginning">Beginning</option>
                    <option value="Adventures">Adventures</option>
                    <option value="Everyday Magic">Everyday Magic</option>
                    <option value="Unforgettable">Unforgettable</option>
                    <option value="Milestones">Milestones</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Emotion Emoji
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={emotionEmoji}
                    onChange={(e) => setEmotionEmoji(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-pink-500 text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. June 14, 2024"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Location Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sunset Point, Whispering Hills"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Quick Romantic Location Suggestions */}
              <div>
                <span className="block text-[11px] font-semibold text-stone-500 mb-1.5">
                  Quick Location Inspiration (sets map pin automatically):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: 'Sunset Promenade', lat: 28.625, lng: 77.218 },
                    { name: 'Romantic Coffee Corner', lat: 28.614, lng: 77.209 },
                    { name: 'Midnight Highway Ride', lat: 28.459, lng: 77.026 },
                    { name: 'Street Food & Momos Spot', lat: 28.567, lng: 77.243 },
                    { name: 'Under The Starlit Sky', lat: 28.612, lng: 77.229 },
                  ].map((loc) => (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => {
                        setLocation(loc.name);
                        setLat(loc.lat);
                        setLng(loc.lng);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-pink-100/80 hover:bg-pink-200 text-[11px] text-pink-900 font-medium border border-pink-200/80 cursor-pointer transition-colors"
                    >
                      📍 {loc.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Story & Key Details *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe what happened, what made it unforgettable..."
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Photo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Your Secret Thought at that time (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. I knew right then that I wanted to spend my life with you."
                  value={secretThought}
                  onChange={(e) => setSecretThought(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-stone-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-semibold shadow-xs shadow-pink-500/25 cursor-pointer"
                >
                  Save Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
