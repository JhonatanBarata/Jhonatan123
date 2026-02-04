import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // remove existing data (safe for local/dev)
  await prisma.pedido.deleteMany()
  await prisma.product.deleteMany()
  await prisma.client.deleteMany()

  const password = await bcrypt.hash('password123', 8)

  const clients = [] as any[]
  for (let i = 1; i <= 3; i++) {
    const c = await prisma.client.create({
      data: {
        name: `cliente ${i}`,
        email: `cliente${i}@example.com`,
        phone: `+55-11-90000-000${i}`,
        passwordHash: password,
      },
    })
    clients.push(c)
  }

  const products = [] as any[]
  for (let i = 1; i <= 3; i++) {
    const p = await prisma.product.create({
      data: {
        name: `produto ${i}`,
        description: `Descrição do produto ${i}`,
        price: `${(i * 10).toFixed(2)}`,
        clientId: clients[i - 1].id,
      },
    })
    products.push(p)
  }

  for (let i = 1; i <= 3; i++) {
    await prisma.pedido.create({
      data: {
        clienteNome: clients[i - 1].name,
        produtoId: products[i - 1].id,
        quantidade: i,
        status: 'pendente',
      },
    })
  }

  // create an admin user
  await prisma.user.upsert({
    where: { email: 'Jbinformatica1100@gmail.com' },
    update: {},
    create: {
      email: 'Jbinformatica1100@gmail.com',
      passwordHash: password,
    },
  })

  console.log('Seed completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
