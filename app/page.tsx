import { prisma } from '@/lib/prisma'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductsByGame from '@/components/ProductsByGame'
import HeroSection from '@/components/HeroSection'

export const revalidate = 10

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isAvailable: true },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    })
    
    // Sort by category priority: ult, ring, account
    const categoryOrder = { ult: 1, ring: 2, account: 3 }
    return products.sort((a, b) => {
      const aOrder = categoryOrder[a.category as keyof typeof categoryOrder] || 99
      const bOrder = categoryOrder[b.category as keyof typeof categoryOrder] || 99
      if (aOrder !== bOrder) return aOrder - bOrder
      return 0
    })
  } catch (error) {
    return []
  }
}

export default async function Home() {
  const products = await getProducts()
  const games = ['Dungeon Quest', 'Arcane Conquest', 'Fabled Legacy', 'Pixel Blade']

  const productsByGame = games.reduce((acc, game) => {
    acc[game] = products.filter(p => p.game === game)
    return acc
  }, {} as Record<string, typeof products>)

  return (
    <div className="min-h-screen bg-water-gradient relative overflow-hidden">
      
      <Header />
      
      <main className="container mx-auto px-4 py-6 relative z-10">
        <HeroSection />
        <ProductsByGame productsByGame={productsByGame} games={games} />
      </main>

      <Footer />
    </div>
  )
}
