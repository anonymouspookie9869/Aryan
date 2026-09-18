import React, { useState } from 'react';
import { Heart, ChevronLeft, ChevronRight, Play, Pause, Maximize2, X, Plus, Filter, Sparkles, MapPin, Calendar, Layers, Grid, SlidersHorizontal } from 'lucide-react';
import { PhotoItem } from '../types';
import { romanticAudio } from '../utils/romanticAudio';
import { RomanticPhotoImg } from './RomanticPhotoImg';

interface PhotoGalleryViewProps {
  photos: PhotoItem[];
  onToggleFavorite: (id: string) => void;
}

type ViewMode = 'polaroid' | 'slideshow' | 'masonry';

export const PhotoGalleryView: React.FC<PhotoGalleryViewProps> = ({
  photos,
  onToggleFavorite,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('polaroid');
  const [selectedChapter, setSelectedChapter] = useState<string>('All');
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoItem | null>(null);

  // Filtered photos
  const filteredPhotos = photos.filter(p => {
    if (favoritesOnly && !p.isFavorite) return false;
    if (selectedChapter !== 'All' && p.chapter !== selectedChapter) return false;
    return true;
  });

  const chapters = ['All', 'Beginning', 'Adventures', 'Everyday Magic', 'Unforgettable', 'Milestones'];

  // Toggle card flip (Polaroid back)
  const handleFlipCard = (id: string) => {
    romanticAudio.playChime([523.25, 659.25]);
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Slideshow navigation
  const nextSlide = () => {
    romanticAudio.playChime([440, 554.37]);
    setActiveSlideIndex(prev => (prev + 1) % (filteredPhotos.length || 1));
  };

  const prevSlide = () => {
    romanticAudio.playChime([554.37, 440]);
    setActiveSlideIndex(prev => (prev - 1 + filteredPhotos.length) % (filteredPhotos.length || 1));
  };

  // Auto-play interval
  React.useEffect(() => {
    let timer: number;
    if (isAutoPlaying && filteredPhotos.length > 0) {
      timer = window.setInterval(() => {
        setActiveSlideIndex(prev => (prev + 1) % filteredPhotos.length);
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, filteredPhotos.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      
      {/* Header with Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-pink-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-pink-600 mb-1">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span>Treasured Snapshots ({photos.length} Photos)</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-900">
            Our Polaroid & Memory Vault
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-1">
            Every snapshot has a story. Click on any polaroid to flip it and read the love note behind it!
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-[#fff0f6] border border-pink-200 rounded-full p-1 shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode('polaroid')}
            title="Polaroid Scrapbook Mode"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
              viewMode === 'polaroid' ? 'bg-pink-200/80 text-pink-900 font-semibold shadow-2xs' : 'text-stone-600 hover:text-pink-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Polaroids</span>
          </button>
          <button
            onClick={() => setViewMode('slideshow')}
            title="Cinema Slideshow Mode"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
              viewMode === 'slideshow' ? 'bg-pink-200/80 text-pink-900 font-semibold shadow-2xs' : 'text-stone-600 hover:text-pink-900'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cinema</span>
          </button>
          <button
            onClick={() => setViewMode('masonry')}
            title="Gallery Grid Mode"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
              viewMode === 'masonry' ? 'bg-pink-200/80 text-pink-900 font-semibold shadow-2xs' : 'text-stone-600 hover:text-pink-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>
        </div>
      </div>

      {/* Filter Row: Chapters & Favorites */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8 bg-[#fff0f6]/95 backdrop-blur-xs p-3 rounded-2xl border border-pink-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <Filter className="w-4 h-4 text-pink-400 mr-1 flex-shrink-0" />
          {chapters.map(chapter => (
            <button
              key={chapter}
              onClick={() => setSelectedChapter(chapter)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors cursor-pointer ${
                selectedChapter === chapter
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white font-medium shadow-xs shadow-pink-500/25'
                  : 'bg-pink-100/70 hover:bg-pink-200/80 text-stone-700 border border-pink-200/60'
              }`}
            >
              {chapter}
            </button>
          ))}
        </div>

        <button
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
            favoritesOnly
              ? 'bg-pink-500 border-pink-500 text-white shadow-xs shadow-pink-500/25'
              : 'border-pink-200 bg-pink-50 text-stone-700 hover:border-pink-300 hover:bg-pink-100'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-white text-white' : 'text-pink-500'}`} />
          <span>Favorites Only</span>
        </button>
      </div>

      {/* Empty State */}
      {filteredPhotos.length === 0 && (
        <div className="text-center py-16 bg-[#fff0f6]/95 rounded-3xl border border-pink-200 p-8 shadow-xs">
          <Heart className="w-12 h-12 text-pink-300 mx-auto mb-3" />
          <h3 className="font-display text-xl font-bold text-stone-900">No photos found in this filter</h3>
          <p className="text-stone-500 text-sm mt-1">Try resetting the filter to explore all our sweet moments together!</p>
          <button
            onClick={() => { setSelectedChapter('All'); setFavoritesOnly(false); }}
            className="mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 text-white text-xs font-semibold cursor-pointer shadow-xs shadow-pink-500/25"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* VIEW 1: POLAROID SCRAPBOOK MODE */}
      {viewMode === 'polaroid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 pt-4">
          {filteredPhotos.map((photo, index) => {
            const isFlipped = Boolean(flippedCards[photo.id]);
            // Subtle vintage tilt angles based on index
            const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', '-rotate-3', 'rotate-3'];
            const rotationClass = rotations[index % rotations.length];

            return (
              <div
                key={photo.id}
                className={`relative group perspective transition-all duration-300 transform hover:scale-[1.03] hover:z-20 ${rotationClass}`}
              >
                {/* Washi Masking Tape Sticker on top corner */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-pink-200/80 backdrop-blur-xs border border-pink-300/60 rotate-2 z-30 shadow-2xs pointer-events-none"></div>

                {/* Flip Card Container */}
                <div
                  onClick={() => handleFlipCard(photo.id)}
                  className="bg-[#fff5f8] rounded-md p-3.5 pb-5 shadow-md hover:shadow-xl border border-pink-200/90 cursor-pointer min-h-[380px] flex flex-col justify-between transition-all"
                >
                  {!isFlipped ? (
                    // FRONT OF POLAROID
                    <div className="flex flex-col h-full justify-between">
                      <div className="relative aspect-[4/4.5] overflow-hidden rounded-xs bg-pink-100/50 border border-pink-200/60 mb-3 group/img">
                        <RomanticPhotoImg
                          src={photo.url}
                          fallbackSrc={photo.fallbackUrl}
                          photoIndex={photo.photoIndex}
                          alt={photo.caption}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {/* Quick Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(photo.id);
                          }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-pink-50/90 backdrop-blur-xs flex items-center justify-center text-pink-600 hover:bg-pink-100 shadow-xs transition-transform active:scale-90"
                          title="Like this memory"
                        >
                          <Heart className={`w-4 h-4 ${photo.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
                        </button>
                        {/* Expand Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxPhoto(photo);
                          }}
                          className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-stone-900/60 backdrop-blur-xs flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                          title="View High-Res"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Polaroid Caption Area */}
                      <div>
                        <p className="font-handwriting text-xl text-stone-800 leading-snug line-clamp-2">
                          "{photo.caption}"
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2 pt-2 border-t border-stone-100">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3 h-3 text-rose-400" />
                            {photo.date || 'Sweet Memory'}
                          </span>
                          <span className="text-rose-600 font-handwriting text-sm">
                            Click to flip ↷
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // BACK OF POLAROID (Secret Handwritten Love Note)
                    <div className="h-full flex flex-col justify-between bg-amber-50/40 p-3 rounded-xs border border-dashed border-amber-200">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-amber-200/50 mb-3">
                          <span className="text-[11px] uppercase tracking-wider text-rose-600 font-bold">
                            Behind This Moment
                          </span>
                          <Heart className="w-4 h-4 text-rose-400 fill-rose-200" />
                        </div>

                        <p className="font-handwriting text-2xl text-stone-800 leading-relaxed">
                          {photo.notes || "Every moment captured with you becomes my favorite memory in the world."}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-amber-200/40 flex items-center justify-between text-xs text-stone-500">
                        {photo.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-600" />
                            {photo.location}
                          </span>
                        )}
                        <span className="text-rose-600 font-handwriting text-sm ml-auto">
                          Click to flip back ↶
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: CINEMA SLIDESHOW MODE */}
      {viewMode === 'slideshow' && filteredPhotos.length > 0 && (
        <div className="max-w-4xl mx-auto bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800 relative">
          {/* Main Slide Image */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-stone-950 flex items-center justify-center overflow-hidden">
            <RomanticPhotoImg
              src={filteredPhotos[activeSlideIndex]?.url}
              fallbackSrc={filteredPhotos[activeSlideIndex]?.fallbackUrl}
              photoIndex={filteredPhotos[activeSlideIndex]?.photoIndex}
              alt={filteredPhotos[activeSlideIndex]?.caption}
              className="max-h-full max-w-full object-contain transition-all duration-700"
            />

            {/* Floating Navigation Controls */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs flex items-center justify-center cursor-pointer transition-all active:scale-95"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs flex items-center justify-center cursor-pointer transition-all active:scale-95"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Slide Index Badge */}
            <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-xs">
              {activeSlideIndex + 1} / {filteredPhotos.length}
            </div>

            {/* Heart Favorite in Slideshow */}
            <button
              onClick={() => onToggleFavorite(filteredPhotos[activeSlideIndex]?.id)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-rose-400 hover:text-rose-500 backdrop-blur-xs flex items-center justify-center cursor-pointer"
            >
              <Heart className={`w-5 h-5 ${filteredPhotos[activeSlideIndex]?.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Bottom Bar: Caption & Controls */}
          <div className="p-6 bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-handwriting text-2xl text-rose-200 mb-1">
                "{filteredPhotos[activeSlideIndex]?.caption}"
              </p>
              <div className="flex items-center gap-3 text-xs text-stone-400">
                <span>{filteredPhotos[activeSlideIndex]?.date}</span>
                {filteredPhotos[activeSlideIndex]?.location && (
                  <>
                    <span>•</span>
                    <span>{filteredPhotos[activeSlideIndex]?.location}</span>
                  </>
                )}
                <span>•</span>
                <span className="text-rose-400">{filteredPhotos[activeSlideIndex]?.chapter}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                  isAutoPlaying ? 'bg-rose-600 text-white' : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                }`}
              >
                {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isAutoPlaying ? 'Pause Slideshow' : 'Auto Play'}</span>
              </button>
            </div>
          </div>

          {/* Thumbnails Row */}
          <div className="flex gap-2 p-4 bg-stone-950 overflow-x-auto scrollbar-none border-t border-stone-800/80">
            {filteredPhotos.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setActiveSlideIndex(idx)}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === activeSlideIndex ? 'border-rose-500 scale-105 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                }`}
              >
                <RomanticPhotoImg
                  src={p.url}
                  fallbackSrc={p.fallbackUrl}
                  photoIndex={p.photoIndex}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: MASONRY GRID MODE */}
      {viewMode === 'masonry' && (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setLightboxPhoto(photo)}
              className="break-inside-avoid group relative rounded-2xl overflow-hidden bg-[#fff5f8] border border-pink-200 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <RomanticPhotoImg
                src={photo.url}
                fallbackSrc={photo.fallbackUrl}
                photoIndex={photo.photoIndex}
                alt={photo.caption}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                <p className="font-handwriting text-xl text-rose-200 leading-snug">
                  "{photo.caption}"
                </p>
                <div className="flex items-center justify-between text-xs text-stone-300 mt-2">
                  <span>{photo.date}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(photo.id);
                    }}
                    className="p-1.5 rounded-full hover:bg-white/20 text-rose-400"
                  >
                    <Heart className={`w-4 h-4 ${photo.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* High-Resolution Lightbox Modal */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-5xl max-h-[90vh] w-full flex flex-col md:flex-row bg-stone-950 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl">
            <div className="flex-1 bg-black flex items-center justify-center max-h-[60vh] md:max-h-[85vh] p-2">
              <RomanticPhotoImg
                src={lightboxPhoto.url}
                fallbackSrc={lightboxPhoto.fallbackUrl}
                photoIndex={lightboxPhoto.photoIndex}
                alt={lightboxPhoto.caption}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="w-full md:w-80 p-6 flex flex-col justify-between bg-stone-900 text-white border-t md:border-t-0 md:border-l border-stone-800">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs uppercase tracking-wider text-rose-400 font-semibold">
                    {lightboxPhoto.chapter || 'Memory'}
                  </span>
                  <button
                    onClick={() => onToggleFavorite(lightboxPhoto.id)}
                    className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300"
                  >
                    <Heart className={`w-4 h-4 ${lightboxPhoto.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{lightboxPhoto.isFavorite ? 'Favorited' : 'Favorite'}</span>
                  </button>
                </div>

                <h4 className="font-handwriting text-3xl text-rose-100 mb-3 leading-snug">
                  "{lightboxPhoto.caption}"
                </h4>

                {lightboxPhoto.notes && (
                  <div className="p-3.5 bg-stone-800/70 rounded-xl border border-stone-700/60 text-stone-300 text-xs sm:text-sm leading-relaxed mb-4">
                    {lightboxPhoto.notes}
                  </div>
                )}

                <div className="space-y-1.5 text-xs text-stone-400">
                  {lightboxPhoto.date && (
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" />
                      <span>{lightboxPhoto.date}</span>
                    </p>
                  )}
                  {lightboxPhoto.location && (
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lightboxPhoto.location}</span>
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setLightboxPhoto(null)}
                className="mt-6 w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
