import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'License keys are no longer supported. Sign in to activate Cutly.' },
    { status: 410 }
  )
}
