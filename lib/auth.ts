import { compare, hash } from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production'

export interface AuthToken {
  userId: string
  username: string
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword)
}

export function generateToken(userId: string, username: string): string {
  return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): AuthToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthToken
  } catch {
    return null
  }
}

export async function authenticateAdmin(
  username: string,
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  const admin = await prisma.admin.findUnique({
    where: { username },
  })

  if (!admin) {
    return { success: false, error: 'Invalid credentials' }
  }

  const isValid = await verifyPassword(password, admin.password)
  if (!isValid) {
    return { success: false, error: 'Invalid credentials' }
  }

  const token = generateToken(admin.id, admin.username)
  return { success: true, token }
}

