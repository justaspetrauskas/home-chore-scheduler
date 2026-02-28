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
    console.log("Seeding DB")

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
