import Elysia from "elysia";
import { protectedRoute } from "./middleware";

export const userRoute = new Elysia({ prefix: "/user" })
  .use(protectedRoute)
  .get("/", () => {})
  .get("/:id", () => {});
