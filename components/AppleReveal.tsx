'use client'

import { useEffect } from 'react'

// Blocs animés automatiquement sur toutes les pages
const TARGETS = 'h1, h2, h3, .grid > *, form, table, img'
// Zones jamais animées (navigation, fenêtres modales, pages qui gèrent leurs propres animations)
const EXCLUDED = 'header, nav, [role="dialog"], [data-no-reveal]'
const CLEANUP_MS = 1600
// Éléments déjà traités (mémorisés hors du DOM pour ne pas gêner l'hydratation de React)
const seen = new WeakSet<Element>()

function isFixed(el: Element) {
  for (let node: Element | null = el; node && node !== document.body; node = node.parentElement) {
    if (getComputedStyle(node).position === 'fixed') return true
  }
  return false
}

function canReveal(el: HTMLElement) {
  if (seen.has(el)) return false
  if (el.closest(EXCLUDED)) return false
  // Un parent déjà animé emporte ses enfants avec lui
  if (el.parentElement?.closest('[data-reveal]')) return false
  // Éléments déjà pilotés par framer-motion ou dont l'opacité est fixée par une classe
  const inline = el.getAttribute('style') || ''
  if (/transform|opacity/.test(inline) || /(^|\s)opacity-/.test(el.className)) return false
  if (el.tagName === 'IMG' && el.getBoundingClientRect().width < 160) return false
  return !isFixed(el)
}

// --- APPARITION AU SCROLL FAÇON APPLE, APPLIQUÉE À TOUT LE SITE ---
export default function AppleReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target as HTMLElement
        io.unobserve(el)
        requestAnimationFrame(() => el.setAttribute('data-reveal', 'in'))
        setTimeout(() => {
          el.removeAttribute('data-reveal')
          el.removeAttribute('data-reveal-delay')
        }, CLEANUP_MS)
      }
    }, { rootMargin: '0px 0px -8% 0px' })

    const prepare = (root: ParentNode, skipVisible: boolean) => {
      const found: HTMLElement[] = []
      if (root instanceof HTMLElement && root.matches(TARGETS)) found.push(root)
      root.querySelectorAll<HTMLElement>(TARGETS).forEach((el) => found.push(el))

      for (const el of found) {
        if (!canReveal(el)) continue
        seen.add(el)
        // Au premier affichage, le contenu déjà visible reste en place (pas de clignotement)
        if (skipVisible && el.getBoundingClientRect().top < window.innerHeight) continue
        const index = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0
        el.setAttribute('data-reveal', '')
        if (index % 4) el.setAttribute('data-reveal-delay', String(index % 4))
        io.observe(el)
      }
    }

    // Contenu ajouté ensuite : navigation entre pages, produits chargés depuis Supabase...
    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) prepare(node, false)
        })
      }
    })

    // On attend la fin de l'hydratation avant de toucher au DOM rendu par le serveur
    const start = setTimeout(() => {
      prepare(document.body, true)
      mo.observe(document.body, { childList: true, subtree: true })
    }, 500)

    return () => {
      clearTimeout(start)
      io.disconnect()
      mo.disconnect()
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        el.removeAttribute('data-reveal')
        el.removeAttribute('data-reveal-delay')
      })
    }
  }, [])

  return null
}
