import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/rate-limit'

async function handler(req: NextRequest) {
  if (req.method === 'GET') {
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
      const sortedProducts = products.sort((a, b) => {
        const aOrder = categoryOrder[a.category as keyof typeof categoryOrder] || 99
        const bOrder = categoryOrder[b.category as keyof typeof categoryOrder] || 99
        if (aOrder !== bOrder) return aOrder - bOrder
        return 0
      })
      
      return NextResponse.json(sortedProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export const GET = withRateLimit(handler)

