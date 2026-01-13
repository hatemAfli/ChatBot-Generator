// import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle(process.env.DATABASE_URL!, { logger: true });

// const Pool = pg.Pool;

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT?parseInt(process.env.DB_PORT):undefined,
// });

export default db;
