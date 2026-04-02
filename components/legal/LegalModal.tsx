'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { ReactNode } from 'react'

interface LegalModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function LegalModal({ isOpen, onClose, title, children }: LegalModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[200]"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[85vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-all duration-200 group"
                  aria-label="Close modal"
                >
                  <X size={20} className="group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>
              
              {/* Scrollable Content */}
              <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-6 sm:p-8 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {children}
              </div>
              
              {/* Footer */}
              <div className="sticky bottom-0 px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-gray-800/50">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto sm:ml-auto sm:block bg-[#0ea5e9] hover:bg-sky-600 text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 active:scale-95"
                >
                  I Understand & Close
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
