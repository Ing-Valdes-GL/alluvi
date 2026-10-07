'use client'

import { useRef, type MouseEvent, type ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const

// --- BARRE DE PROGRESSION DU SCROLL ---
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25 })
  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-1 origin-left z-[60] bg-gradient-to-r from-[#0ea5e9] via-[#38bdf8] to-[#1e3a8a]"
      style={{ scaleX }}
    />
  )
}

// --- TITRE RÉVÉLÉ MOT PAR MOT (EFFET MASQUE) ---
export function SplitText({ lines, delay = 0 }: { lines: string[]; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.span
      className="block"
      aria-label={lines.join(' ')}
      initial={reduce ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: delay } } }}
    >
      {lines.map((line, i) => (
        <span key={i} className="block" aria-hidden>
          {line.split(' ').map((word, j) => (
            <span key={j} className="inline-block overflow-hidden align-bottom py-[0.12em] -my-[0.12em] mr-[0.25em] last:mr-0">
              <motion.span
                className="inline-block"
                variants={{ hidden: { y: '115%' }, show: { y: 0, transition: { duration: 0.7, ease: EASE } } }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </span>
      ))}
    </motion.span>
  )
}

// --- APPARITION EN FONDU VERS LE HAUT ---
export function FadeUp({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

// --- TRAIT D'ACCENT QUI SE DESSINE ---
export function DrawLine({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.span
      aria-hidden
      className={`block h-1 w-24 rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#1e3a8a] ${className}`}
      initial={reduce ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
    />
  )
}

// --- BOUTON MAGNÉTIQUE (SUIT LE CURSEUR) ---
export function Magnetic({ children, className = '', strength = 0.35 }: { children: ReactNode; className?: string; strength?: number }) {
  const reduce = useReducedMotion()
  const x = useSpring(0, { stiffness: 200, damping: 15 })
  const y = useSpring(0, { stiffness: 200, damping: 15 })

  if (reduce) return <div className={`inline-block ${className}`}>{children}</div>

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength)
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength)
  }

  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div className={`inline-block ${className}`} style={{ x, y }} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </motion.div>
  )
}

// --- REFLET LUMINEUX QUI BALAIE UN BOUTON (PARENT : relative overflow-hidden) ---
export function Shimmer() {
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <motion.span
      aria-hidden
      className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
      animate={{ x: ['-150%', '450%'] }}
      transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.2, ease: 'easeInOut' }}
    />
  )
}

// --- HALOS DE COULEUR EN MOUVEMENT LENT ---
export function Aurora({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <div aria-hidden className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`}>
      <motion.div
        className="absolute -top-20 left-[10%] w-[420px] h-[420px] rounded-full bg-[#0ea5e9]/25 blur-[110px]"
        animate={{ x: [0, 120, -40, 0], y: [0, 60, 120, 0], scale: [1, 1.25, 0.9, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-[8%] w-[380px] h-[380px] rounded-full bg-[#1e3a8a]/50 blur-[110px]"
        animate={{ x: [0, -140, 30, 0], y: [0, -80, -20, 0], scale: [1, 0.85, 1.2, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 left-1/2 w-[260px] h-[260px] rounded-full bg-[#00A699]/20 blur-[100px]"
        animate={{ x: [-130, 60, -200, -130], y: [0, -70, 50, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// --- DÉPLACEMENT VERTICAL LIÉ AU SCROLL ---
export function ParallaxY({ children, className = '', distance = 60 }: { children: ReactNode; className?: string; distance?: number }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance])
  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { y }}>
      {children}
    </motion.div>
  )
}
