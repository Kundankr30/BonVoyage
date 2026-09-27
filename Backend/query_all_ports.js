import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const ports = await prisma.ports.findMany();
  ports.forEach(p => console.log(p.port_id, p.port_name, p.latitude, p.longitude));
}
main()
