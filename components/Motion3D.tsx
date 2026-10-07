'use client'

import { useEffect, type MouseEvent, type ReactNode } from 'react'
import {
  motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform,
  type MotionValue,
} from 'framer-motion'

const SPRING = { stiffness: 180, damping: 18, mass: 0.6 }
const LOOP = { repeat: Infinity, ease: 'linear' as const }

// --- CARTE QUI S'INCLINE EN 3D SOUS LA SOURIS (+ REFLET) ---
export function TiltCard({ children, className = '', max = 10 }: { children: ReactNode; className?: string; max?: number }) {
  const reduce = useReducedMotion()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const glareOpacity = useSpring(0, SPRING)
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), SPRING)
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), SPRING)
  const gx = useTransform(px, (v) => `${v * 100}%`)
  const gy = useTransform(py, (v) => `${v * 100}%`)
  const glare = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.3), transparent 55%)`

  if (reduce) return <div className={className}>{children}</div>

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - rect.left) / rect.width)
    py.set((e.clientY - rect.top) / rect.height)
    glareOpacity.set(1)
  }

  const handleLeave = () => {
    px.set(0.5)
    py.set(0.5)
    glareOpacity.set(0)
  }

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000, transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-[inherit] pointer-events-none mix-blend-overlay"
        style={{ background: glare, opacity: glareOpacity }}
      />
    </motion.div>
  )
}

// --- APPARITION AU SCROLL AVEC BASCULE 3D ---
export function Reveal3D({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 60, rotateX: 35 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 1000, transformOrigin: '50% 100%' }}
    >
      {children}
    </motion.div>
  )
}

// --- FLOTTEMENT CONTINU AVEC ROTATION 3D ---
export function Float3D({ children, className = '', duration = 6, tilt = 10 }: { children: ReactNode; className?: string; duration?: number; tilt?: number }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -16, 0], rotateY: [-tilt, tilt, -tilt], rotateX: [tilt / 3, -tilt / 3, tilt / 3] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformPerspective: 900 }}
    >
      {children}
    </motion.div>
  )
}

// --- ICÔNE QUI SE RETOURNE EN 3D (ENTRÉE + SURVOL) ---
export function FlipIn({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, rotateY: -180 }}
      whileInView={{ opacity: 1, rotateY: 0 }}
      whileHover={reduce ? undefined : { rotateY: 360 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 600 }}
    >
      {children}
    </motion.div>
  )
}

// --- ROTATION 3D CONTINUE SUR L'AXE VERTICAL ---
export function Spin3D({ children, className = '', duration = 6 }: { children: ReactNode; className?: string; duration?: number }) {
  const reduce = useReducedMotion()
  if (reduce) return <span className={className}>{children}</span>
  return (
    <motion.span
      className={`inline-block ${className}`}
      animate={{ rotateY: 360 }}
      transition={{ duration, ...LOOP }}
      style={{ transformPerspective: 600 }}
    >
      {children}
    </motion.span>
  )
}

function Helix({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute ${className}`} style={{ perspective: 800 }}>
      <motion.div
        className="relative w-24 h-[320px]"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: 360 }}
        transition={{ duration: 14, ...LOOP }}
      >
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 w-full h-px bg-gradient-to-r from-[#0ea5e9] via-white/30 to-[#38bdf8]"
            style={{ top: i * 20, transform: `rotateY(${i * 26}deg)`, transformStyle: 'preserve-3d' }}
          >
            <span className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-[#0ea5e9] shadow-[0_0_12px_#0ea5e9]" />
            <span className="absolute -right-1.5 -top-1.5 w-3 h-3 rounded-full bg-white shadow-[0_0_12px_#ffffff]" />
          </div>
        ))}
      </motion.div>
    </div>
  )
}

const CUBE_FACES = [
  'rotateY(0deg)', 'rotateY(90deg)', 'rotateY(180deg)', 'rotateY(-90deg)', 'rotateX(90deg)', 'rotateX(-90deg)',
]

function Cube({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute ${className}`} style={{ perspective: 600 }}>
      <motion.div
        className="relative w-20 h-20"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateX: 360, rotateY: 360 }}
        transition={{ duration: 20, ...LOOP }}
      >
        {CUBE_FACES.map((face) => (
          <div
            key={face}
            className="absolute inset-0 border border-[#38bdf8]/60 bg-[#0ea5e9]/5"
            style={{ transform: `${face} translateZ(40px)` }}
          />
        ))}
      </motion.div>
    </div>
  )
}

function Rings({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute w-32 h-32 ${className}`} style={{ perspective: 600 }}>
      <motion.div className="absolute inset-0 rounded-full border border-[#0ea5e9]/70" animate={{ rotateX: 360 }} transition={{ duration: 9, ...LOOP }} />
      <motion.div className="absolute inset-2 rounded-full border border-white/40" animate={{ rotateY: 360 }} transition={{ duration: 12, ...LOOP }} />
      <motion.div className="absolute inset-4 rounded-full border border-[#38bdf8]/60" animate={{ rotateX: 360, rotateY: 360 }} transition={{ duration: 16, ...LOOP }} />
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#0ea5e9] shadow-[0_0_16px_#0ea5e9]" />
    </div>
  )
}

function Layer({ mx, my, depth, children }: { mx: MotionValue<number>; my: MotionValue<number>; depth: number; children: ReactNode }) {
  const x = useTransform(mx, (v) => v * depth)
  const y = useTransform(my, (v) => v * depth)
  return <motion.div className="absolute inset-0" style={{ x, y }}>{children}</motion.div>
}

// --- DÉCOR 3D D'ARRIÈRE-PLAN (HÉLICES ADN, CUBE, ANNEAUX) AVEC PARALLAXE SOURIS ---
export function Scene3D({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion()
  const mx = useSpring(0, { stiffness: 50, damping: 20 })
  const my = useSpring(0, { stiffness: 50, damping: 20 })

  useEffect(() => {
    if (reduce) return
    const handleMove = (e: globalThis.MouseEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5)
      my.set(e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [reduce, mx, my])

  if (reduce) return null

  return (
    <div aria-hidden className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`}>
      <Layer mx={mx} my={my} depth={-30}>
        <Helix className="left-[6%] top-1/2 -translate-y-1/2" />
        <Helix className="right-[6%] top-1/2 -translate-y-1/2" />
      </Layer>
      <Layer mx={mx} my={my} depth={60}>
        <Cube className="left-[24%] top-[14%]" />
        <Rings className="right-[22%] bottom-[22%]" />
      </Layer>
    </div>
  )
}
