import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const email = (process.argv[2] || '').trim().toLowerCase()
if (!email) {
  console.error('Usage: npm run admin:promote -- you@example.com')
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter, log: ['error'] })

try {
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
    select: { id: true, email: true, name: true, role: true },
  })
  console.log('Promoted to ADMIN:', user)
} catch (err) {
  if (err.code === 'P2025') {
    console.error(`No user found with email ${email}. Sign up first, then re-run.`)
  } else {
    console.error('Failed:', err.message)
  }
  process.exit(1)
} finally {
  await prisma.$disconnect()
}
