import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onComplete: () => void;
}

// ── Particle generator ──────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
}

const PARTICLE_COLORS = [
  "rgba(124,58,237,0.6)",   // purple
  "rgba(168,85,247,0.5)",   // purple-light
  "rgba(59,130,246,0.5)",   // blue
  "rgba(6,182,212,0.5)",    // cyan
];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    opacity: Math.random() * 0.4 + 0.1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 4,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
  }));
}

// ── Component ───────────────────────────────────────────────────
export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<"entering" | "loading" | "exiting">("entering");
  const [progress, setProgress] = useState(0);

  const particles = useMemo(() => generateParticles(25), []);

  // Track when the exit animation actually finishes
  const onExitComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // Phase transitions
  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("entering"), 50);
    return () => clearTimeout(enterTimer);
  }, []);

  // Kick off loading phase after logo enters
  useEffect(() => {
    const loadingTimer = setTimeout(() => setPhase("loading"), 500);
    return () => clearTimeout(loadingTimer);
  }, []);

  // Animate progress bar (1.5s fill)
  useEffect(() => {
    if (phase !== "loading") return;

    const startTime = Date.now();
    const duration = 1500;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min((elapsed / duration) * 100, 100);
      setProgress(p);

      if (p >= 100) {
        clearInterval(interval);
        // Brief pause at 100% then exit
        setTimeout(() => setPhase("exiting"), 300);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [phase]);

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {phase !== "exiting" ? (
        <motion.div
          key="loading-screen"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-black overflow-hidden"
          style={{ willChange: "transform, opacity" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* ── Glassmorphism background circles ────────────────── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
              style={{
                background:
                  "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
                top: "10%",
                left: "-15%",
              }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full blur-[120px]"
              style={{
                background:
                  "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
                bottom: "5%",
                right: "-10%",
              }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
            <motion.div
              className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
              style={{
                background:
                  "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
                top: "50%",
                left: "45%",
              }}
              animate={{ scale: [0.9, 1.05, 0.9], opacity: [0.15, 0.3, 0.15] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            />
          </div>

          {/* ── Particles ───────────────────────────────────────── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  opacity: p.opacity,
                  willChange: "transform",
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.random() > 0.5 ? 15 : -15, 0],
                  opacity: [p.opacity, p.opacity * 0.3, p.opacity],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* ── Logo ────────────────────────────────────────────── */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {/* HJ Logo */}
            <motion.div
              className="relative"
              animate={
                progress >= 100
                  ? { scale: [1, 1.06, 1], transition: { duration: 0.6 } }
                  : {}
              }
            >
              {/* Outer glow ring */}
              <div
                className="absolute inset-0 rounded-full blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(124,58,237,0.4) 0%, rgba(6,182,212,0.2) 50%, transparent 70%)",
                  transform: "scale(1.5)",
                }}
              />
              {/* Logo text */}
              <h1
                className="relative font-display text-7xl sm:text-8xl font-bold tracking-tight select-none"
                style={{
                  background:
                    "linear-gradient(135deg, #a855f7 0%, #7c3aed 30%, #06b6d4 70%, #3b82f6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "none",
                  filter: "drop-shadow(0 0 30px rgba(124,58,237,0.5)) drop-shadow(0 0 60px rgba(6,182,212,0.3))",
                }}
              >
                HJ
              </h1>
            </motion.div>

            {/* Tagline */}
            <motion.p
              className="text-white/40 text-sm sm:text-base font-sans tracking-widest uppercase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Digital Creator
            </motion.p>
          </motion.div>

          {/* ── Progress bar ────────────────────────────────────── */}
          <motion.div
            className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 sm:w-64 z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {/* Bar track */}
            <div className="h-[2px] w-full bg-white/[0.06] rounded-full overflow-hidden relative">
              {/* Bar fill with gradient */}
              <motion.div
                className="h-full rounded-full relative"
                style={{
                  background:
                    "linear-gradient(90deg, #7c3aed, #a855f7, #06b6d4)",
                  width: `${progress}%`,
                  willChange: "width",
                }}
              >
                {/* Shimmer sweep */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                    animation: "shimmer 1.5s ease-in-out infinite",
                  }}
                />
              </motion.div>
            </div>

            {/* Progress percentage */}
            <p className="text-center mt-3 text-[10px] text-white/25 font-mono tracking-widest">
              {Math.round(progress)}%
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
