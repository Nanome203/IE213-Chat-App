import Elysia from "elysia";
import index from "./index.html";
import swagger from "@elysiajs/swagger";
import testPlugin from "./utils/testPlugin";
import { authRoute } from "./backend/auth";
import { userRoute } from "./backend/userRoute";

const app = new Elysia()
  .use(swagger())
  .use(testPlugin())
  .use(authRoute)
  .use(userRoute)
  // .get("/", ({ redirect }) => {
  //   return redirect("/app");
  // })
  .get("/", {
    message: "hi",
    say: "hi again",
  })
  .get("/api/hello", () => ({
    message: "Hello, world!",
    method: "GET",
  }))
  .put("/api/hello", () => ({
    message: "Hello, world!",
    method: "PUT",
  }))
  .get("/api/hello/:name", (req) => {
    const name = req.params.name;
    return {
      message: `Hello, ${name}!`,
    };
  });

Bun.serve({
  routes: {
    "/app": index,
    "/app/*": index,
  },
  fetch: app.fetch,
  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});
