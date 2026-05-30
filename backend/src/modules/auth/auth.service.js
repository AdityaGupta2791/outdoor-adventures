import { prisma } from '../../config/db.js'
import { hashPassword, verifyPassword } from '../../lib/auth.js'

class AuthError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  emailVerified: true,
  avatarUrl: true,
  createdAt: true,
}

// Link any guest bookings made with this email to the user account.
async function linkGuestBookings(userId, email) {
  await prisma.booking.updateMany({
    where: { guestEmail: email, userId: null },
    data: { userId },
  })
}

export async function registerUser({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new AuthError('An account with this email already exists', 409)
  }

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: publicUserSelect,
  })

  await linkGuestBookings(user.id, email)
  return user
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.passwordHash) {
    throw new AuthError('Invalid email or password', 401)
  }
  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) {
    throw new AuthError('Invalid email or password', 401)
  }
  await linkGuestBookings(user.id, email)
  return sanitize(user)
}

export async function findOrCreateGoogleUser({ providerAccountId, email, name, avatarUrl }) {
  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: { provider: 'google', providerAccountId },
    },
    include: { user: true },
  })
  if (existingAccount) return sanitize(existingAccount.user)

  // Link to an existing email account if present, else create a new user
  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({
      data: { email, name, avatarUrl, emailVerified: true },
    })
  }

  await prisma.account.create({
    data: { userId: user.id, provider: 'google', providerAccountId },
  })
  await linkGuestBookings(user.id, email)
  return sanitize(user)
}

export async function getUserById(id) {
  return prisma.user.findUnique({ where: { id }, select: publicUserSelect })
}

function sanitize(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  }
}

export { AuthError }
