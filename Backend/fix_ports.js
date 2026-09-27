import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const updates = {
  'PHE': { lat: -20.3125, lng: 118.5772 },
  'NEW': { lat: -32.9192, lng: 151.7761 },
  'DBB': { lat: -21.2662, lng: 149.3005 },
  'RIB': { lat: -28.7963, lng: 32.0831 },
  'QIN': { lat: 36.0028, lng: 120.1983 },
  'RIZ': { lat: 35.3414, lng: 119.5312 },
  'TIA': { lat: 38.9715, lng: 117.7554 },
  'NIN': { lat: 29.9329, lng: 121.9366 },
  'PAR': { lat: 20.2642, lng: 86.6713 },
  'MUN': { lat: 22.7410, lng: 69.7042 },
  'SAN': { lat: -23.9575, lng: -46.3059 },
  'TUB': { lat: -20.2869, lng: -40.2334 },
  'ITQ': { lat: -2.5700, lng: -44.3687 },
  'VAN': { lat: 49.3001, lng: -123.1118 },
  'BAL': { lat: 39.2312, lng: -76.5492 },
  'HRV': { lat: 36.9507, lng: -76.3262 },
  'TAB': { lat: -3.6521, lng: 114.4447 },
  'SAM': { lat: -0.5843, lng: 117.2608 },
  'GAN': { lat: 17.6214, lng: 83.2384 },
  'ROT': { lat: 51.9547, lng: 4.0483 }
};

async function main() {
  for (const [id, coords] of Object.entries(updates)) {
    await prisma.ports.update({
      where: { port_id: id },
      data: { latitude: coords.lat, longitude: coords.lng }
    });
    console.log(`Updated ${id}`);
  }
}
main()
