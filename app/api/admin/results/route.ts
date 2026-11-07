import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build' || !process.env.DATABASE_URL) {
      return NextResponse.json([], { status: 200 })
    }

    const results = await prisma.result.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build' || !process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Service initializing' }, { status: 503 })
    }

    const body = await request.json()
    const { id, studentId, name, score } = body

    if (!studentId || !name) {
      return NextResponse.json({ error: 'Student ID and Name are required' }, { status: 400 })
    }

    const parsedScore = score !== undefined && score !== null && score !== '' ? parseFloat(score) : null

    let savedResult

    if (id) {
      savedResult = await prisma.result.update({
        where: { id },
        data: {
          studentId,
          name,
          score: parsedScore,
          rank: 0,
        },
      })
    } else {
      savedResult = await prisma.result.create({
        data: {
          studentId,
          name,
          score: parsedScore,
          rank: 0,
        },
      })
    }

    return NextResponse.json({ success: true, data: savedResult }, { status: 200 })
  } catch (error) {
    console.error('Error saving result:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build' || !process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Service initializing' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Result ID is required' }, { status: 400 })
    }

    await prisma.result.delete({
      where: { id },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting result:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}