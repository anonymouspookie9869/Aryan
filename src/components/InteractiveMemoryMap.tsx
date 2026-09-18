import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Calendar, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Eye, 
  EyeOff, 
  Compass, 
  Heart,
  Navigation,
  Layers,
  Search
} from 'lucide-react';
import { MemoryMoment } from '../types';
import { romanticAudio } from '../utils/romanticAudio';
import { RomanticPhotoImg } from './RomanticPhotoImg';

interface InteractiveMemoryMapProps {
  memories: MemoryMoment[];
  selectedChapter: string;
  onSelectChapter: (chapter: string) => void;
  onOpenAddModal: () => void;
}

// Fallback normalized romantic coordinates generator if lat/lng is not explicitly given
function getMemoryCoordinates(memory: MemoryMoment, index: number, total: number): { x: number; y: number } {
  if (typeof memory.lat === 'number' && typeof memory.lng === 'number') {
    // Map Delhi-NCR / North India bounding box to 1200x800 map canvas
    // Reference box: lat [28.35, 28.75], lng [76.90, 77.40]
    const minLat = 28.35;
    const maxLat = 28.75;
    const minLng = 76.90;
    const maxLng = 77.40;

    const normX = (memory.lng - minLng) / (maxLng - minLng);
    // Invert lat for Y since canvas (0,0) is top-left
    const normY = 1 - (memory.lat - minLat) / (maxLat - minLat);

    // Clamp within 100 to 1100 X, and 120 to 680 Y
    const x = Math.min(1100, Math.max(100, 100 + normX * 1000));
    const y = Math.min(680, Math.max(120, 120 + normY * 560));
    return { x, y };
  }

  // Romantic celestial fallback path for any newly added custom location
  const progress = total > 1 ? index / (total - 1) : 0.5;
  const x = 160 + progress * 880 + Math.sin(index * 2.1) * 60;
  const y = 200 + Math.sin(progress * Math.PI) * 260 + (index % 2 === 0 ? -40 : 40);
  return { x, y };
}

