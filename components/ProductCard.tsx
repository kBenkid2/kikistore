'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Package, Gamepad2, Clock, CheckCircle2, XCircle, MessageCircle } from 'lucide-react'
import ImageModal from './ImageModal'
import { useLanguage } from './LanguageProvider'
import { getTranslation } from '@/lib/i18n'

interface Product {
  id: string
  name: string
  description: string | null
  category: string
  game: string
  price: string | null
  imageUrl: string | null
  isAvailable: boolean
  stock: number | null
  updatedAt: string | Date
}

interface ProductCardProps {
  product: Product
}

const categoryIcons = {
  item: Package,
  account: Gamepad2,
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewPosition, setPreviewPosition] = useState<{ top: number; left: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const Icon = categoryIcons[product.category as keyof typeof categoryIcons] || Package
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)
  const discordUsername = 'elainedna'

  const formatDate = (date: string | Date) => {
    const d = new Date(date)
    if (language === 'vi') {
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  const calculatePreviewPosition = (rect: DOMRect): { top: number; left: number } => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const previewWidth = 288
    const previewHeight = 320
    const gap = 12
    
    // Calculate button area (bottom ~50px of card)
    const buttonAreaTop = rect.bottom - 50
    const buttonAreaBottom = rect.bottom
    
    let left = 0
    let top = rect.top
    
    if (rect.right + previewWidth + gap <= viewportWidth) {
      left = rect.right + gap
      // Position above button area
      top = Math.max(gap, buttonAreaTop - previewHeight - gap)
      if (top + previewHeight > buttonAreaTop) {
        // If preview would overlap button, position below card
        top = rect.bottom + gap
      }
    } else if (rect.left - previewWidth - gap >= 0) {
      left = rect.left - previewWidth - gap
      top = Math.max(gap, buttonAreaTop - previewHeight - gap)
      if (top + previewHeight > buttonAreaTop) {
        top = rect.bottom + gap
      }
    } else {
      // Center position - prefer above button
      left = Math.max(gap, Math.min(rect.left + (rect.width / 2) - (previewWidth / 2), viewportWidth - previewWidth - gap))
      top = buttonAreaTop - previewHeight - gap
      if (top < gap || top + previewHeight > buttonAreaTop) {
        // If not enough space above, show below card
        top = rect.bottom + gap
      }
    }
    
    return { top, left }
  }

  const handleImageMouseEnter = () => {
    if (!product.imageUrl || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setPreviewPosition(calculatePreviewPosition(rect))
    setShowPreview(true)
    
    // Preload image khi hover để tăng tốc độ khi click
    if (product.imageUrl) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = product.imageUrl
      link.setAttribute('fetchpriority', 'high')
      // Chỉ thêm nếu chưa có
      if (!document.querySelector(`link[href="${product.imageUrl}"]`)) {
        document.head.appendChild(link)
      }
    }
  }

  useEffect(() => {
    if (!showPreview || !cardRef.current) return
    
    const handleScroll = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect()
        setPreviewPosition(calculatePreviewPosition(rect))
      }
    }
    
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [showPreview])

  return (
    <>
      <div 
        ref={cardRef}
        className="relative bg-cyan-900/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg hover:border-cyan-400/60 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-900/40 hover:-translate-y-1 group flex flex-col h-full"
      >
        {/* Image Section - Fixed Height */}
        <div className="overflow-hidden rounded-lg flex-shrink-0">
          <div 
            className="relative w-full h-40 bg-cyan-900/50 cursor-pointer overflow-hidden"
            onClick={() => product.imageUrl && setIsModalOpen(true)}
            onMouseEnter={handleImageMouseEnter}
            onMouseLeave={() => {
              setShowPreview(false)
              setPreviewPosition(null)
            }}
            onTouchStart={() => {
              // Preload image khi touch trên mobile để tăng tốc độ khi click
              if (product.imageUrl) {
                const link = document.createElement('link')
                link.rel = 'preload'
                link.as = 'image'
                link.href = product.imageUrl
                link.setAttribute('fetchpriority', 'high')
                // Chỉ thêm nếu chưa có
                if (!document.querySelector(`link[href="${product.imageUrl}"]`)) {
                  document.head.appendChild(link)
                }
              }
            }}
            style={{ 
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon className="w-12 h-12 text-cyan-600/50" />
              </div>
            )}
            <div className="absolute top-1.5 left-1.5 z-10">
              <span className="px-1.5 py-0.5 bg-cyan-600/80 backdrop-blur-sm rounded text-[10px] font-semibold text-white shadow-lg shadow-cyan-900/50">
                {product.category === 'ult' ? 'Ult' : 
                 product.category === 'ring' ? 'Ring' : 
                 product.category === 'account' ? 'Account' : 
                 t(`category.${product.category}`) || product.category}
              </span>
            </div>
            {product.imageUrl && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold">
                  Click to view full image
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content Section - Flexible, takes remaining space */}
        <div className="p-3 flex flex-col flex-1 min-h-0">
          {/* Content - Can grow */}
          <div className="flex-grow min-h-0">
            <h3 className="text-sm font-semibold text-cyan-100 line-clamp-2 mb-1.5">
              {product.name}
            </h3>
            <p className="text-xs text-cyan-300 mb-1.5 font-medium">
              {product.game}
            </p>

            {product.description && (
              <p className="text-xs text-cyan-200/80 mb-2 line-clamp-2">
                {product.description}
              </p>
            )}

            {product.price && (
              <p className="text-base font-bold text-green-400 mb-2.5">
                {product.price}
              </p>
            )}
          </div>

          {/* Stock Badge - Show for account category or when stock is set - On its own line */}
          {product.stock !== null && product.stock !== undefined && (
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold mb-2 w-fit ${
              product.stock > 0 
                ? 'bg-green-600/20 text-green-400 border border-green-500/50' 
                : 'bg-red-600/20 text-red-400 border border-red-500/50'
            }`}>
              <span>Stock: {product.stock}</span>
            </div>
          )}

          {/* Fixed Bottom Section - Status, Date, and Button - Always at bottom */}
          <div className="flex-shrink-0 mt-auto">
            {/* Status and Update Date - Above Button */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              {/* Status Badge */}
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-semibold backdrop-blur-sm shadow-md ${
                product.isAvailable 
                  ? 'bg-green-500/90 text-white' 
                  : 'bg-red-500/90 text-white'
              }`}>
                {product.isAvailable ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                <span>{t(`status.${product.isAvailable ? 'available' : 'soldOut'}`)}</span>
              </div>
              
              {/* Update Date */}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-cyan-900/90 backdrop-blur-sm rounded text-[10px] text-cyan-100 shadow-md">
                <Clock className="w-3 h-3" />
                <span>{formatDate(product.updatedAt)}</span>
              </div>
            </div>

            {/* Contact Button - Always visible */}
            <button
              onClick={() => {
                const discordId = process.env.NEXT_PUBLIC_DISCORD_ID
                if (discordId) {
                  window.open(`https://discord.com/users/${discordId}`, '_blank')
                } else {
                  window.open(`https://discord.com/users/${discordUsername}`, '_blank')
                }
              }}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold py-2 px-3 rounded transition-all duration-300 shadow-lg shadow-cyan-900/50 hover:shadow-xl hover:shadow-cyan-800/60 flex items-center justify-center gap-1.5 relative z-20"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{t('contactDiscordBtn')}</span>
            </button>
          </div>
        </div>
      </div>

      {mounted && showPreview && product.imageUrl && previewPosition && createPortal(
        <div 
          className="fixed z-[9999] w-72 bg-cyan-900/95 backdrop-blur-md border border-cyan-400/50 rounded-lg shadow-2xl shadow-cyan-900/50 overflow-hidden"
          style={{
            top: `${previewPosition.top}px`,
            left: `${previewPosition.left}px`,
            opacity: 1,
            transition: 'opacity 0.2s ease-out',
            pointerEvents: 'auto'
          }}
          onMouseEnter={() => setShowPreview(true)}
          onMouseLeave={() => {
            setShowPreview(false)
            setPreviewPosition(null)
          }}
        >
          <div className="relative w-full h-56 bg-cyan-900/50">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain"
              sizes="288px"
            />
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 bg-cyan-600/90 backdrop-blur-sm rounded text-xs font-semibold text-white shadow-lg">
                {product.category === 'ult' ? 'Ult' : 
                 product.category === 'ring' ? 'Ring' : 
                 product.category === 'account' ? 'Account' : 
                 t(`category.${product.category}`) || product.category}
              </span>
            </div>
          </div>
          <div className="p-3">
            <h3 className="text-sm font-bold text-cyan-100 mb-1 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-xs text-cyan-300 mb-1.5 font-medium">
              {product.game}
            </p>
            {product.description && (
              <p className="text-xs text-cyan-200/90 mb-1.5 line-clamp-2">
                {product.description}
              </p>
            )}
            {product.price && (
              <p className="text-base font-bold text-green-400">
                {product.price}
              </p>
            )}
          </div>
        </div>,
        document.body
      )}
      
      {product.imageUrl && (
        <ImageModal
          imageUrl={product.imageUrl}
          alt={product.name}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}

