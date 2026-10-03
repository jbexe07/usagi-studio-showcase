import { Component, Suspense, lazy, useEffect, useRef, useState, type ReactNode } from "react";

const HatScene = lazy(() => import("./HatScene"));

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

const STARS = [
  { x: 70, y: 120, s: 1, d: 0 },
  { x: 330, y: 100, s: 0.8, d: 0.25 },
  { x: 50, y: 230, s: 0.6, d: 0.5 },
  { x: 350, y: 210, s: 1.1, d: 0.15 },
  { x: 120, y: 60, s: 0.7, d: 0.4 },
  { x: 285, y: 50, s: 0.9, d: 0.6 },
];

const css = `
.hat-reveal{position:relative;height:300vh;background:#F7F7FF}
.hat-stage{position:sticky;top:0;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(12px,3vh,32px);overflow:hidden;padding:0 20px}
.hat-svg{width:min(400px,86vw);height:auto;max-height:58vh}\n.hat-3d{aspect-ratio:1;height:min(400px,86vw,58vh);width:auto;max-width:86vw}\n.hat-3d canvas{display:block}\n.hat-fallback{width:100%;height:100%}
.hat-text{text-align:center;max-width:640px}
.hat-text h2{margin:0;color:#381932;font-family:var(--font-display);font-size:clamp(26px,4.4vw,52px);line-height:1}
.hat-text p{margin:14px auto 22px;color:#200815;font-family:var(--font-body);font-size:clamp(15px,1.6vw,18px);line-height:1.5}
.hat-btn{display:inline-block;padding:14px 26px;border-radius:999px;background:#FFB547;color:#200815;font-family:var(--font-body);font-weight:800;text-decoration:none;transition:transform .2s}
.hat-btn:hover{transform:translateY(-2px)}
@media (prefers-reduced-motion: reduce){.hat-reveal{height:auto}.hat-stage{position:relative;min-height:100vh;padding:80px 20px}}
`;

function HatFallback({ p }: { p: number }) {
  const hatIn = ease(range(p, 0, 0.15));
  const tilt = (1 - hatIn) * -12 + -4 * (1 - range(p, 0.15, 0.4));
  const rise = ease(range(p, 0.15, 0.75));
  const bunnyY = 230 - rise * 230;
  const wiggleT = range(p, 0.6, 0.85);
  const wiggle = Math.sin(wiggleT * Math.PI * 4) * 8 * (1 - Math.abs(wiggleT * 2 - 1) * 0.3) * (wiggleT > 0 && wiggleT < 1 ? 1 : 0);
  return (
        <svg className="hat-fallback" viewBox="0 0 400 400" aria-hidden="true"
          style={{ opacity: hatIn, transform: `translateY(${(1 - hatIn) * 40}px) rotate(${tilt}deg)`, transformOrigin: "50% 80%" }}>
          <defs>
            <clipPath id="hat-clip"><rect x="0" y="0" width="400" height="262" /></clipPath>
          </defs>
          {STARS.map((s, i) => {
            const t = range(wiggleT, s.d * 0.5, s.d * 0.5 + 0.5);
            return (
              <path key={i} d="M0-12L3-3 12 0 3 3 0 12-3 3-12 0-3-3Z" fill="#FFB547"
                transform={`translate(${s.x} ${s.y}) scale(${s.s * ease(t)}) rotate(${t * 90})`} opacity={p >= 0.6 ? 1 : 0} />
            );
          })}
          {/* 1. fundo interno */}
          <ellipse cx="200" cy="262" rx="92" ry="20" fill="#200815" />
          {/* 2. coelho */}
          <g clipPath="url(#hat-clip)">
            <g transform={`translate(0 ${bunnyY})`}>
              <g transform={`rotate(${-wiggle} 180 150)`}>
                <ellipse cx="175" cy="100" rx="16" ry="52" fill="#E7E3FC" />
                <ellipse cx="175" cy="104" rx="7" ry="38" fill="#F6B9CF" />
              </g>
              <g transform={`rotate(${wiggle} 222 150)`}>
                <ellipse cx="225" cy="100" rx="16" ry="52" fill="#E7E3FC" />
                <ellipse cx="225" cy="104" rx="7" ry="38" fill="#F6B9CF" />
              </g>
              <ellipse cx="200" cy="255" rx="62" ry="58" fill="#E7E3FC" />
              <circle cx="200" cy="182" r="48" fill="#E7E3FC" />
              <circle cx="183" cy="176" r="5" fill="#200815" />
              <circle cx="217" cy="176" r="5" fill="#200815" />
              <path d="M194 192h12l-6 7z" fill="#F6B9CF" />
              <circle cx="170" cy="194" r="7" fill="#F6B9CF" opacity=".5" />
              <circle cx="230" cy="194" r="7" fill="#F6B9CF" opacity=".5" />
            </g>
          </g>
          {/* 3. frente da cartola */}
          <path d="M108 262 L120 360 Q200 378 280 360 L292 262 Q200 290 108 262Z" fill="#381932" />
          <path d="M112 296 Q200 322 288 296 L285 318 Q200 344 115 318Z" fill="#FFB547" />
          <path d="M60 262 Q200 316 340 262 Q340 288 200 296 Q60 288 60 262Z" fill="#381932" />
        </svg>
  );
}

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  override render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch { return false; }
}

export function HatReveal() {
  const ref = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  const progressRef = useRef(0);
  const [use3D, setUse3D] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMobile(window.matchMedia("(max-width: 760px), (pointer: coarse)").matches);
    if (reduce) { setP(1); progressRef.current = 1; return; }
    const el0 = ref.current;
    const io = new IntersectionObserver(([e]) => {
      setOnScreen(!!e?.isIntersecting);
      if (e?.isIntersecting && hasWebGL()) setUse3D(true);
    }, { rootMargin: "400px 0px" });
    if (el0) io.observe(el0);
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const v = clamp(-r.top / (total || 1));
      progressRef.current = v;
      setP(v);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const textIn = ease(range(p, 0.75, 1));
  const ready = textIn > 0.6;

  return (
    <section ref={ref} className="hat-reveal" aria-labelledby="hat-title">
      <style>{css}</style>
      <div className="hat-stage">
        <div className="hat-svg hat-3d">
          {use3D ? (
            <SceneBoundary fallback={<HatFallback p={p} />}>
              <Suspense fallback={<HatFallback p={p} />}>
                <HatScene progress={progressRef} active={onScreen} mobile={mobile} />
              </Suspense>
            </SceneBoundary>
          ) : (
            <HatFallback p={p} />
          )}
        </div>
        <div className="hat-text" style={{ opacity: textIn, transform: `translateY(${(1 - textIn) * 24}px)` }}>
          <h2 id="hat-title">Todo bom site tem um truque.</h2>
          <p>Usagi, em japonês, é coelho. A gente tira soluções da cartola.</p>
          <a href="#contato" className="hat-btn" tabIndex={ready ? 0 : -1}
            style={{ pointerEvents: ready ? "auto" : "none" }}>Pedir orçamento</a>
        </div>
      </div>
    </section>
  );
}
