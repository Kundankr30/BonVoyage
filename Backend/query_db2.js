import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const latestRate = await prisma.dry_bulk_freight_rates.findFirst({
    where: {
      origin_port: "Port Hedland",
      destination_port: "Paradip"
    },
    orderBy: { date: 'desc' }
  });
  console.log("latestRate", latestRate);
}
main()
