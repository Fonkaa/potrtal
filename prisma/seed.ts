import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // Create default admin user
  await prisma.admin.upsert({
    where: { email: 'admin@portal.com' },
    update: {},
    create: {
      email: 'admin@portal.com',
      password: hashedPassword,
    },
  })

  // Create default passing cutoff score
  await prisma.setting.upsert({
    where: { key: 'PASS_CUTOFF' },
    update: {},
    create: {
      key: 'PASS_CUTOFF',
      value: '50',
    },
  })

  console.log('Database seeded successfully: admin@portal.com / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })