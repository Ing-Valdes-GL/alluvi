'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'

const SMOOTH = { stiffness: 90, damping: 22, mass: 0.5 }

// --- HERO QUI RECULE ET S'EFFACE AU SCROLL ---
export function HeroScrollFade({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const scale = useTransform(scrollY, [0, 600], [1, 0.86])
  const opacity = useTransform(scrollY, [0, 500], [1, 0])
  const y = useTransform(scrollY, [0, 600], [0, 90])

  if (reduce) return <div className={className}>{children}</div>
  return <motion.div className={className} style={{ scale, opacity, y }}>{children}</motion.div>
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1])
  return <motion.span className="inline-block mr-[0.25em]" style={{ opacity }}>{children}</motion.span>
}

// --- SECTION ÉPINGLÉE : LE TEXTE S'ILLUMINE MOT PAR MOT AVEC LE SCROLL ---
export function ScrollHighlightText({ text }: { text: string }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const words = text.split(' ')
  const textClass = 'max-w-5xl mx-auto text-3xl md:text-6xl font-semibold tracking-tight leading-[1.12] text-white text-center'

  if (reduce) {
    return (
      <section className="bg-black py-32 px-6">
        <p className={textClass}>{text}</p>
      </section>
    )
  }

  return (
    <section ref={ref} className="relative h-[220vh] bg-black">
      <div className="sticky top-0 h-screen flex items-center justify-center px-6">
        <p className={textClass} aria-label={text}>
          {words.map((word, i) => (
            <Word key={i} progress={scrollYProgress} range={[(i / words.length) * 0.85, ((i + 1) / words.length) * 0.85]}>
              {word}
            </Word>
          ))}
        </p>
      </div>
    </section>
  )
}

// --- VISUEL QUI GRANDIT EN ENTRANT DANS L'ÉCRAN ---
export function ScrollScale({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const progress = useSpring(scrollYProgress, SMOOTH)
  const scale = useTransform(progress, [0, 1], [0.6, 1])
  const opacity = useTransform(progress, [0, 0.6], [0, 1])
  const y = useTransform(progress, [0, 1], [80, 0])

  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { scale, opacity, y }}>
      {children}
    </motion.div>
  )
}

// --- BLOC QUI S'ÉLARGIT JUSQU'À SA TAILLE RÉELLE AU SCROLL ---
export function ExpandOnScroll({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.35'] })
  const progress = useSpring(scrollYProgress, SMOOTH)
  const scale = useTransform(progress, [0, 1], [0.82, 1])
  const opacity = useTransform(progress, [0, 1], [0.35, 1])

  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { scale, opacity }}>
      {children}
    </motion.div>
  )
}
