import { db } from "@/utils/database";
import { eq, and } from "drizzle-orm";
import { users } from "drizzle/schema";
import Elysia, { t } from "elysia";

export const authRoute = new Elysia({ prefix: "/auth" })
  .guard({
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 8 }),
    }),
  })
  .post("/login", async ({ body: { email, password } }) => {
    const data = await db
      .select({ email: users.email, password: users.password })
      .from(users)

      .where(and(eq(users.email, email), eq(users.password, password)));
    if (data.length === 0) {
      return {
        status: 401,
        message: "Invalid email or password",
      };
    }
    // Return the user data (email and password) if login is successful
    return data;
  })
  .post("signup", async ({ body: { email, password } }) => {
    const existingEmail = (
      await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.email, email))
    )[0];
    if (existingEmail) {
      return {
        status: 409,
        message: "Email already exists",
      };
    }
    const newUser = {
      email,
      password,
    };
    await db.insert(users).values(newUser);
    return {
      status: 201,
      message: "User created successfully",
      user: newUser,
    };
  });
