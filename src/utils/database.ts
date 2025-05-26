// Setting up a Drizzle ORM connection with PostgreSQL

import { drizzle } from "drizzle-orm/postgres-js";
import Elysia from "elysia";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);
