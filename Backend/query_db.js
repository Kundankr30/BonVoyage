import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const rates = await prisma.dry_bulk_freight_rates.findMany({take: 5});
  console.log("rates", rates);
}
main()
