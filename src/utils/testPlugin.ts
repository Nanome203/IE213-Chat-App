import { users } from "drizzle/schema";
import Elysia from "elysia";
import { db } from "./database";

export default function testPlugin() {
  return new Elysia({
    prefix: "/test",
  }).get("/users", async () => {
    const usersData = await db.select().from(users);
    return new Response(JSON.stringify(usersData), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  });
}
