import { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Sparkles, Palette, Cpu, Download, ArrowRight, Mail } from "lucide-react";

/* ───────── 3D Background Scene ───────── */

function FloatingShape({
  geometry,
  position,
  rotationSpeed,
  color,
  wireframeColor,
  scale = 1,
}: {
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  rotationSpeed: [number, number, number];
  color: string;
  wireframeColor: string;
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += rotationSpeed[0] * delta;
    meshRef.current.rotation.y += rotationSpeed[1] * delta;
    meshRef.current.rotation.z += rotationSpeed[2] * delta;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <primitive object={geometry} attach="geometry" />
      <meshBasicMaterial
        color={wireframeColor}
        wireframe
        transparent
        opacity={0.12}
      />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.05}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function HeroScene() {
  const shapes = useMemo(() => {
    return [
      {
        geometry: new THREE.IcosahedronGeometry(1.2, 0),
        position: [2.5, 1.2, -2] as [number, number, number],
        rotationSpeed: [0.15, 0.25, 0.1] as [number, number, number],
        color: "#7c3aed",
        wireframeColor: "#a855f7",
        scale: 1.2,
      },
      {
        geometry: new THREE.OctahedronGeometry(0.9, 0),
        position: [-2.8, -1.5, -1.5] as [number, number, number],
        rotationSpeed: [0.2, -0.15, 0.12] as [number, number, number],
        color: "#3b82f6",
        wireframeColor: "#60a5fa",
        scale: 1.0,
      },
      {
        geometry: new THREE.TorusGeometry(0.8, 0.15, 8, 16),
        position: [-2.2, 1.8, -2.5] as [number, number, number],
        rotationSpeed: [0.1, 0.3, -0.05] as [number, number, number],
        color: "#06b6d4",
        wireframeColor: "#22d3ee",
        scale: 1.1,
      },
      {
        geometry: new THREE.IcosahedronGeometry(0.7, 0),
        position: [3.2, -1.8, -1] as [number, number, number],
        rotationSpeed: [-0.18, 0.22, 0.15] as [number, number, number],
        color: "#7c3aed",
        wireframeColor: "#c084fc",
        scale: 0.9,
      },
      {
        geometry: new THREE.TorusGeometry(0.6, 0.12, 6, 12),
        position: [-1.5, -0.8, -3] as [number, number, number],
        rotationSpeed: [0.25, -0.1, 0.2] as [number, number, number],
        color: "#3b82f6",
        wireframeColor: "#93c5fd",
        scale: 0.85,
      },
      {
        geometry: new THREE.OctahedronGeometry(1.0, 0),
        position: [1.8, 2.2, -1.8] as [number, number, number],
        rotationSpeed: [-0.12, 0.18, -0.08] as [number, number, number],
        color: "#06b6d4",
        wireframeColor: "#67e8f9",
        scale: 1.0,
      },
      {
        geometry: new THREE.TorusKnotGeometry(0.5, 0.12, 64, 8),
        position: [-3.5, 0.5, -2] as [number, number, number],
        rotationSpeed: [0.08, 0.2, -0.1] as [number, number, number],
        color: "#7c3aed",
        wireframeColor: "#d8b4fe",
        scale: 0.9,
      },
    ];
  }, []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.6} color="#7c3aed" />
      <pointLight position={[-5, -3, 2]} intensity={0.3} color="#3b82f6" />
      {shapes.map((shape, i) => (
        <FloatingShape key={i} {...shape} />
      ))}
    </>
  );
}

/* ───────── Client-Only Canvas Wrapper ───────── */

function ThreeBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-0" style={{ pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: "none" }}
      >
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </Canvas>
    </div>
  );
}

/* ───────── Mouse Spotlight ───────── */

function MouseSpotlight() {
  const [pos, setPos] = useState({ x: -999, y: -999 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1]"
      aria-hidden="true"
    >
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.07]"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,1) 0%, rgba(59,130,246,0.4) 35%, transparent 70%)",
          transform: `translate(${pos.x - 300}px, ${pos.y - 300}px)`,
          transition: "transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)",
        }}
      />
    </div>
  );
}

/* ───────── Floating Glass Cards ───────── */

const glassCards = [
  {
    icon: Sparkles,
    label: "AI Websites",
    color: "text-brand-purple-light",
  },
  {
    icon: Palette,
    label: "UI/UX Design",
    color: "text-brand-blue",
  },
  {
    icon: Cpu,
    label: "AI Prototypes",
    color: "text-brand-cyan",
  },
];

function FloatingGlassCard({
  icon: Icon,
  label,
  color,
  delay,
}: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      className="glass flex items-center gap-3 px-5 py-3 min-w-[180px]"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: [0, -12, 0] }}
      transition={{
        opacity: { duration: 0.6, delay: delay + 0.8 },
        y: {
          duration: 4,
          delay: delay + 0.8,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      <Icon className={cn("shrink-0", color)} size={20} />
      <span className="text-white/80 text-sm font-medium whitespace-nowrap">
        {label}
      </span>
    </motion.div>
  );
}

/* ───────── Main Hero Component ───────── */

const headingText = "Hi, I'm Himanshu Jaiswal.";

export function Hero() {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const titleWords = headingText.split(" ");

  // Container variants for stagger
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.3 },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.7 + i * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
  };

  return (
    <section
      id="home"
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-brand-black"
    >
      {/* 3D background */}
      <ThreeBackground />

      {/* Mouse spotlight */}
      <MouseSpotlight />

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-b from-brand-purple/5 via-transparent to-brand-black/80" />

      {/* Floating glass cards */}
      <div className="absolute inset-0 z-[3] pointer-events-none">
        <div className="relative max-w-7xl mx-auto h-full">
          <motion.div
            className="absolute top-[20%] left-[5%] hidden lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <FloatingGlassCard
              {...glassCards[0]}
              delay={1.2}
            />
          </motion.div>
          <motion.div
            className="absolute top-[15%] right-[8%] hidden lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <FloatingGlassCard
              {...glassCards[1]}
              delay={1.5}
            />
          </motion.div>
          <motion.div
            className="absolute bottom-[25%] right-[12%] hidden lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            <FloatingGlassCard
              {...glassCards[2]}
              delay={1.8}
            />
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-[4] flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-4xl mx-auto pt-20">
        {/* Heading */}
        <motion.h1
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {titleWords.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.3em]"
              variants={wordVariants}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-base sm:text-lg md:text-xl text-white/70 font-sans max-w-2xl mb-4 leading-relaxed"
          custom={0}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
        >
          I turn ideas into modern websites, AI-powered solutions, and premium
          digital experiences.
        </motion.p>

        {/* Description */}
        <motion.p
          className="text-sm sm:text-base text-white/50 font-sans max-w-xl mb-10 leading-relaxed"
          custom={1}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
        >
          An ambitious beginner with a passion for creating professional digital
          products through creativity, AI, and continuous learning.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4"
          custom={2}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
        >
          <Button variant="glow" size="lg" asChild>
            <a href="#work">
              <ArrowRight className="mr-2" size={18} />
              Explore My Work
            </a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="#contact">
              <Mail className="mr-2" size={18} />
              Hire Me
            </a>
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
              <Download className="mr-2" size={18} />
              Download Resume
            </a>
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[4]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.6 }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-white/30 text-xs tracking-widest uppercase">
            Scroll
          </span>
          <motion.div
            className="w-px h-8 bg-gradient-to-b from-brand-purple/60 to-transparent"
            animate={{ scaleY: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
