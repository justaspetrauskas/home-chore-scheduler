import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import {PrismaClient} from '@prisma/client';
import { Pool } from 'pg'


const connectionString = process.env.DATABASE_URL  
const pool = new Pool({ connectionString })       
const adapter = new PrismaPg(pool)               
const prisma = new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === 'development' ? ["query", "error", "warn"] : ['error']
})

const connectDB = async () => {
    try {
        await prisma.$connect()
        console.log("DB Connecte4d via Prisma")
    }catch(error){
        console.log("DB connection error:" + error)
        process.exit(1)
    }
}

const disconnectDB = async () => {
    await prisma.$disconnect()
}

export {prisma, connectDB, disconnectDB}