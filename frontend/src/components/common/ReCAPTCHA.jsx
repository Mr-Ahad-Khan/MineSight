import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * High-performance, zero-delay reCAPTCHA v2 wrapper.
 * Directly binds to window.grecaptcha without the fragile async script loader deadlock.
 */
const ReCAPTCHA = forwardRef(function ReCAPTCHA(
  { sitekey, onChange, onExpired, theme = "light", size = "normal" },
  ref
) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [isRendered, setIsRendered] = useState(false);
  const onChangeRef = useRef(onChange);
  const onExpiredRef = useRef(onExpired);

  useEffect(() => {
    onChangeRef.current = onChange;
    onExpiredRef.current = onExpired;
  }, [onChange, onExpired]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current !== null && window.grecaptcha?.reset) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch {
          // ignore reset error
        }
      }
    },
    execute: () => {
      if (widgetIdRef.current !== null && window.grecaptcha?.execute) {
        try {
          window.grecaptcha.execute(widgetIdRef.current);
        } catch {
          // ignore execute error
        }
      }
    },
  }));

  useEffect(() => {
    let isMounted = true;
    let timerId = null;

    const renderWidget = () => {
      if (!isMounted || !containerRef.current) return false;
      if (!window.grecaptcha || typeof window.grecaptcha.render !== "function") {
        return false;
      }

      try {
        if (widgetIdRef.current !== null) {
          return true;
        }

        containerRef.current.innerHTML = "";
        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey,
          callback: (token) => {
            if (isMounted) onChangeRef.current?.(token);
          },
          "expired-callback": () => {
            if (isMounted) onExpiredRef.current?.();
          },
          "error-callback": () => {
            if (isMounted) onExpiredRef.current?.();
          },
          theme,
          size,
        });

        if (isMounted) setIsRendered(true);
        return true;
      } catch (err) {
        if (containerRef.current?.querySelector("iframe")) {
          if (isMounted) setIsRendered(true);
          return true;
        }
        return false;
      }
    };

    if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
      if (typeof window.grecaptcha.ready === "function") {
        window.grecaptcha.ready(() => {
          if (isMounted) renderWidget();
        });
      } else {
        renderWidget();
      }
    } else {
      // Poll every 30ms so widget renders immediately as soon as api.js script executes
      let attempts = 0;
      timerId = setInterval(() => {
        attempts++;
        if (renderWidget() || attempts > 200) {
          clearInterval(timerId);
          timerId = null;
        }
      }, 30);
    }

    return () => {
      isMounted = false;
      if (timerId) clearInterval(timerId);
      widgetIdRef.current = null;
    };
  }, [sitekey, theme, size]);

  return (
    <div className="relative min-h-[78px] w-full max-w-[304px]">
      {!isRendered && (
        <div className="flex h-[78px] w-[304px] items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#ff6f00]" />
          <span>Loading reCAPTCHA...</span>
        </div>
      )}
      <div
        ref={containerRef}
        className={isRendered ? "block" : "hidden"}
      />
    </div>
  );
});

export default ReCAPTCHA;
