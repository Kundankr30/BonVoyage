import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const ports = await prisma.ports.findMany({take: 5});
  console.log("ports", ports);
}
main()
