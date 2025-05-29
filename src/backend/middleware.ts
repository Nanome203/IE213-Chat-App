import jwt from "@elysiajs/jwt";
import Elysia from "elysia";

export const protectedRoute = new Elysia({ name: "protectedRoute" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
    })
  )
  .onTransform(async ({ jwt, cookie: { authjwt } }) => {
    if (!authjwt.value) {
      throw new Error("Unauthorized");
    }

    try {
      const decoded = await jwt.verify(authjwt.value);
      if (!decoded) {
        throw new Error("Invalid token");
      }
      // Token is valid, do nothing
    } catch (error) {
      throw new Error("Token verification failed");
    }
  })
  .as("scoped");
