import { NextRequest } from 'next/server'

// Separate rate limiter for login endpoint (stricter limits)
const loginAttempts = new Map<string, { count: number; resetTime: number; blocked: boolean }>()

const LOGIN_RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_LOGIN_ATTEMPTS = 5 // Max 5 login attempts per minute per IP
const BLOCK_DURATION = 15 * 60 * 1000 // Block for 15 minutes after max attempts

export interface LoginRateLimitResult {
  allowed: boolean
  remaining: number
  retryAfter?: number
  blocked: boolean
}

export function loginRateLimit(req: NextRequest): LoginRateLimitResult {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             req.headers.get('x-real-ip') ||
             'unknown'
  
  const now = Date.now()
  const record = loginAttempts.get(ip)

  // Check if IP is blocked
  if (record?.blocked) {
    if (now < record.resetTime) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000)
      return {
        allowed: false,
        remaining: 0,
        retryAfter,
        blocked: true,
      }
    } else {
      // Block expired, reset
      loginAttempts.delete(ip)
    }
  }

  // New window or expired window
  if (!record || now > record.resetTime) {
    loginAttempts.set(ip, {
      count: 1,
      resetTime: now + LOGIN_RATE_LIMIT_WINDOW,
      blocked: false,
    })
    return {
      allowed: true,
      remaining: MAX_LOGIN_ATTEMPTS - 1,
      blocked: false,
    }
  }

  // Increment attempt count
  record.count++

  // Block if exceeded max attempts
  if (record.count > MAX_LOGIN_ATTEMPTS) {
    record.blocked = true
    record.resetTime = now + BLOCK_DURATION
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil(BLOCK_DURATION / 1000),
      blocked: true,
    }
  }

  return {
    allowed: true,
    remaining: MAX_LOGIN_ATTEMPTS - record.count,
    blocked: false,
  }
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of Array.from(loginAttempts.entries())) {
    if (now > record.resetTime && !record.blocked) {
      loginAttempts.delete(ip)
    }
  }
}, LOGIN_RATE_LIMIT_WINDOW)

