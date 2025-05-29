import { db } from "@/utils/database";
import jwt from "@elysiajs/jwt";
import { eq } from "drizzle-orm";
import { users } from "drizzle/schema";
import Elysia, { t } from "elysia";

export const authRoute = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
    })
  )
  .model({
    authData: t.Object({
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 8 }),
    }),
  })
  .post(
    "/login",
    async ({ body: { email, password }, jwt, cookie: { authjwt } }) => {
      const data = await db
        .select({ email: users.email, hashedPassword: users.password })
        .from(users)
        .where(eq(users.email, email));
      if (data.length === 0) {
        return {
          status: 401,
          message: "Invalid email or password",
        };
      }

      const isMatch = await Bun.password.verify(
        password,
        data[0].hashedPassword
      );
      if (isMatch) {
        authjwt.value = await jwt.sign({ email });
        authjwt.set({
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24, // 1 day
        });
        return {
          status: 200,
          message: "Login successful",
        };
      }

      return {
        status: 401,
        message: "Invalid email or password",
      };
    },
    {
      body: "authData",
    }
  )
  .post(
    "signup",
    async ({ body: { email, password } }) => {
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
      const hashedPassword = await Bun.password.hash(password, {
        algorithm: "bcrypt",
      });

      const newUser = {
        email,
        password: hashedPassword,
      };
      await db.insert(users).values(newUser);
      return {
        status: 201,
        message: "User created successfully",
        user: newUser,
      };
    },
    {
      body: "authData",
    }
  )
  .post("/logout", ({ cookie: { authjwt } }) => {
    authjwt.remove();
    return {
      status: 200,
      message: "Logout successfully",
    };
  });
