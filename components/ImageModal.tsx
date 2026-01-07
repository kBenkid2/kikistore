'use client'

import { useEffect, useState, useRef } from 'react'
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
  const [imageError, setImageError] = useState(false)
  const [mounted, setMounted] = useState(false)
  const scrollPositionRef = useRef<number>(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Preload image when modal opens
  useEffect(() => {
    if (isOpen && imageUrl) {
      setImageLoaded(false)
      setImageError(false)
      
      // Thêm preload link vào head để browser bắt đầu load sớm
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = imageUrl
      link.setAttribute('fetchpriority', 'high')
      document.head.appendChild(link)
      
      // Preload image để tăng tốc độ load
      const img = new Image()
      img.src = imageUrl
      img.onload = () => {
        setImageLoaded(true)
        setImageError(false)
        // Xóa preload link sau khi load xong
        document.head.removeChild(link)
      }
      img.onerror = () => {
        setImageError(true)
        setImageLoaded(false)
        // Xóa preload link nếu có lỗi
        if (document.head.contains(link)) {
          document.head.removeChild(link)
        }
      }
      
      return () => {
        // Cleanup: xóa preload link nếu component unmount
        if (document.head.contains(link)) {
          document.head.removeChild(link)
        }
      }
    }
  }, [isOpen, imageUrl])

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Lưu vị trí scroll hiện tại trước khi mở modal
    scrollPositionRef.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop

    // Prevent body scroll when modal is open
    const originalOverflow = document.body.style.overflow
    const originalPosition = document.body.style.position
    const originalTop = document.body.style.top
    const originalWidth = document.body.style.width
    
    // Lưu scroll position và set fixed position để prevent scroll
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollPositionRef.current}px`
    document.body.style.width = '100%'

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      
      // Restore lại các style ban đầu
      document.body.style.overflow = originalOverflow
      document.body.style.position = originalPosition
      document.body.style.top = originalTop
      document.body.style.width = originalWidth
      
      // Restore lại scroll position
      window.scrollTo(0, scrollPositionRef.current)
      
      setImageLoaded(false)
      setImageError(false)
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
        onTouchStart={(e) => e.stopPropagation()}
        style={{
          minHeight: '100vh',
          paddingTop: '2rem',
          paddingBottom: '2rem',
        }}
      >
        {/* Image Container */}
        <div className="flex items-center justify-center my-auto relative">
          {imageError ? (
            <div className="flex flex-col items-center justify-center text-white p-8">
              <div className="w-16 h-16 border-4 border-red-500 rounded-full flex items-center justify-center mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-lg font-semibold mb-2">Failed to load image</p>
              <p className="text-sm text-gray-300 text-center">Please check your connection and try again</p>
            </div>
          ) : (
            <>
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
                onLoad={() => {
                  setImageLoaded(true)
                  setImageError(false)
                }}
                onError={() => {
                  setImageError(true)
                  setImageLoaded(false)
                }}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                referrerPolicy="no-referrer-when-downgrade"
              />
              {!imageLoaded && !imageError && (
                <div className="absolute flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

