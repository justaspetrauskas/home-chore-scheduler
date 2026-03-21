// Default room types to seed
const defaultRoomTypes = [
  { key: "bedroom", label: "Bedroom" },
  { key: "living_room", label: "Living Room" },
  { key: "kitchen", label: "Kitchen" },
  { key: "bathroom", label: "Bathroom" },
  { key: "dining_room", label: "Dining Room" },
  { key: "office", label: "Office" },
  { key: "garage", label: "Garage" },
  { key: "laundry_room", label: "Laundry Room" },
  { key: "storage", label: "Storage" },
  { key: "balcony", label: "Balcony" },
  { key: "hallway", label: "Hallway" },
  { key: "other", label: "Other" }
];
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import {PrismaClient} from '@prisma/client';
import { Pool } from 'pg'


const pool = new Pool({ connectionString:process.env.DATABASE_URL   })       
const adapter = new PrismaPg(pool)               
const prisma = new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === 'development' ? ["query", "error", "warn"] : ['error']
})


// TODO create env var
const userId = "5c7c1364-ca79-4e88-a9da-d0033608c01f"

const testUsers = [
  {
    id: userId,
    name: "John Doe",
    email: "john@example.com",
    password: "hashedpassword", // In real app, hash this
  },
];

const testHouseholds = [
  {
    name: "Doe Household",
    ownerId: userId,
  },
];

const testRooms = [
  {
    name: "Kitchen",
    householdId: "", // Will set after creating household
    createdById: userId,
  },
  {
    name: "Bathroom",
    householdId: "",
    createdById: userId,
  },
  {
    name: "Living Room",
    householdId: "",
    createdById: userId,
  },
  {
    name: "Bedroom",
    householdId: "",
    createdById: userId,
  },
];

const testChores = [
  {
    title: "Wash dishes",
    description: "Clean all dirty dishes and load the dishwasher",
    points: 5,
    createdById: userId,
  },
  {
    title: "Wipe kitchen counters",
    description: "Wipe down all kitchen surfaces and countertops",
    points: 3,
    createdById: userId,
  },
  {
    title: "Clean bathroom sink",
    description: "Scrub and disinfect sink and faucet",
    points: 4,
    createdById: userId,
  },
  {
    title: "Clean toilet",
    description: "Disinfect toilet bowl, seat, and handle",
    points: 6,
    createdById: userId,
  },
  {
    title: "Vacuum living room",
    description: "Vacuum floors and rugs",
    points: 5,
    createdById: userId,
  },
  {
    title: "Take out trash",
    description: "Empty all trash bins and take bags outside",
    points: 2,
    createdById: userId,
  },
  {
    title: "Sweep patio",
    description: "Sweep debris from the outside patio area",
    points: 3,
    createdById: userId,
  },
  {
    title: "Water plants",
    description: "Water all indoor and outdoor plants",
    points: 2,
    createdById: userId,
  },
  {
    title: "Clean balcony floor",
    description: "Sweep and mop balcony floor",
    points: 3,
    createdById: userId,
  },
  {
    title: "Dust surfaces",
    description: "Dust shelves, tables, and visible surfaces",
    points: 4,
    createdById: userId,
  },
];

const main = async () => {
      // Seed default room types
      for (const rt of defaultRoomTypes) {
        await prisma.roomType.upsert({
          where: { key: rt.key },
          update: {},
          create: {
            key: rt.key,
            label: rt.label,
            isDefault: true
          }
        });
        console.log("Seeded room type: " + rt.label);
      }
    console.log("Seeding DB")

    // Create user
    const user = await prisma.user.create({
        data: testUsers[0]
    })
    console.log("Created user: " + user.name)

    // Create household
    const household = await prisma.household.create({
        data: testHouseholds[0]
    })
    console.log("Created household: " + household.name)

    // Set householdId in rooms
    testRooms.forEach(room => room.householdId = household.id)

    // Create rooms
    for (const room of testRooms){
        await prisma.room.create({
            data: room
        })
        console.log("Created room: " + room.name)
    }

    // Create chores
    for (const chore of testChores){
        await prisma.chore.create({
            data: chore
        })
        console.log("Created chore: " + chore.title)
    }

    console.log("Seeding DB completed")
}

main().catch((err)=>{
    console.log(err)
    process.exit(1)
}).finally(async()=>{
    await prisma.$disconnect()
})
