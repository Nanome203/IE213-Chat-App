import jwt from "@elysiajs/jwt";
import Elysia from "elysia";

export const protectedRoute = new Elysia({ name: "protectedRoute" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
    })
  )
  .macro({
    checkInvalidToken(needTobeChecked: boolean) {
      if (needTobeChecked)
        return {
          beforeHandle({ jwt, cookie: { authjwt } }) {
            if (!authjwt.value) {
              return Response.json({ status: 401, error: "Unauthorized" });
            }

            try {
              const decoded = jwt.verify(authjwt.value);
              if (!decoded) {
                return Response.json({ status: 401, error: "Invalid token" });
              }
            } catch (error) {
              return Response.json({
                status: 401,
                error: "Token verification failed",
              });
            }
            // Token is valid, do nothing
          },
        };
    },
  })
  .as("scoped");
