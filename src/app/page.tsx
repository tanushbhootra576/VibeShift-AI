"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Zap,
  BrainCircuit,
  Calendar,
  Target,
  ShieldAlert,
  Timer,
  StickyNote,
  MoveUpRight,
} from "lucide-react";
import Link from "next/link";

/* ─── Animation variants ─── */

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_SPRING: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT, delay },
  }),
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut", delay },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_SPRING, delay },
  }),
};

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE_OUT, delay },
  }),
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE_OUT, delay },
  }),
};

/* Scroll-triggered section wrapper */
function RevealSection({
  children,
  className = "",
  delay = 0,
  variant = fadeUp,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: Variants;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={variant}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Floating decoration that gently bobs */
function FloatingBlob({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -18, 0],
        rotate: [0, 3, -2, 0],
      }}
      transition={{
        duration: 7 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

/* Spinning decoration */
function SpinDeco({
  className,
  duration = 20,
}: {
  className: string;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    />
  );
}

export default function LandingPage() {
  /* Parallax on hero background blobs */
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const blobY1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const blobY2 = useTransform(scrollYProgress, [0, 1], [0, 80]);

  /* Pipeline section */
  const pipelineRef = useRef(null);
  const pipelineInView = useInView(pipelineRef, { once: true, margin: "-100px" });

  /* Features section */
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });

  /* Footer */
  const footerRef = useRef(null);
  const footerInView = useInView(footerRef, { once: true, margin: "-60px" });

  return (
    <div
      className="min-h-screen bg-[#FDFBF7] text-black font-body overflow-x-hidden relative selection:bg-[#FF71CE] selection:text-white"
      ref={heroRef}
    >
      {/* ─── PARALLAX BACKGROUND BLOBS ─── */}
      <motion.div
        style={{ y: blobY1 }}
        className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#FFCE5C] rounded-full mix-blend-multiply filter blur-[80px] opacity-40 pointer-events-none"
      />
      <motion.div
        style={{ y: blobY2 }}
        className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#4ECDC4] rounded-full mix-blend-multiply filter blur-[100px] opacity-30 pointer-events-none"
      />
      <div className="fixed inset-0 pattern-squiggles opacity-[0.08] pointer-events-none z-0" />

      {/* ─── NAVIGATION ─── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 w-full z-50 px-4 md:px-6 py-3 md:py-4 bg-white border-b-4 border-black flex items-center justify-between"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.div
              className="w-5 h-5 md:w-6 md:h-6 bg-[#FF71CE] border-2 border-black rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              animate={{ rotate: [12, 20, 12, 5, 12] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="font-display font-black uppercase tracking-tight text-lg md:text-xl">
              VibeShift
            </span>
          </motion.div>

          <div className="flex items-center gap-4">
            <motion.div whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/auth"
                className="bg-[#FFCE5C] border-2 md:border-4 border-black px-4 md:px-8 py-2 text-xs md:text-sm font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow block"
              >
                Log In
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* ─── HERO ─── */}
      <main className="pt-40 pb-32 px-6 max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-16 min-h-[95vh]">
        <div className="flex-1 relative">
          {/* Beta badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: -12 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative inline-flex mb-6 md:mb-8 md:absolute md:-top-12 md:-left-6 bg-[#4ECDC4] border-4 border-black px-3 py-1 md:px-4 md:py-1 text-xs md:text-sm font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20 items-center gap-2"
          >
            <motion.span
              animate={{ rotate: [0, 20, -10, 20, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.span>
                    </motion.div>

          {/* Headline */}
          <div className="overflow-hidden">
            <motion.h1
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="text-[48px] sm:text-[65px] md:text-[90px] lg:text-[110px] font-display font-black leading-[0.85] tracking-tighter uppercase relative z-10"
            >
              Kill Your <br />
              <span className="relative inline-block mt-2">
                <motion.span
                  className="absolute inset-0 bg-[#FF71CE] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                  initial={{ scaleX: 0, rotate: 0 }}
                  animate={{ scaleX: 1, rotate: 2 }}
                  transition={{ duration: 0.7, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  style={{ originX: 0 }}
                />
                <motion.span
                  className="relative z-10 text-white px-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 1.2 }}
                >
                  Procrastination
                </motion.span>
              </span>
            </motion.h1>
          </div>

          {/* Description card */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: -1 }}
            transition={{ duration: 0.7, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 max-w-lg relative bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <motion.div
              className="absolute -top-4 -right-4 w-8 h-8 bg-[#FFCE5C] border-4 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-20"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <p className="text-xl font-mono font-bold text-black leading-relaxed">
              VibeShift isn&apos;t just a to-do list. It&apos;s a hostile, proactive AI
              companion that forces you to execute your tasks before they crush
              your schedule.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 flex flex-wrap items-center gap-6 relative z-20"
          >
            <motion.div
              whileHover={{ y: -5, rotate: 0 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 350, damping: 15 }}
            >
              <Link
                href="/dashboard"
                className="bg-[#6A7BB4] text-white border-4 border-black px-6 py-4 md:px-10 md:py-5 text-lg md:text-xl font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-shadow flex items-center gap-3 transform rotate-1 w-full justify-center sm:w-auto"
              >
                Open OS
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <MoveUpRight className="w-6 h-6" />
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* ─── HERO COLLAGE GRAPHIC ─── */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 relative w-full h-[500px] hidden md:block"
        >
          {/* Back card */}
          <motion.div
            className="absolute top-[10%] left-[10%] w-[80%] h-[80%] bg-white border-4 border-black shadow-[16px_16px_0px_0px_#4ECDC4]"
            animate={{ rotate: [3, 5, 3, 1, 3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Yellow card */}
          <motion.div
            className="absolute top-[20%] right-[5%] w-[60%] h-[70%] bg-[#FFCE5C] border-4 border-black shadow-[12px_12px_0px_0px_#FF71CE] flex flex-col p-6"
            animate={{ rotate: [-6, -4, -6, -8, -6] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <div className="flex-1 border-4 border-dashed border-black rounded-xl flex items-center justify-center bg-[#FDFBF7]">
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Target className="w-16 h-16 text-black opacity-20" />
              </motion.div>
            </div>
          </motion.div>

          {/* Floating sticker: Urgent Task */}
          <motion.div
            className="absolute top-0 right-10 bg-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3"
            initial={{ opacity: 0, y: -20, rotate: 12 }}
            animate={{ opacity: 1, y: 0, rotate: 12 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            whileHover={{ scale: 1.05, rotate: 8 }}
          >
            <motion.div
              className="w-8 h-8 bg-[#FF6B6B] rounded-full border-4 border-black"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="font-black uppercase text-sm">Urgent Task</span>
          </motion.div>

          {/* Floating sticker: Time Blocked */}
          <motion.div
            className="absolute bottom-10 left-0 bg-[#6A7BB4] text-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            initial={{ opacity: 0, x: -30, rotate: -6 }}
            animate={{ opacity: 1, x: 0, rotate: -6 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            whileHover={{ scale: 1.06, rotate: -3 }}
          >
            <span className="font-display font-black text-2xl uppercase">Time Blocked</span>
          </motion.div>

          {/* Spinning decorative ring */}
          <SpinDeco
            className="absolute top-[40%] left-[40%] w-20 h-20 border-[5px] border-dashed border-[#FF71CE] rounded-full opacity-60 pointer-events-none"
            duration={12}
          />
        </motion.div>
      </main>

      {/* ─── ZIG-ZAG DIVIDER ─── */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: 0 }}
        className="w-full h-12 pattern-zigzag opacity-100 border-y-4 border-black bg-white"
      />

      {/* ─── STAGGERED PIPELINE ─── */}
      <section
        id="pipeline"
        className="py-32 px-6 bg-[#4ECDC4] relative border-b-4 border-black overflow-hidden"
        ref={pipelineRef}
      >
        {/* Spinning ring */}
        <SpinDeco
          className="absolute top-[-50px] right-[-50px] w-64 h-64 border-[16px] border-[#FFCE5C] rounded-full opacity-50"
          duration={25}
        />
        <FloatingBlob
          className="absolute bottom-10 left-[-30px] w-32 h-32 bg-[#FF71CE] border-4 border-black rounded-full opacity-40 pointer-events-none"
          delay={2}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <RevealSection variant={slideLeft}>
            <h2 className="text-[40px] md:text-[80px] font-display font-black uppercase text-black mb-16 transform -rotate-2 inline-block bg-white border-4 border-black px-6 shadow-[8px_8px_0px_0px_#FF71CE]">
              The Method
            </h2>
          </RevealSection>

          <div className="flex flex-col gap-12">
            {[
              {
                num: "1",
                title: "Chaos Dump",
                desc: "Throw your unstructured mess at it. The AI instantly extracts structured data.",
                icon: <BrainCircuit />,
                color: "#FFCE5C",
                margin: "md:ml-0",
              },
              {
                num: "2",
                title: "Temporal Sync",
                desc: "Tasks are given physical mass and injected directly into your calendar.",
                icon: <Calendar />,
                color: "#FF71CE",
                margin: "md:ml-24",
              },
              {
                num: "3",
                title: "Execution",
                desc: "Hostile interventions if you drift. We literally call your phone.",
                icon: <Zap />,
                color: "#6A7BB4",
                margin: "md:ml-48",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                animate={pipelineInView ? "visible" : "hidden"}
                custom={i * 0.18}
                className={`bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-2xl flex flex-col md:flex-row gap-8 items-start relative ${step.margin}`}
                whileHover={{ rotate: -1, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {/* Tape graphic */}
                <div className="absolute -top-4 left-1/2 w-24 h-8 bg-white/60 border-2 border-black transform -translate-x-1/2 rotate-3 z-10 backdrop-blur-sm" />

                <motion.div
                  className="w-20 h-20 border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0"
                  style={{ backgroundColor: step.color }}
                  initial={{ rotate: -3 }}
                  animate={{ rotate: -3 }}
                  whileHover={{ rotate: 0, scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {React.cloneElement(step.icon as React.ReactElement<any>, {
                    className: "w-10 h-10 text-black",
                  })}
                </motion.div>

                <div>
                  <h3 className="text-2xl md:text-3xl font-display font-black uppercase mb-3">
                    <span className="text-[#FF71CE] mr-2">0{step.num}.</span>
                    {step.title}
                  </h3>
                  <p className="text-lg font-mono font-bold text-gray-700 leading-relaxed border-l-4 border-black pl-4">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES BENTO ─── */}
      <section
        id="features"
        className="py-32 px-6 max-w-7xl mx-auto"
        ref={featuresRef}
      >
        <RevealSection>
          <h2 className="text-[40px] md:text-[80px] font-display font-black uppercase text-black mb-16 text-center">
            Arsenal
          </h2>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[300px]">
          {/* Bento 1: Large */}
          <motion.div
            variants={slideLeft}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            custom={0}
            className="md:col-span-8 bg-white border-4 border-black p-10 shadow-[12px_12px_0px_0px_#FFCE5C] relative group overflow-hidden flex flex-col justify-end"
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 pattern-dots opacity-20 rounded-bl-full border-b-4 border-l-4 border-black" />
            <motion.div
              className="absolute top-6 left-6 bg-black text-white px-4 py-2 font-black uppercase text-sm border-2 border-black z-10 shadow-[4px_4px_0px_0px_#FF71CE]"
              animate={{ rotate: [-3, -1, -3] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              Spatial UI
            </motion.div>

            <motion.div
              animate={{ rotate: [0, 8, -4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <StickyNote className="w-16 h-16 text-[#FFCE5C] mb-6 relative z-10" />
            </motion.div>
            <h3 className="text-[32px] md:text-[40px] font-black font-display uppercase relative z-10">
              Sticky Matrix
            </h3>
            <p className="text-lg font-mono font-bold text-gray-700 max-w-md relative z-10">
              Drag, drop, and color-code raw thoughts on a chaotic 2D canvas.
            </p>
          </motion.div>

          {/* Bento 2: Tall */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            custom={0.1}
            className="md:col-span-4 md:row-span-2 bg-[#FF71CE] border-4 border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative flex flex-col items-center justify-center text-center group"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <ShieldAlert className="w-24 h-24 text-white mb-8" />
            </motion.div>
            <h3 className="text-[32px] md:text-[40px] font-black font-display uppercase text-white drop-shadow-[2px_2px_0px_black] leading-tight mb-4">
              The<br />Escalator
            </h3>
            <motion.p
              className="text-lg font-mono font-bold text-black bg-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              animate={{ rotate: [2, 4, 2, 0, 2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              We physically call your phone if you ignore your tasks.
            </motion.p>
          </motion.div>

          {/* Bento 3: Wide */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            custom={0.2}
            className="md:col-span-4 bg-white border-4 border-black p-10 shadow-[12px_12px_0px_0px_#6A7BB4] relative flex flex-col justify-end"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Timer className="w-12 h-12 text-[#6A7BB4] mb-4" />
            </motion.div>
            <h3 className="text-3xl font-black font-display uppercase mb-2">Sanctuary</h3>
            <p className="text-sm font-mono font-bold text-gray-700">
              Sprint mode to block noise. NSDR to recover.
            </p>
          </motion.div>

          {/* Bento 4: Wide */}
          <motion.div
            variants={slideRight}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            custom={0.3}
            className="md:col-span-4 bg-[#FFCE5C] border-4 border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative flex flex-col justify-end overflow-hidden"
            whileHover={{ y: -5, rotate: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            <SpinDeco
              className="absolute -bottom-10 -right-10 w-40 h-40 border-[12px] border-black rounded-full opacity-20"
              duration={15}
            />
            <motion.div
              animate={{ scale: [1, 1.12, 1], rotate: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Target className="w-12 h-12 text-black mb-4 relative z-10" />
            </motion.div>
            <h3 className="text-3xl font-black font-display uppercase mb-2 relative z-10">Gravity</h3>
            <p className="text-sm font-mono font-bold text-gray-800 relative z-10">
              Tasks have mass based on urgency.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── MASSIVE FOOTER ─── */}
      <footer
        className="w-full bg-black border-t-8 border-black pt-32 pb-12 px-6 text-center relative overflow-hidden mt-20"
        ref={footerRef}
      >
        <div className="absolute inset-0 pattern-squiggles opacity-20 filter invert pointer-events-none" />

        <FloatingBlob
          className="absolute top-20 left-10 w-24 h-24 bg-[#FF71CE] rounded-full border-4 border-white shadow-[8px_8px_0px_0px_#FFCE5C]"
          delay={0}
        />
        <FloatingBlob
          className="absolute bottom-20 right-16 w-16 h-16 bg-[#FFCE5C] rounded-full border-4 border-white shadow-[4px_4px_0px_0px_#4ECDC4] opacity-60"
          delay={1.5}
        />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={footerInView ? "visible" : "hidden"}
            className="text-[48px] md:text-[120px] text-white font-display font-black tracking-tighter uppercase leading-[0.8] mb-12"
          >
            Do The <br />
            <motion.span
              className="text-[#4ECDC4] inline-block"
              animate={{ skewX: [0, -3, 0, 3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              Work.
            </motion.span>
          </motion.h2>

          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate={footerInView ? "visible" : "hidden"}
            custom={0.25}
            whileHover={{ y: -6, rotate: 0 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 14 }}
          >
            <Link
              href="/auth"
              className="bg-[#FFCE5C] border-4 border-white text-black text-[20px] md:text-[40px] py-4 px-8 md:py-6 md:px-16 inline-flex items-center gap-6 font-black uppercase tracking-widest shadow-[12px_12px_0px_0px_#FF71CE] hover:shadow-[16px_16px_0px_0px_#FF71CE] transition-shadow transform -rotate-2 w-full justify-center sm:w-auto"
            >
              Start Now
              <motion.span
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="w-8 h-8 md:w-10 md:h-10" />
              </motion.span>
            </Link>
          </motion.div>
        </div>

        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate={footerInView ? "visible" : "hidden"}
          custom={0.5}
          className="mt-40 border-t-4 border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between text-gray-400 font-black uppercase tracking-widest text-[12px] relative z-10 max-w-7xl mx-auto"
        >
          <span>© 2026 VibeShift</span>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-[#FFCE5C] transition-colors">Twitter</a>
            <a href="#" className="hover:text-[#FF71CE] transition-colors">GitHub</a>
          </div>
        </motion.div>
      </footer>
    </div>
  );
}
