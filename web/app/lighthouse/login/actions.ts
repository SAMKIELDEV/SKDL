'use server'

import { cookies } from 'next/headers'

export async function login(pin: string) {
  if (pin === process.env.LIGHTHOUSE_PIN) {
    const cookieStore = await cookies()
    cookieStore.set('lighthouse_auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/',
    })
    return { success: true }
  }
  return { success: false }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('lighthouse_auth')
  return { success: true }
}
