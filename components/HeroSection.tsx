'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MessageCircle, Check } from 'lucide-react'
import { useLanguage } from './LanguageProvider'
import { getTranslation } from '@/lib/i18n'
import toast from 'react-hot-toast'

export default function HeroSection() {
  const discordUsername = 'elainedna'
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)
  const [copied, setCopied] = useState(false)
  const [showDiscordImage, setShowDiscordImage] = useState(false)

  const handleDoubleClick = async () => {
    try {
      await navigator.clipboard.writeText(discordUsername)
      setCopied(true)
      toast.success(language === 'vi' ? 'Đã copy tên Discord!' : 'Discord name copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error(language === 'vi' ? 'Lỗi khi copy' : 'Failed to copy')
    }
  }

  return (
    <div className="text-center mb-8 relative">
      <div className="overflow-hidden mb-3">
        <h1 className="text-6xl font-bold">
          <div className="flex animate-marquee">
            <span className="inline-block ice-text whitespace-nowrap px-4 text-shadow-strong">
              Kiki StoreGame
            </span>
          </div>
        </h1>
      </div>
      <p className="text-lg text-cyan-50 mb-4 font-medium drop-shadow-md animate-fade-in">
        {t('heroSubtitle')}
      </p>
      <div 
        className="relative inline-block"
        onMouseEnter={() => setShowDiscordImage(true)}
        onMouseLeave={() => setShowDiscordImage(false)}
      >
        <div 
          onDoubleClick={handleDoubleClick}
          className="inline-flex items-center gap-1.5 bg-cyan-900/60 backdrop-blur-sm border-2 border-cyan-400/70 rounded-lg px-5 py-2.5 mb-6 hover:bg-cyan-800/70 hover:border-cyan-300 hover:shadow-cyan-400/50 hover:shadow-lg transition-all duration-300 shadow-lg shadow-cyan-900/40 cursor-pointer animate-float-slow"
          title={language === 'vi' ? 'Double-click để copy' : 'Double-click to copy'}
        >
          <MessageCircle className="w-4 h-4 text-cyan-200 animate-pulse" />
          <span className="text-cyan-50 select-all text-sm font-medium">
            {t('contactDiscord')}: <span className="font-bold text-cyan-200">
              {copied ? (
                <span className="flex items-center gap-1 inline-flex text-green-300">
                  <Check className="w-3.5 h-3.5" />
                  {discordUsername}
                </span>
              ) : (
                <span className="hover:text-cyan-100 transition-colors">{discordUsername}</span>
              )}
            </span>
          </span>
        </div>

        {/* Discord Image on Hover */}
        {showDiscordImage && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50 pointer-events-none">
            <div className="relative w-[24rem] h-[24rem] bg-cyan-900/95 backdrop-blur-md border border-cyan-400/50 rounded-lg shadow-2xl shadow-cyan-900/50 overflow-hidden animate-fade-in">
              <Image
                src="/AnhDiscord.png"
                alt="Discord QR"
                fill
                className="object-contain"
                sizes="384px"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

