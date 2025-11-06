import { createAdminSession, verifyAdminCredentials } from '@/lib/admin-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Debug logging (remove in production)
    console.log('=== LOGIN ATTEMPT ===')
    console.log('Username received:', JSON.stringify(username))
    console.log('Password received:', JSON.stringify(password))
    console.log('Password length:', password.length)
    console.log('Password ends with space:', password.endsWith(' '))
    console.log('Password char codes:', password.split('').map((c: string) => c.charCodeAt(0)))

    // Verify credentials
    const verification = verifyAdminCredentials(username, password)
    if (!verification.valid || !verification.correctUsername) {
      console.log('❌ LOGIN FAILED')
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    console.log('✅ LOGIN SUCCESS for:', verification.correctUsername)

    // Create session with the correct username (original case)
    await createAdminSession(verification.correctUsername)

    return NextResponse.json({ 
      success: true,
      username 
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

