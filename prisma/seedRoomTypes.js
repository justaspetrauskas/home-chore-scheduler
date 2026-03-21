import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === 'development' ? ["query", "error", "warn"] : ['error']
})

const defaultRoomTypes = [
  { key: 'bedroom', label: 'Bedroom' },
  { key: 'living_room', label: 'Living Room' },
  { key: 'kitchen', label: 'Kitchen' },
  { key: 'bathroom', label: 'Bathroom' },
  { key: 'dining_room', label: 'Dining Room' },
  { key: 'office', label: 'Office' },
  { key: 'garage', label: 'Garage' },
  { key: 'laundry_room', label: 'Laundry Room' },
  { key: 'storage', label: 'Storage' },
  { key: 'balcony', label: 'Balcony' },
  { key: 'hallway', label: 'Hallway' },
  { key: 'other', label: 'Other' },
];

async function main() {
  for (const rt of defaultRoomTypes) {
    await prisma.roomType.upsert({
      where: { key: rt.key },
      update: {},
      create: {
        key: rt.key,
        label: rt.label,
        isDefault: true,
      },
    });
    console.log('Seeded room type: ' + rt.label);
  }
  console.log('Room types seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
