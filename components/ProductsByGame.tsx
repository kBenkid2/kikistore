'use client'

import { useState } from 'react'
import ProductCard from './ProductCard'
import { ChevronDown, ChevronUp } from 'lucide-react'
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

interface ProductsByGameProps {
  productsByGame: Record<string, Product[]>
  games: string[]
}

export default function ProductsByGame({ productsByGame, games }: ProductsByGameProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set(games))
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)

  const toggleGame = (game: string) => {
    const newExpanded = new Set(expandedGames)
    if (newExpanded.has(game)) {
      newExpanded.delete(game)
    } else {
      newExpanded.add(game)
    }
    setExpandedGames(newExpanded)
  }

  const allProducts = Object.values(productsByGame).flat()
  const hasProducts = allProducts.length > 0

  if (!hasProducts) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-xl">{t('noProducts')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5 justify-center mb-4">
        <button
          onClick={() => setSelectedGame(null)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-300 ${
            selectedGame === null
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50'
              : 'bg-cyan-900/50 text-cyan-200 hover:bg-cyan-800/60 hover:text-cyan-100'
          }`}
        >
          {t('filter.all')}
        </button>
        {games.map((game) => {
          const count = productsByGame[game]?.length || 0
          if (count === 0) return null
          return (
            <button
              key={game}
              onClick={() => setSelectedGame(game)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-300 ${
                selectedGame === game
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50'
                  : 'bg-cyan-900/50 text-cyan-200 hover:bg-cyan-800/60 hover:text-cyan-100'
              }`}
            >
              {game} ({count})
            </button>
          )
        })}
      </div>

      {selectedGame ? (
        productsByGame[selectedGame] && productsByGame[selectedGame].length > 0 ? (
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-200 to-cyan-100 bg-clip-text text-transparent mb-3">{selectedGame}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {productsByGame[selectedGame].map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-cyan-200 text-base">
              {language === 'vi' ? 'Không có sản phẩm nào cho game này.' : 'No products available for this game.'}
            </p>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {games.map((game) => {
            const gameProducts = productsByGame[game] || []
            if (gameProducts.length === 0) return null

            const isExpanded = expandedGames.has(game)

            return (
              <div key={game} className="bg-cyan-900/30 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-3 hover:border-cyan-400/40 transition-all duration-300 shadow-lg shadow-cyan-900/20">
                <button
                  onClick={() => toggleGame(game)}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-200 to-cyan-100 bg-clip-text text-transparent">
                    {game} <span className="text-xs text-cyan-300 font-normal">({gameProducts.length})</span>
                  </h2>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-cyan-300" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-cyan-300" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {gameProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