export const InteractiveMemoryMap: React.FC<InteractiveMemoryMapProps> = ({
  memories,
  selectedChapter,
  onSelectChapter,
  onOpenAddModal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Map viewport transform (Pan & Zoom)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Selected memory for detailed preview
  const [activeMemoryId, setActiveMemoryId] = useState<string | null>(memories[0]?.id || null);
  const [hoveredMemoryId, setHoveredMemoryId] = useState<string | null>(null);
  const [revealedThoughts, setRevealedThoughts] = useState<Record<string, boolean>>({});

  // Tour mode (auto-playback through memories)
  const [isTourPlaying, setIsTourPlaying] = useState<boolean>(false);
  const tourIntervalRef = useRef<number | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Chapters list
  const chapters = ['All', 'Beginning', 'Adventures', 'Everyday Magic', 'Unforgettable', 'Milestones'];

  // Filter memories
  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      const matchChapter = selectedChapter === 'All' || m.chapter === selectedChapter;
      const matchSearch =
        !searchQuery ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.story.toLowerCase().includes(searchQuery.toLowerCase());
      return matchChapter && matchSearch;
    });
  }, [memories, selectedChapter, searchQuery]);

  // Map coordinates calculation
  const mappedMemories = useMemo(() => {
    return filteredMemories.map((m, idx) => {
      const coords = getMemoryCoordinates(m, idx, filteredMemories.length);
      return {
        ...m,
        mapX: coords.x,
        mapY: coords.y,
        stepNumber: idx + 1,
      };
    });
  }, [filteredMemories]);

  // Active memory object
  const activeMemory = useMemo(() => {
    return mappedMemories.find((m) => m.id === activeMemoryId) || mappedMemories[0] || null;
  }, [mappedMemories, activeMemoryId]);

  // Center on a specific point on the map
  const centerOnPoint = useCallback((mapX: number, mapY: number, targetZoom = 1.35) => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const newPanX = clientWidth / 2 - mapX * targetZoom;
    const newPanY = clientHeight / 2 - mapY * targetZoom;

    setZoom(targetZoom);
    setPan({ x: newPanX, y: newPanY });
  }, []);

  // Center on specific memory
  const handleSelectMemory = useCallback((memory: typeof mappedMemories[0]) => {
    setActiveMemoryId(memory.id);
    centerOnPoint(memory.mapX, memory.mapY, 1.4);
    romanticAudio.playHeartSpark();
  }, [centerOnPoint]);

  // Reset view to fit full map
  const handleResetView = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const scaleX = clientWidth / 1200;
    const scaleY = clientHeight / 800;
    const optimalZoom = Math.min(scaleX, scaleY) * 0.92;
    const fitZoom = Math.max(0.65, Math.min(optimalZoom, 1));
    
    setZoom(fitZoom);
    setPan({
      x: (clientWidth - 1200 * fitZoom) / 2,
      y: (clientHeight - 800 * fitZoom) / 2,
    });
  }, []);

  // Initial fit on mount
  useEffect(() => {
    handleResetView();
    const handleResize = () => handleResetView();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResetView]);

  // Pan controls (Drag)
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with primary left button
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom via wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    const newZoom = Math.min(2.8, Math.max(0.55, zoom * zoomFactor));

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Zoom centering around mouse point
    const newPanX = mouseX - ((mouseX - pan.x) / zoom) * newZoom;
    const newPanY = mouseY - ((mouseY - pan.y) / zoom) * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Step through memories (Prev/Next)
  const handleStepMemory = (direction: 'next' | 'prev') => {
    if (mappedMemories.length === 0) return;
    const currentIndex = mappedMemories.findIndex((m) => m.id === activeMemoryId);
    let nextIndex = 0;

    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % mappedMemories.length;
    } else {
      nextIndex = (currentIndex - 1 + mappedMemories.length) % mappedMemories.length;
    }

    const nextMem = mappedMemories[nextIndex];
    if (nextMem) {
      handleSelectMemory(nextMem);
    }
  };

  // Auto-tour timer
  useEffect(() => {
    if (isTourPlaying) {
      tourIntervalRef.current = window.setInterval(() => {
        handleStepMemory('next');
      }, 5500);
    } else if (tourIntervalRef.current) {
      clearInterval(tourIntervalRef.current);
      tourIntervalRef.current = null;
    }

    return () => {
      if (tourIntervalRef.current) {
        clearInterval(tourIntervalRef.current);
      }
    };
  }, [isTourPlaying, activeMemoryId, mappedMemories]);

  // Toggle secret thought
  const toggleSecretThought = (id: string) => {
    romanticAudio.playChime([523.25, 783.99]);
    setRevealedThoughts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Build SVG path for the Love Journey Trail connecting points
  const journeyPathD = useMemo(() => {
    if (mappedMemories.length < 2) return '';
    return mappedMemories.reduce((acc, curr, idx, arr) => {
      if (idx === 0) return `M ${curr.mapX} ${curr.mapY}`;
      const prev = arr[idx - 1];
      // Generate smooth bezier curve between points
      const dx = curr.mapX - prev.mapX;
      const dy = curr.mapY - prev.mapY;
      const cx1 = prev.mapX + dx * 0.45;
      const cy1 = prev.mapY - dy * 0.2;
      const cx2 = prev.mapX + dx * 0.55;
      const cy2 = curr.mapY + dy * 0.15;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.mapX} ${curr.mapY}`;
    }, '');
  }, [mappedMemories]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-pink-200/90 bg-gradient-to-b from-[#fff5f8] via-[#ffeef4] to-[#fce4ec] shadow-xl text-stone-800 select-none">
      
      {/* Top Map Control Bar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-pink-200/80 bg-pink-100/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-pink-500/30">
            <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '24s' }} />
          </div>
          <div>
            <h3 className="font-display font-bold text-stone-900 text-base sm:text-lg tracking-tight flex items-center gap-2">
              <span>Interactive Memory Atlas</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-pink-200/70 text-pink-900 font-semibold">
                {mappedMemories.length} Locations
              </span>
            </h3>
            <p className="text-xs text-stone-600">
              Explore the places where our story bloomed • Click pins to open memories
            </p>
          </div>
        </div>

        {/* Action Controls & Tour Playback */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search place or memory..."
              className="pl-8 pr-3 py-1.5 rounded-full border border-pink-200 bg-pink-50/90 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-pink-500 focus:bg-white w-40 sm:w-52 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Start Journey Tour Button */}
          <button
            onClick={() => {
              setIsTourPlaying(!isTourPlaying);
              romanticAudio.playChime([659.25, 880.00]);
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
              isTourPlaying
                ? 'bg-rose-600 text-white shadow-md animate-pulse'
                : 'bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white shadow-xs shadow-pink-500/25'
            }`}
          >
            {isTourPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isTourPlaying ? 'Pause Journey Tour' : 'Auto Tour'}</span>
          </button>

          {/* Add Pin Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-pink-200/80 hover:bg-pink-300/80 text-pink-900 text-xs font-semibold cursor-pointer transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Pin Place</span>
          </button>
        </div>
      </div>

      {/* Chapter Filter Chips Bar */}
      <div className="relative z-20 px-4 py-2 border-b border-pink-200/60 bg-pink-50/70 backdrop-blur-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1 mr-1 flex-shrink-0">
          <Layers className="w-3 h-3 text-pink-600" />
          <span>Chapter:</span>
        </span>
        {chapters.map((chap) => (
          <button
            key={chap}
            onClick={() => onSelectChapter(chap)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedChapter === chap
                ? 'bg-pink-600 text-white shadow-xs'
                : 'bg-pink-100/60 text-stone-700 hover:bg-pink-200/70'
            }`}
          >
            {chap}
          </button>
        ))}
      </div>

      {/* Main Interactive Map Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`relative w-full h-[540px] sm:h-[620px] overflow-hidden ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ touchAction: 'none' }}
      >
        {/* Stylized Romantic World Canvas & Grid Container */}
        <div
          className="absolute origin-top-left transition-transform duration-75 will-change-transform"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            width: '1200px',
            height: '800px',
          }}
        >
          {/* Stylized Cartographic Background Artwork */}
          <svg
            viewBox="0 0 1200 800"
            className="w-full h-full pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Romantic Rose Water Pattern */}
              <radialGradient id="waterGlow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#fff2f6" />
                <stop offset="60%" stopColor="#ffe4ee" />
                <stop offset="100%" stopColor="#ffd8e5" />
              </radialGradient>

              {/* Landmass Shimmer Gradient */}
              <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#fff7fa" stopOpacity="0.95" />
              </linearGradient>

              {/* Journey Route Gradient */}
              <linearGradient id="journeyGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#db2777" />
              </linearGradient>

              {/* Grid Pattern */}
              <pattern id="cartoGrid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#fbcfe8" strokeWidth="0.75" strokeDasharray="3,3" opacity="0.6" />
              </pattern>
            </defs>

            {/* Ocean / Parchment Background */}
            <rect width="1200" height="800" fill="url(#waterGlow)" />
            <rect width="1200" height="800" fill="url(#cartoGrid)" />

            {/* Stylized Romantic Landmass Terraces / Continents */}
            <g opacity="0.9">
              {/* Main Northern Territory (Sweet Beginnings) */}
              <path
                d="M 120,180 Q 240,110 380,140 T 640,120 T 900,160 Q 1040,190 1080,310 Q 1010,420 890,440 T 680,410 Q 520,440 400,390 T 190,340 Q 90,270 120,180 Z"
                fill="url(#landGradient)"
                stroke="#f472b6"
                strokeWidth="1.5"
                filter="drop-shadow(0 4px 12px rgba(244, 114, 182, 0.15))"
              />

              {/* Southern Scenic Peninsula (Adventures & Milestones) */}
              <path
                d="M 240,430 Q 380,460 520,480 T 780,520 Q 860,590 820,680 T 560,720 Q 380,740 290,660 T 210,510 Z"
                fill="url(#landGradient)"
                stroke="#f472b6"
                strokeWidth="1.5"
                filter="drop-shadow(0 4px 12px rgba(244, 114, 182, 0.15))"
              />

              {/* Romantic Archipelago Islets */}
              <path d="M 940,470 Q 990,460 1010,490 T 980,530 T 930,510 Z" fill="#ffffff" stroke="#f472b6" strokeWidth="1" opacity="0.85" />
              <path d="M 1020,380 Q 1060,370 1075,395 T 1050,420 T 1015,405 Z" fill="#ffffff" stroke="#f472b6" strokeWidth="1" opacity="0.85" />
              <path d="M 150,440 Q 180,430 195,455 T 175,480 T 145,465 Z" fill="#ffffff" stroke="#f472b6" strokeWidth="1" opacity="0.85" />
            </g>

            {/* Elegant Vintage Rose Compass */}
            <g transform="translate(1080, 110) scale(0.75)" opacity="0.85">
              <circle cx="0" cy="0" r="48" fill="#fff5f8" stroke="#f43f5e" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="42" fill="none" stroke="#fda4af" strokeWidth="1" strokeDasharray="2,2" />
              
              {/* Compass Points */}
              <path d="M 0,-40 L 7,-10 L 0,-2 L -7,-10 Z" fill="#e11d48" />
              <path d="M 0,40 L 7,10 L 0,2 L -7,10 Z" fill="#f43f5e" />
              <path d="M 40,0 L 10,7 L 2,0 L 10,-7 Z" fill="#f43f5e" />
              <path d="M -40,0 L -10,7 L -2,0 L -10,-7 Z" fill="#f43f5e" />
              
              <text x="0" y="-45" textAnchor="middle" fill="#be123c" fontSize="12" fontWeight="bold">N</text>
              <text x="50" y="4" textAnchor="start" fill="#be123c" fontSize="12" fontWeight="bold">E</text>
              <text x="0" y="55" textAnchor="middle" fill="#be123c" fontSize="12" fontWeight="bold">S</text>
              <text x="-50" y="4" textAnchor="end" fill="#be123c" fontSize="12" fontWeight="bold">W</text>
              
              <circle cx="0" cy="0" r="4" fill="#be123c" />
            </g>

            {/* Cartographic Coordinate Labels */}
            <text x="20" y="30" fill="#db2777" fontSize="11" opacity="0.6" fontFamily="monospace">28°36'48&quot;N • 77°13'02&quot;E</text>
            <text x="20" y="785" fill="#db2777" fontSize="11" opacity="0.6" fontFamily="monospace">GEOGRAPHY OF OUR LOVE • SCALE: FOREVER</text>

            {/* Love Route Connecting Trail (Animated Dash line) */}
            {journeyPathD && (
              <g>
                {/* Glow layer */}
                <path
                  d={journeyPathD}
                  fill="none"
                  stroke="#fda4af"
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.5"
                />
                {/* Animated dash line */}
                <path
                  d={journeyPathD}
                  fill="none"
                  stroke="url(#journeyGlow)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="8,6"
                  className="animate-pulse"
                />
              </g>
            )}
          </svg>

          {/* Interactive Memory Location Pins */}
          {mappedMemories.map((mem) => {
            const isActive = activeMemoryId === mem.id;
            const isHovered = hoveredMemoryId === mem.id;

            return (
              <div
                key={mem.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectMemory(mem);
                }}
                onMouseEnter={() => setHoveredMemoryId(mem.id)}
                onMouseLeave={() => setHoveredMemoryId(null)}
                style={{
                  left: `${mem.mapX}px`,
                  top: `${mem.mapY}px`,
                  transform: 'translate(-50%, -100%)',
                }}
                className="absolute z-30 group cursor-pointer"
              >
                {/* Pulsing Ripple Halo when active or hovered */}
                {(isActive || isHovered) && (
                  <div className="absolute left-1/2 bottom-1 -translate-x-1/2 w-12 h-12 rounded-full bg-rose-500/30 animate-ping pointer-events-none" />
                )}

                {/* Illustrated Teardrop Pin */}
                <div
                  className={`relative flex flex-col items-center transition-transform duration-200 ${
                    isActive ? 'scale-125 -translate-y-2' : isHovered ? 'scale-115 -translate-y-1' : 'hover:scale-110'
                  }`}
                >
                  {/* Pin Head */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-tr from-rose-600 via-pink-600 to-rose-500 ring-4 ring-rose-300 ring-offset-2 ring-offset-pink-50 text-white'
                        : 'bg-gradient-to-tr from-pink-600 to-rose-500 text-white shadow-pink-600/30'
                    }`}
                  >
                    <span className="text-base select-none">{mem.emotionEmoji}</span>

                    {/* Step Number Tag Badge */}
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-rose-600 border border-rose-200 text-[9px] font-bold flex items-center justify-center shadow-xs">
                      {mem.stepNumber}
                    </span>
                  </div>

                  {/* Pin Point Needle / Pointer */}
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-pink-600 -mt-0.5" />
                  {/* Shadow base on ground */}
                  <div className="w-4 h-1.5 bg-rose-950/20 rounded-full blur-[1px] mt-0.5" />

                  {/* Floating Location Name Tag */}
                  <div
                    className={`mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap shadow-sm border transition-all duration-150 ${
                      isActive
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md scale-105'
                        : 'bg-white/95 text-stone-800 border-pink-200 hover:border-pink-400 backdrop-blur-xs'
                    }`}
                  >
                    <span>{mem.location}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Viewport Map HUD Controls (Zoom In, Zoom Out, Reset, Fit) */}
        <div className="absolute right-4 bottom-4 z-20 flex flex-col gap-1.5 bg-pink-100/90 backdrop-blur-md p-1.5 rounded-2xl border border-pink-200/90 shadow-lg text-stone-700">
          <button
            onClick={() => setZoom((z) => Math.min(2.8, z * 1.25))}
            className="p-2 rounded-xl hover:bg-white hover:text-pink-600 cursor-pointer transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.55, z * 0.8))}
            className="p-2 rounded-xl hover:bg-white hover:text-pink-600 cursor-pointer transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-2 rounded-xl hover:bg-white hover:text-pink-600 cursor-pointer transition-colors"
            title="Fit Full Map View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Compass / Orientation Widget */}
        <div className="absolute left-4 top-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100/85 backdrop-blur-md border border-pink-200/80 text-xs font-semibold text-stone-700 shadow-sm pointer-events-none">
          <Navigation className="w-3.5 h-3.5 text-pink-600 transform rotate-45" />
          <span>Love Trail: Stop #{activeMemory?.stepNumber || 1} of {mappedMemories.length}</span>
        </div>
      </div>

      {/* Selected Memory Detail Drawer / Romantic Polaroid Card */}
      <AnimatePresence>
        {activeMemory && (
          <motion.div
            key={activeMemory.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative z-30 p-4 sm:p-6 border-t border-pink-200/80 bg-gradient-to-r from-pink-100/90 via-[#ffeef4]/95 to-pink-100/90 backdrop-blur-md"
          >
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-5">
              {/* Photo Polaroid Preview */}
              {activeMemory.photoUrl && (
                <div className="relative group w-full md:w-56 flex-shrink-0">
                  <div className="p-2 rounded-2xl bg-white border border-pink-200 shadow-md rotate-[-1.5deg] group-hover:rotate-0 transition-transform">
                    <div className="w-full h-40 sm:h-44 rounded-xl overflow-hidden bg-pink-100">
                      <RomanticPhotoImg
                        src={activeMemory.photoUrl}
                        alt={activeMemory.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="mt-2 px-1 text-center">
                      <span className="font-handwriting text-xs text-stone-600 truncate block">
                        {activeMemory.date}
                      </span>
                    </div>
                  </div>
                  {/* Decorative tape */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-4 bg-pink-200/80 rounded-xs transform -rotate-2 border border-pink-300/60 shadow-xs pointer-events-none" />
                </div>
              )}

              {/* Memory Story Content */}
              <div className="flex-1 min-w-0 text-left w-full">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-200 text-pink-900 border border-pink-300/80">
                      Chapter: {activeMemory.chapter}
                    </span>
                    <span className="text-xs text-stone-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-pink-600" />
                      {activeMemory.date}
                    </span>
                  </div>

                  {/* Step controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStepMemory('prev')}
                      className="p-1.5 rounded-full bg-white hover:bg-pink-200 text-stone-700 hover:text-pink-900 border border-pink-200 cursor-pointer transition-colors"
                      title="Previous Stop"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-pink-900 px-1">
                      {activeMemory.stepNumber} / {mappedMemories.length}
                    </span>
                    <button
                      onClick={() => handleStepMemory('next')}
                      className="p-1.5 rounded-full bg-white hover:bg-pink-200 text-stone-700 hover:text-pink-900 border border-pink-200 cursor-pointer transition-colors"
                      title="Next Stop"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h4 className="font-display text-lg sm:text-xl font-bold text-stone-900 flex items-center gap-2">
                  <span>{activeMemory.emotionEmoji}</span>
                  <span>{activeMemory.title}</span>
                </h4>

                <div className="flex items-center gap-1.5 text-xs text-pink-800 font-semibold mt-1 mb-2.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                  <span>{activeMemory.location}</span>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {activeMemory.story}
                </p>

                {/* Secret Thought Reveal */}
                {activeMemory.secretThought && (
                  <div className="mt-3.5 pt-3 border-t border-pink-200/80">
                    <button
                      onClick={() => toggleSecretThought(activeMemory.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 cursor-pointer group"
                    >
                      {revealedThoughts[activeMemory.id] ? (
                        <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
                      )}
                      <span>
                        {revealedThoughts[activeMemory.id]
                          ? 'Hide what was secretly on my mind'
                          : 'Peek at what I was secretly thinking at this moment...'}
                      </span>
                    </button>

                    {revealedThoughts[activeMemory.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 p-2.5 rounded-xl bg-pink-200/60 border border-pink-300/80 text-xs text-stone-800 italic"
                      >
                        &quot;{activeMemory.secretThought}&quot;
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Quick-Jump Thumbnail Strip */}
      <div className="p-3 border-t border-pink-200/80 bg-pink-100/50 backdrop-blur-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-stone-500 whitespace-nowrap px-1">
          Route Stops:
        </span>
        {mappedMemories.map((mem) => {
          const isSelected = activeMemoryId === mem.id;
          return (
            <button
              key={mem.id}
              onClick={() => handleSelectMemory(mem)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                isSelected
                  ? 'bg-rose-600 text-white shadow-xs scale-105'
                  : 'bg-white/80 hover:bg-pink-200 text-stone-700 border border-pink-200'
              }`}
            >
              <span>{mem.emotionEmoji}</span>
              <span className="truncate max-w-[130px]">{mem.location}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
