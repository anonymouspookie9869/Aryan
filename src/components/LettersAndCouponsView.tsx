import React, { useState, useRef, useEffect } from 'react';
import { Mail, Heart, Sparkles, Check, Gift, CheckCircle, RefreshCw, X, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LoveLetter, LoveCoupon } from '../types';
import { romanticAudio } from '../utils/romanticAudio';

interface LettersAndCouponsViewProps {
  letters: LoveLetter[];
  coupons: LoveCoupon[];
  onOpenLetter: (id: string) => void;
  onRedeemCoupon: (id: string) => void;
}

// Interactive Scratch Off Coupon Component
const ScratchCoupon: React.FC<{
  coupon: LoveCoupon;
  onRedeem: (id: string) => void;
}> = ({ coupon, onRedeem }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratched, setIsScratched] = useState(coupon.redeemed);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (coupon.redeemed || isScratched) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // Draw silver/champagne glitter scratch surface
    canvas.width = canvas.offsetWidth || 280;
    canvas.height = canvas.offsetHeight || 140;

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative pattern
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Scratch with finger or mouse to reveal ✨', canvas.width / 2, canvas.height / 2 + 4);
  }, [coupon.redeemed, isScratched]);

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Check completion
    checkScratchPercentage();
  };

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let clearPixels = 0;
      for (let i = 3; i < imgData.data.length; i += 4) {
        if (imgData.data[i] === 0) clearPixels++;
      }
      const percent = (clearPixels / (canvas.width * canvas.height)) * 100;
      if (percent > 45 && !isScratched) {
        setIsScratched(true);
        romanticAudio.playChime([659.25, 880]);
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#fbbf24', '#ffffff']
        });
      }
    } catch {}
  };

  return (
    <div className="bg-[#fff0f6]/95 rounded-3xl p-5 border border-pink-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between hover:border-pink-300 hover:bg-[#ffebf3] transition-colors">
      {/* Coupon Underneath (The Secret Perk) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-pink-700 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded-full">
            {coupon.category}
          </span>
          {coupon.redeemed ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle className="w-3 h-3" />
              <span>Redeemed</span>
            </span>
          ) : (
            <span className="text-[11px] text-stone-400">Coupon #{coupon.id.slice(-2)}</span>
          )}
        </div>

        <h4 className="font-display text-lg font-bold text-stone-900 mb-1">
          {coupon.title}
        </h4>
        <p className="text-stone-600 text-xs leading-relaxed">
          {coupon.perk}
        </p>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-pink-50 flex items-center justify-between">
        <span className="text-[10px] text-stone-400">No expiration date ❤️</span>
        <button
          onClick={() => {
            romanticAudio.playChime();
            onRedeem(coupon.id);
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
            coupon.redeemed
              ? 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              : 'bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white shadow-xs shadow-pink-500/25'
          }`}
        >
          {coupon.redeemed ? 'Mark Unredeemed' : 'Claim Coupon!'}
        </button>
      </div>

      {/* Silver Scratch Canvas Layer */}
      {!coupon.redeemed && !isScratched && (
        <canvas
          ref={canvasRef}
          onMouseDown={() => setIsDrawing(true)}
          onMouseUp={() => setIsDrawing(false)}
          onMouseLeave={() => setIsDrawing(false)}
          onMouseMove={(e) => {
            if (isDrawing) scratch(e.clientX, e.clientY);
          }}
          onTouchStart={() => setIsDrawing(true)}
          onTouchEnd={() => setIsDrawing(false)}
          onTouchMove={(e) => {
            if (isDrawing && e.touches[0]) {
              scratch(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          className="absolute inset-0 w-full h-full cursor-crosshair z-20 touch-none"
        />
      )}
    </div>
  );
};

export const LettersAndCouponsView: React.FC<LettersAndCouponsViewProps> = ({
  letters,
  coupons,
  onOpenLetter,
  onRedeemCoupon
}) => {
  const [selectedLetter, setSelectedLetter] = useState<LoveLetter | null>(null);

  const handleOpenLetterClick = (letter: LoveLetter) => {
    romanticAudio.playLetterOpen();
    onOpenLetter(letter.id);
    setSelectedLetter(letter);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#ec4899', '#f43f5e', '#fda4af', '#fb7185']
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      
      {/* SECTION 1: OPEN WHEN LETTERS */}
      <section className="mb-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-800 text-xs font-semibold mb-3">
            <Mail className="w-3.5 h-3.5 text-pink-600" />
            <span>Wax-Sealed Keepsakes</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight">
            "Open When..." Letters
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-2">
            Written from the heart for specific moments in time. Click any wax seal to unroll the parchment.
          </p>
        </div>

        {/* Envelope Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {letters.map((letter) => (
            <div
              key={letter.id}
              onClick={() => handleOpenLetterClick(letter)}
              className="group cursor-pointer perspective"
            >
              {/* Envelope Body */}
              <div className="bg-[#fff0f6]/95 rounded-3xl p-6 border-2 border-pink-200 shadow-sm group-hover:shadow-xl group-hover:border-pink-300 group-hover:bg-[#ffebf3] transition-all duration-300 relative min-h-[220px] flex flex-col justify-between overflow-hidden backdrop-blur-xs">
                
                {/* Envelope Fold Flap Graphic */}
                <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-pink-100/60 to-transparent border-b border-pink-100 pointer-events-none"></div>

                {/* Wax Seal in Center */}
                <div className="flex justify-center -mt-2 mb-3 relative z-10">
                  <div
                    className="w-12 h-12 rounded-full shadow-md flex items-center justify-center text-white border-2 border-white/70 group-hover:scale-110 transition-transform shadow-pink-500/25"
                    style={{ backgroundColor: letter.sealColor }}
                    title="Wax Seal"
                  >
                    <Heart className="w-6 h-6 fill-white text-white drop-shadow-xs" />
                  </div>
                </div>

                {/* Envelope Prompt Title */}
                <div className="text-center z-10 px-2">
                  <p className="text-[11px] uppercase tracking-wider text-pink-600 font-bold mb-1">
                    {letter.title}
                  </p>
                  <p className="font-handwriting text-2xl text-stone-800 leading-snug">
                    "{letter.prompt}"
                  </p>
                </div>

                {/* Status Footer */}
                <div className="flex items-center justify-between text-[11px] text-stone-400 pt-3 border-t border-pink-100 z-10">
                  <span>{letter.opened ? '✓ Read' : 'Sealed with Love'}</span>
                  <span className="text-pink-600 font-medium group-hover:underline">
                    Click to Open ✉
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: INTERACTIVE SCRATCH-OFF LOVE COUPONS */}
      <section>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-800 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-pink-600" />
            <span>Scratch & Reveal</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Birthday Love Coupons
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-2">
            Use your mouse or finger to scratch off the foil overlay and uncover custom gifts redeemable anytime!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <ScratchCoupon
              key={coupon.id}
              coupon={coupon}
              onRedeem={onRedeemCoupon}
            />
          ))}
        </div>
      </section>

      {/* UNROLLED LOVE LETTER MODAL */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fff0f6] rounded-3xl p-6 sm:p-10 max-w-xl w-full border border-pink-200 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedLetter(null)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-800 p-2 rounded-full hover:bg-pink-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Letter Header */}
            <div className="border-b border-pink-100 pb-4 mb-6">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-pink-600 font-bold mb-1">
                <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                <span>{selectedLetter.title}</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
                To My Darling,
              </h3>
            </div>

            {/* Letter Content */}
            <div className="space-y-4 text-stone-800 font-serif leading-relaxed text-base sm:text-lg">
              <p className="whitespace-pre-line">
                {selectedLetter.content}
              </p>
            </div>

            {/* Letter Signature */}
            <div className="mt-8 pt-6 border-t border-pink-100 text-right">
              <p className="text-xs text-stone-400 mb-1">With unconditional love,</p>
              <p className="font-handwriting text-3xl text-pink-600 font-bold">
                {selectedLetter.signature}
              </p>
            </div>

            {/* Close / Re-seal Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLetter(null)}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-semibold shadow-xs shadow-pink-500/25 transition-all cursor-pointer"
              >
                Fold & Put Back In Envelope
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
