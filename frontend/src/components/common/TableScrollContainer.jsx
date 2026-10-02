import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useLanguageStore } from "../../store/themeStore";
import { translations } from "../../i18n/translations";

export default function TableScrollContainer({ children, className = "" }) {
  const containerRef = useRef(null);
  const [canScroll, setCanScroll] = useState(false);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const { language } = useLanguageStore();
  const t = translations[language] || {};

  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const hasScroll = el.scrollWidth > el.clientWidth + 10;
    setCanScroll(hasScroll);
    setIsAtStart(el.scrollLeft < 24);
    setIsAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 24);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    checkScroll();

    // ResizeObserver to detect layout / screen size changes
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);

    // Initial cue peek animation so user knows to scroll from beginning
    let peekTimer = null;
    let returnTimer = null;

    if (el.scrollWidth > el.clientWidth + 15 && el.scrollLeft === 0) {
      peekTimer = setTimeout(() => {
        if (!containerRef.current || containerRef.current.scrollLeft > 10) return;
        containerRef.current.scrollTo({ left: 65, behavior: "smooth" });
        returnTimer = setTimeout(() => {
          if (!containerRef.current) return;
          containerRef.current.scrollTo({ left: 0, behavior: "smooth" });
        }, 500);
      }, 750);
    }

    return () => {
      ro.disconnect();
      if (peekTimer) clearTimeout(peekTimer);
      if (returnTimer) clearTimeout(returnTimer);
    };
  }, [checkScroll]);

  const handleScrollCueClick = () => {
    const el = containerRef.current;
    if (!el) return;

    if (isAtStart) {
      // Smoothly scroll forward to show more content
      const step = Math.max(el.clientWidth * 0.75, 260);
      el.scrollTo({ left: Math.min(el.scrollLeft + step, el.scrollWidth), behavior: "smooth" });
    } else {
      // Smoothly return to the very beginning
      el.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const moreLabel = t.tapToScrollMore || (language === "hi" ? "और देखने के लिए टैप करें" : "Tap or swipe to see more");
  const startLabel = t.tapToScrollStart || (language === "hi" ? "शुरुआत पर वापस जाएं" : "Tap to return to start");

  return (
    <div className={`relative w-full ${className}`}>
      {/* Scrollable table container */}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="table-scroll-container w-full overflow-x-auto pb-10 sm:pb-0"
      >
        {children}
      </div>

      {/* Interactive on-tap scroll cue button - centered at bottom */}
      {canScroll && (
        <div className="pointer-events-none absolute bottom-2 left-0 right-0 flex justify-center sm:hidden">
          <button
            type="button"
            onClick={handleScrollCueClick}
            className="pointer-events-auto group inline-flex items-center gap-1.5 rounded-full border border-[#d8c6a6] bg-white/95 px-3 py-1 text-[11px] font-bold text-[#6b5d4c] shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white active:scale-95 dark:border-slate-700 dark:bg-slate-800/95 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-label={isAtStart ? moreLabel : startLabel}
            title={isAtStart ? moreLabel : startLabel}
          >
            {isAtStart ? (
              <>
                <span className="text-[10px] text-amber-600 dark:text-amber-400">↔</span>
                <span>{moreLabel}</span>
                <ArrowRight className="h-3 w-3 text-amber-600 transition-transform group-hover:translate-x-0.5 dark:text-amber-400" />
              </>
            ) : (
              <>
                <RotateCcw className="h-3 w-3 text-sky-600 transition-transform group-hover:-rotate-45 dark:text-sky-400" />
                <span>{startLabel}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
