import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { withRateLimit } from '@/lib/rate-limit'

async function handler(req: NextRequest) {
  const auth = requireAuth(req)
  if (!auth) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json()
      const { products } = body

      if (!products || !Array.isArray(products)) {
        return NextResponse.json(
          { error: 'Invalid request body' },
          { status: 400 }
        )
      }

      // Log admin action
      console.info(`[ADMIN] Products reordered`, {
        timestamp: new Date().toISOString(),
        admin: auth.username,
        productCount: products.length,
      })

      // Update all products in a transaction
      await prisma.$transaction(
        products.map((p: { id: string; order: number }) =>
          prisma.product.update({
            where: { id: p.id },
            data: { order: p.order },
          })
        )
      )

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error reordering products:', error)
      return NextResponse.json(
        { error: 'Failed to reorder products' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export const POST = withRateLimit(handler)

