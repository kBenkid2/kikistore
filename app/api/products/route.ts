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
      
      // Return products in the order set by admin (no additional sorting)
      return NextResponse.json(products)
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

