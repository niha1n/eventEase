import { prisma } from '@/db/client'

const user = await prisma.user.findUnique({
  where: { email: 'nihal@example.com' },
})
console.log(user)