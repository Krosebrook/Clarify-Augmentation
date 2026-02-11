'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(!!mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  return reduced;
}

type HeroVideoProps = {
  mp4Src: string;          // e.g. "/hero.mp4"
  webmSrc?: string;        // e.g. "/hero.webm"
  posterSrc: string;       // e.g. "/hero-poster.jpg"
  className?: string;
  overlayClassName?: string;
  priority?: boolean;      // if true, preload metadata more aggressively
};

export function HeroVideo({
  mp4Src,
  webmSrc,
  posterSrc,
  className,
  overlayClassName,
  priority = true,
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const preload = useMemo(() => (priority ? 'metadata' : 'none'), [priority]);

  // Pause when offscreen to protect CPU/battery (esp mobile)
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    // If reduced motion: never autoplay; show poster only
    if (prefersReducedMotion) {
      try {
        el.pause();
      } catch {}
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target !== el) continue;
          if (entry.isIntersecting) {
            // Attempt play; browsers may still block in edge cases
            el.play().catch(() => {
              // Leave poster visible; avoid throwing
            });
          } else {
            try {
              el.pause();
            } catch {}
          }
        }
      },
      { root: null, threshold: 0.15 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [prefersReducedMotion]);

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      {/* Poster background to guarantee instant paint */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url(${posterSrc})` }}
        aria-hidden="true"
      />

      {/* Video layer */}
      {!prefersReducedMotion && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          playsInline
          loop
          preload={preload}
          poster={posterSrc}
          // Helps Safari: keep it deterministic
          disablePictureInPicture
          controls={false}
        >
          {webmSrc ? <source src={webmSrc} type="video/webm" /> : null}
          <source src={mp4Src} type="video/mp4" />
        </video>
      )}

      {/* Overlay (gradient, glass, etc) */}
      <div
        className={
          overlayClassName ??
          'absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60'
        }
        aria-hidden="true"
      />

      {/* Content slot */}
      <div className="relative z-10">{/* your hero content goes here */}</div>
    </div>
  );
}