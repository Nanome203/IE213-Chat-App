import jwt from "@elysiajs/jwt";
import Elysia from "elysia";

export const protectedRoute = new Elysia({ name: "protectedRoute" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
    })
  )
  .onBeforeHandle(async ({ jwt, cookie: { authjwt } }) => {
    if (!authjwt.value) {
      return Response.json({ status: 401, error: "Unauthorized" });
    }

    try {
      const decoded = await jwt.verify(authjwt.value);
      if (!decoded) {
        return Response.json({ status: 401, error: "Invalid token" });
      }
      // Token is valid, do nothing
    } catch (error) {
      return Response.json({ status: 401, error: "Token verification failed" });
    }
  })
  .as("scoped");
