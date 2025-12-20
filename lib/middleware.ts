import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'

export function requireAuth(req: NextRequest): { userId: string; username: string } | null {
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}

export function withAuth(
  handler: (req: NextRequest, auth: { userId: string; username: string }) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const auth = requireAuth(req)
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return handler(req, auth)
  }
}

