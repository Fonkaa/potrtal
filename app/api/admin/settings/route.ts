import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    const cutoffSetting = await prisma.setting.findUnique({
      where: { key: 'PASS_CUTOFF' },
    })
    return NextResponse.json({ cutoff: cutoffSetting ? cutoffSetting.value : '15' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ cutoff: '15' }, { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { cutoff, newEmail, newPassword } = body

    if (cutoff !== undefined) {
      await prisma.setting.upsert({
        where: { key: 'PASS_CUTOFF' },
        update: { value: cutoff.toString() },
        create: { key: 'PASS_CUTOFF', value: cutoff.toString() },
      })
    }

    if (newEmail || newPassword) {
      const admin = await prisma.admin.findFirst()
      if (admin) {
        const updateData: any = {}
        if (newEmail) updateData.email = newEmail
        if (newPassword) updateData.password = await bcrypt.hash(newPassword, 10)

        await prisma.admin.update({
          where: { id: admin.id },
          data: updateData,
        })
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}