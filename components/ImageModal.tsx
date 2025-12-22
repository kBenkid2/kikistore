'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ImageModalProps {
  imageUrl: string
  alt: string
  isOpen: boolean
  onClose: () => void
}

export default function ImageModal({ imageUrl, alt, isOpen, onClose }: ImageModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Prevent body scroll when modal is open
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    
    // Scroll to top of viewport to ensure modal is visible
    const scrollY = window.scrollY
    window.scrollTo(0, 0)

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = originalOverflow
      window.scrollTo(0, scrollY)
      setImageLoaded(false)
    }
  }, [isOpen, onClose])

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        position: 'fixed',
      }}
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[10000] text-white hover:text-gray-300 transition-colors bg-black/50 hover:bg-black/70 rounded-full p-2 backdrop-blur-sm"
        aria-label="Close"
        style={{
          position: 'fixed',
        }}
      >
        <X className="w-6 h-6" />
      </button>

      {/* Scrollable Container */}
      <div
        className="w-full h-full overflow-y-auto overflow-x-hidden flex items-center justify-center p-4 md:p-8"
        onClick={(e) => e.stopPropagation()}
        style={{
          minHeight: '100vh',
          paddingTop: '2rem',
          paddingBottom: '2rem',
        }}
      >
        {/* Image Container */}
        <div className="flex items-center justify-center my-auto">
          <img
            src={imageUrl}
            alt={alt}
            className={`max-w-full max-h-[calc(100vh-4rem)] w-auto h-auto object-contain ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } transition-opacity duration-200`}
            style={{
              maxWidth: 'min(90vw, 1200px)',
              maxHeight: 'calc(100vh - 4rem)',
            }}
            onLoad={() => setImageLoaded(true)}
            onClick={(e) => e.stopPropagation()}
          />
          {!imageLoaded && (
            <div className="absolute flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

