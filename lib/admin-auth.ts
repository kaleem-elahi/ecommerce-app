import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Admin credentials
const ADMIN_USERS = {
  Kaleem: 'theagatecity@ks',
  Shahrukh: 'theagatecity@sk',
}

export interface AdminUser {
  username: string
}

const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Verify admin credentials and return the correct username if valid
 */
export function verifyAdminCredentials(
  username: string,
  password: string
): { valid: boolean; correctUsername?: string } {
  // Normalize username (trim and handle case)
  const normalizedUsername = username.trim()
  
  // Find matching user (case-insensitive)
  const userKey = Object.keys(ADMIN_USERS).find(
    key => key.toLowerCase() === normalizedUsername.toLowerCase()
  ) as keyof typeof ADMIN_USERS | undefined
  
  if (!userKey) {
    console.log('User not found:', normalizedUsername)
    return { valid: false }
  }
  
  const adminPassword = ADMIN_USERS[userKey]
  
  // Debug: Log password comparison details
  console.log('Password comparison:', {
    userKey,
    providedPasswordLength: password.length,
    storedPasswordLength: adminPassword.length,
    passwordsMatch: adminPassword === password,
    providedPasswordEndsWithSpace: password.endsWith(' '),
    storedPasswordEndsWithSpace: adminPassword.endsWith(' '),
  })
  
  // Compare passwords exactly (including trailing spaces)
  const isValid = adminPassword === password
  
  return {
    valid: isValid,
    correctUsername: isValid ? userKey : undefined
  }
}

/**
 * Create admin session
 */
export async function createAdminSession(username: string): Promise<void> {
  const cookieStore = await cookies()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)
  
  cookieStore.set(SESSION_COOKIE_NAME, username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
}

/**
 * Get current admin user from session
 */
export async function getAdminSession(): Promise<AdminUser | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE_NAME)
  
  if (!session?.value) {
    return null
  }
  
  const username = session.value
  if (username in ADMIN_USERS) {
    return { username }
  }
  
  return null
}

/**
 * Delete admin session (logout)
 */
export async function deleteAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

/**
 * Require admin authentication - redirects to login if not authenticated
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminSession()
  
  if (!admin) {
    redirect('/admin-login')
  }
  
  return admin
}

