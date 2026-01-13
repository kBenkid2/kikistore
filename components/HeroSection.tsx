'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MessageCircle, Check } from 'lucide-react'
import { useLanguage } from './LanguageProvider'
import { getTranslation } from '@/lib/i18n'
import toast from 'react-hot-toast'

// Facebook Icon Component
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

export default function HeroSection() {
  const discordUsername = 'elainedna'
  const facebookUrl = 'https://www.facebook.com/van.vu.58402'
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
      
      {/* Contact Section */}
      <div className="flex flex-col items-center gap-3">
        {/* Discord Contact */}
        <div 
          className="relative inline-block"
          onMouseEnter={() => setShowDiscordImage(true)}
          onMouseLeave={() => setShowDiscordImage(false)}
        >
          <div 
            onDoubleClick={handleDoubleClick}
            className="inline-flex items-center gap-1.5 bg-cyan-900/60 backdrop-blur-sm border-2 border-cyan-400/70 rounded-lg px-5 py-2.5 hover:bg-cyan-800/70 hover:border-cyan-300 hover:shadow-cyan-400/50 hover:shadow-lg transition-all duration-300 shadow-lg shadow-cyan-900/40 cursor-pointer animate-float-slow"
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

        {/* Facebook Contact */}
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-blue-900/60 backdrop-blur-sm border-2 border-blue-400/70 rounded-lg px-5 py-2.5 hover:bg-blue-800/70 hover:border-blue-300 hover:shadow-blue-400/50 hover:shadow-lg transition-all duration-300 shadow-lg shadow-blue-900/40 cursor-pointer animate-float-slow"
          title={t('contactFacebook')}
        >
          <FacebookIcon className="w-4 h-4 text-blue-200" />
          <span className="text-cyan-50 text-sm font-medium">
            {t('contactFacebook')}: <span className="font-bold text-blue-200 hover:text-blue-100 transition-colors">Van Vu</span>
          </span>
        </a>
      </div>
    </div>
  )
}

