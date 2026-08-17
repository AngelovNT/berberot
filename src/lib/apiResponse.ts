import { NextResponse } from 'next/server'

export const ok = (data: unknown, status = 200) =>
  NextResponse.json({ success: true, data }, { status })

export const err = (message: string, status = 400) =>
  NextResponse.json({ success: false, message }, { status })
