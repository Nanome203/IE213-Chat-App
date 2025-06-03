import supabase from "@/utils/database";
import jwt from "@elysiajs/jwt";
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
      const { data: userData, error } = await supabase
        .from("users")
        .select("id , name , email, hashedPassword:password, avatar:image_url")
        .eq("email", email);
      if (error) {
        return {
          status: 500,
          message: "Cannot retrieve data",
        };
      }
      if (userData.length === 0) {
        return {
          status: 401,
          message: "Invalid email or password",
        };
      }

      const isMatch = await Bun.password.verify(
        password,
        userData[0].hashedPassword
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
        const { data, error } = await supabase
          .from("users")
          .update({ is_online: true })
          .eq("email", email);
        if (error) {
          return {
            status: 500,
            message: "Cannot change user online status",
          };
        }
        const cleanedUserData = {
          name: userData[0].name,
          id: userData[0].id,
          email: userData[0].email,
          avatar: userData[0].avatar,
        };
        return {
          status: 200,
          message: "Login successful",
          user: cleanedUserData,
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
      const { data, error } = await supabase
        .from("users")
        .select("existingEmail: email")
        .eq("email", email);
      if (error) {
        return {
          status: 500,
          message: "Failed to retrieve data",
        };
      }
      if (data.length === 1) {
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
      await supabase.from("users").insert(newUser);
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
    async ({ cookie: { authjwt }, body: { id } }) => {
      authjwt.remove();
      await supabase.from("users").update({ is_online: false }).eq("id", id);
      return {
        status: 200,
        message: "Logout successfully",
      };
    },
    {
      body: t.Object({
        id: t.String()
      }),
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
      console.log(password);
      try {
        const { error } = await supabase
          .from("users")
          .update({ password: hashedPassword })
          .eq("email", emailRecords[hashedEmail]);
        if (error) {
          return {
            status: 500,
            message: "Error happens while changing password",
          };
        }
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
