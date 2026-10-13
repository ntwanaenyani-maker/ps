import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, BookOpen } from 'lucide-react';

const SLIDE_COUNT = 12;
const SLIDES = Array.from(
  { length: SLIDE_COUNT },
  (_, i) => `/images/guide/guide-slide-${String(i + 1).padStart(2, '0')}.jpg`,
);
const AUTOPLAY_MS = 6000;

interface ProductGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

export const ProductGuideModal: React.FC<ProductGuideModalProps> = ({ isOpen, onClose }) => {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [readyCount, setReadyCount] = useState(0);
  const reduced = usePrefersReducedMotion();

  const allLoaded = readyCount >= SLIDE_COUNT;

  const goTo = useCallback((next: number) => {
    setIndex(((next % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);
  }, []);

  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    if (!isOpen) return;
    setIndex(0);
    setPlaying(true);
    setReadyCount(0);
    let cancelled = false;
    SLIDES.forEach((src) => {
      const img = new Image();
      const done = () => {
        if (!cancelled) setReadyCount((c) => Math.min(c + 1, SLIDE_COUNT));
      };
      img.onload = done;
      img.onerror = done;
      img.src = src;
      if (img.complete) done();
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || reduced) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === ' ') {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, reduced, next, prev]);

  useEffect(() => {
    if (!isOpen || !playing || reduced) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % SLIDE_COUNT), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [isOpen, playing, reduced]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Products guide presentation"
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-stone-950/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <style>{`
        @keyframes guideProgress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .guide-progress { transform-origin: left; animation-name: guideProgress; animation-timing-function: linear; animation-fill-mode: forwards; }
        @media (prefers-reduced-motion: reduce) {
          .guide-progress { animation: none; transform: scaleX(1); }
          .guide-slide-anim { transition: none !important; }
        }
      `}</style>

      <div
        className="relative w-full max-w-5xl max-h-[92vh] bg-stone-900 border border-stone-700/70 rounded-sm shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5 border-b border-stone-700/70 bg-stone-950/60">
          <div className="flex items-center gap-3 min-w-0">
            <span className="hidden sm:flex items-center justify-center w-9 h-9 rounded-sm bg-[#1f3d2e] text-amber-300 shrink-0">
              <BookOpen className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-serif font-bold text-white truncate">
                Products Guide
              </h2>
              <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-emerald-400/90 truncate">
                Modern African Skincare · Product Presentation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
              className="flex items-center gap-1.5 h-9 px-2.5 rounded-sm border border-stone-600 text-stone-200 hover:bg-stone-800 hover:text-white transition-colors text-[11px] font-mono uppercase tracking-wider cursor-pointer"
            >
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{playing ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close products guide"
              className="flex items-center justify-center w-9 h-9 rounded-sm border border-stone-600 text-stone-300 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Autoplay progress */}
        <div className="h-0.5 w-full bg-stone-800 relative overflow-hidden">
          {playing && !reduced ? (
            <div
              key={index}
              className="guide-progress absolute inset-0 bg-amber-400/90"
              style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
            />
          ) : null}
        </div>

        {/* Slide Stage */}
        <div className="relative aspect-video w-full bg-black select-none">
          {SLIDES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`Products guide slide ${i + 1} of ${SLIDE_COUNT}`}
              draggable={false}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className={`guide-slide-anim absolute inset-0 w-full h-full object-contain transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform] ${
                i === index ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-[1.03] z-0'
              }`}
              referrerPolicy="no-referrer"
            />
          ))}

          {/* Loading veil */}
          {!allLoaded && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
              <div className="flex flex-col items-center gap-3 text-stone-300">
                <span className="w-7 h-7 rounded-full border-2 border-stone-600 border-t-amber-400 animate-spin" />
                <span className="text-[11px] font-mono uppercase tracking-widest">
                  Loading guide… {readyCount}/{SLIDE_COUNT}
                </span>
              </div>
            </div>
          )}

          {/* Chevrons */}
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-stone-950/60 hover:bg-stone-950/90 text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-105 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-stone-950/60 hover:bg-stone-950/90 text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-105 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Slide counter */}
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-30 bg-stone-950/75 backdrop-blur-sm text-stone-100 text-[11px] font-mono px-2.5 py-1 rounded-sm border border-white/10 tabular-nums">
            {String(index + 1).padStart(2, '0')} / {SLIDE_COUNT}
          </div>
        </div>

        {/* Thumbnail rail */}
        <div className="flex items-center gap-2 px-4 sm:px-6 py-3.5 overflow-x-auto bg-stone-950/60 border-t border-stone-700/70">
          {SLIDES.map((src, i) => (
            <button
              key={src}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={`relative w-16 sm:w-20 aspect-video shrink-0 rounded-sm overflow-hidden border transition-all cursor-pointer ${
                i === index
                  ? 'border-amber-400 opacity-100 ring-1 ring-amber-400/40'
                  : 'border-stone-700 opacity-55 hover:opacity-90'
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
              <span className="absolute bottom-0.5 right-0.5 text-[9px] font-mono bg-stone-950/75 text-stone-200 px-1 rounded-[2px]">
                {i + 1}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
