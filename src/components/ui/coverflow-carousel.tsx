import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface CoverflowSlide {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
  number: string;
}

export function CoverflowCarousel({ slides, className }: { slides: CoverflowSlide[]; className?: string }) {
  const count = slides.length;
  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const posRef = React.useRef(0);
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<{ id: number; x: number; pos: number; v: number; t: number } | null>(null);
  const [selected, setSelected] = React.useState(0);

  const indexAt = React.useCallback((pos: number) => ((Math.round(pos) % count) + count) % count, [count]);

  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width) return;
    const pitch = width * 0.76;
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      let offset = index - posRef.current;
      offset = ((offset % count) + count) % count;
      if (offset > count / 2) offset -= count;
      const distance = Math.abs(offset);
      const ramp = Math.pow(distance, 0.62);
      const tilt = Math.min(42 * ramp, 78) * Math.sign(offset);
      card.style.transform = `translateX(calc(-50% + ${offset * pitch}px)) translateZ(${-width * 0.62 * ramp}px) rotateY(${-tilt}deg)`;
      card.style.opacity = String(Math.max(0, 1 - 0.16 * distance));
      card.style.zIndex = String(100 - Math.round(distance));
    });
  }, [count]);

  const settle = React.useCallback((target: number) => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    targetRef.current = target;
    setSelected(indexAt(target));
    const step = () => {
      const remaining = target - posRef.current;
      if (Math.abs(remaining) < 0.0004) {
        posRef.current = target;
        paint();
        rafRef.current = null;
        return;
      }
      posRef.current += remaining * 0.12;
      paint();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [indexAt, paint]);

  const nudge = React.useCallback((by: number) => settle(Math.round(targetRef.current) + by), [settle]);

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      paint();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint]);

  React.useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, []);

  const active = slides[selected];

  return (
    <div className={cn("w-full", className)} role="region" aria-roledescription="carousel" aria-label="Projetos em destaque">
      <div className="relative">
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={(event) => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            event.currentTarget.setPointerCapture(event.pointerId);
            targetRef.current = posRef.current;
            dragRef.current = { id: event.pointerId, x: event.clientX, pos: posRef.current, v: 0, t: performance.now() };
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current;
            if (!drag || drag.id !== event.pointerId) return;
            const pitch = widthRef.current * 0.76;
            if (!pitch) return;
            const now = performance.now();
            const previous = posRef.current;
            posRef.current = drag.pos - (event.clientX - drag.x) / pitch;
            drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
            drag.t = now;
            setSelected(indexAt(posRef.current));
            paint();
          }}
          onPointerUp={(event) => {
            const drag = dragRef.current;
            if (!drag || drag.id !== event.pointerId) return;
            dragRef.current = null;
            settle(Math.round(posRef.current + Math.max(-2, Math.min(2, drag.v * 0.18))));
          }}
          onPointerCancel={() => { dragRef.current = null; settle(Math.round(posRef.current)); }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") nudge(-1);
            if (event.key === "ArrowRight") nudge(1);
          }}
          className="coverflow-frame cursor-grab overflow-hidden py-10 outline-none active:cursor-grabbing"
          style={{ perspective: "calc(var(--cf-card) * 3)", touchAction: "pan-y" }}
        >
          <div className="relative select-none" style={{ height: "var(--cf-card)", transformStyle: "preserve-3d" }}>
            {slides.map((slide, index) => (
              <div
                key={slide.title}
                ref={(node) => { cardRefs.current[index] = node; }}
                role="group"
                aria-label={`${index + 1} de ${count}`}
                className="coverflow-card absolute left-1/2 top-0 overflow-hidden will-change-transform"
              >
                <img src={slide.src} alt={slide.alt} draggable={false} loading="lazy" width={1024} height={1280} className="h-full w-full select-none object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden items-center md:flex">
          <button type="button" className="carousel-control pointer-events-auto" aria-label="Projeto anterior" onClick={() => nudge(-1)}><ArrowLeft size={19} /></button>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden items-center md:flex">
          <button type="button" className="carousel-control pointer-events-auto" aria-label="Próximo projeto" onClick={() => nudge(1)}><ArrowRight size={19} /></button>
        </div>
      </div>
      {active && (
        <div key={selected} className="carousel-caption animate-fade-in">
          <span>{active.number}</span>
          <h3>{active.title}</h3>
          <p>{active.subtitle}</p>
        </div>
      )}
    </div>
  );
}