import { deleteAdminSession } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    await deleteAdminSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

