import { db } from "@/utils/database";
import jwt from "@elysiajs/jwt";
import { eq } from "drizzle-orm";
import { users } from "drizzle/schema";
import Elysia, { t } from "elysia";
import { protectedRoute } from "./middleware";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GOOGLE_APP_PASS,
  },
});

const emailRecords: Record<string, string> = {};

export const authRoute = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
    })
  )
  .use(protectedRoute)
  .model({
    authData: t.Object({
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 8 }),
    }),

    resetData: t.Object({
      email: t.String({ format: "email" }),
    }),
  })
  .post(
    "/login",
    async ({ body: { email, password }, jwt, cookie: { authjwt } }) => {
      const data = await db
        .select({
          id: users.id,
          email: users.email,
          hashedPassword: users.password,
        })
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
          maxAge:
            process.env.NODE_ENV === "development"
              ? 60 * 60 * 24
              : 60 * 60 * 24 * 365,
        });
        return {
          status: 200,
          message: "Login successful",
          user: data,
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
      };
    },
    {
      body: "authData",
    }
  )
  .post(
    "/logout",
    ({ cookie: { authjwt } }) => {
      authjwt.remove();
      return {
        status: 200,
        message: "Logout successfully",
      };
    },
    {
      checkInvalidToken: true,
    }
  )
  .get(
    "/check-auth",
    () => {
      return {
        status: 200,
        message: "User is authenticated",
      };
    },
    {
      checkInvalidToken: true,
    }
  )
  .post(
    "/forget-password",
    async ({ body: { email } }) => {
      const hashedEmail = (
        await Bun.password.hash(email, {
          algorithm: "bcrypt",
        })
      ).replace(/[$/]/g, "");
      console.log("Hashed Email:", hashedEmail);
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Reset your password",
        text: `Reset your password using this link:\nhttp://localhost:3000/app/reset-password/${hashedEmail}`,
      });
      emailRecords[hashedEmail] = email; // Store email in state for later use
      console.log(emailRecords[hashedEmail]);
      return {
        status: 201,
        message: "Reset password email sent successfully",
      };
    },
    {
      body: "resetData",
    }
  )
  .post(
    "/reset-password/:hashedEmail",
    async ({ body: { password }, params: { hashedEmail } }) => {
      const hashedPassword = await Bun.password.hash(password, {
        algorithm: "bcrypt",
      });
      console.log("email:", emailRecords[hashedEmail]);
      try {
        await db
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.email, emailRecords[hashedEmail]));
        return {
          status: 201,
          message: "Change password successfully",
        };
      } catch {
        return {
          status: 400,
          message: "Failed to change password",
        };
      }
    },
    {
      body: t.Object({
        password: t.String({ minLength: 8 }),
      }),
    }
  );
