import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/auth'
import { loginRateLimit } from '@/lib/login-rate-limit'

async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )
  }

  // Apply strict rate limiting for login endpoint
  const rateLimitResult = loginRateLimit(req)
  
  if (!rateLimitResult.allowed) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               req.headers.get('x-real-ip') ||
               'unknown'
    
    // Log failed login attempt (rate limited)
    console.warn(`[SECURITY] Login rate limit exceeded for IP: ${ip}`, {
      timestamp: new Date().toISOString(),
      ip,
      retryAfter: rateLimitResult.retryAfter,
      blocked: rateLimitResult.blocked,
    })

    return NextResponse.json(
      { 
        error: rateLimitResult.blocked 
          ? `Too many login attempts. Please try again after ${Math.ceil((rateLimitResult.retryAfter || 0) / 60)} minutes.`
          : 'Too many login attempts. Please try again later.',
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
        },
      }
    )
  }

  try {
    const body = await req.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               req.headers.get('x-real-ip') ||
               'unknown'

    const result = await authenticateAdmin(username, password)

    if (!result.success) {
      // Log failed login attempt
      console.warn(`[SECURITY] Failed login attempt`, {
        timestamp: new Date().toISOString(),
        username,
        ip,
        userAgent: req.headers.get('user-agent'),
      })

      return NextResponse.json(
        { error: result.error || 'Invalid credentials' },
        { 
          status: 401,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          },
        }
      )
    }

    // Log successful login
    console.info(`[AUTH] Successful login`, {
      timestamp: new Date().toISOString(),
      username,
      ip,
    })

    return NextResponse.json(
      { token: result.token },
      {
        headers: {
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        },
      }
    )
  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = handler

