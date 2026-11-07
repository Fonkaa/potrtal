import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
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
    const body = await request.json()
    const { id, studentId, name, score } = body

    if (!studentId || !name) {
      return NextResponse.json({ error: 'Student ID and Name are required' }, { status: 400 })
    }

    const parsedScore = score !== undefined && score !== null && score !== '' ? parseFloat(score) : null

    let savedResult

    if (id) {
      // If an explicit row ID is provided, update that specific record (used when editing existing entries)
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
      // NEW REGISTRATION: Always create a completely fresh record. 
      // This ensures that deleted students can be re-registered as fresh new entries.
      savedResult = await prisma.result.create({
        data: {
          studentId,
          name,
          score: parsedScore, // Defaults to null for new registrations
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