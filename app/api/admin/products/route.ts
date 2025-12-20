import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { withRateLimit } from '@/lib/rate-limit'
import {
  sanitizeProductName,
  sanitizeProductDescription,
  sanitizeGameName,
  sanitizePrice,
} from '@/lib/sanitize'

async function handler(req: NextRequest) {
  const auth = requireAuth(req)
  if (!auth) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  if (req.method === 'GET') {
    try {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(products)
    } catch (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json()
      let { name, description, category, game, price, imageUrl, isAvailable } = body

      if (!name || !category || !game) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      // Sanitize all user inputs
      name = sanitizeProductName(name)
      description = sanitizeProductDescription(description)
      game = sanitizeGameName(game)
      price = sanitizePrice(price)
      
      // Validate category
      const allowedCategories = ['item', 'account']
      if (!allowedCategories.includes(category)) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        )
      }

      // Log admin action
      console.info(`[ADMIN] Product created`, {
        timestamp: new Date().toISOString(),
        admin: auth.username,
        productName: name,
        game,
      })

      const product = await prisma.product.create({
        data: {
          name,
          description,
          category,
          game,
          price,
          imageUrl,
          isAvailable: isAvailable !== undefined ? isAvailable : true,
        },
      })

      return NextResponse.json(product, { status: 201 })
    } catch (error) {
      console.error('Error creating product:', error)
      return NextResponse.json(
        { error: 'Failed to create product' },
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
export const POST = withRateLimit(handler)

