import Elysia from "elysia";
import index from "./index.html";
import hello from "./hello/index.html";
import swagger from "@elysiajs/swagger";
import testPlugin from "./utils/testPlugin";
import { websocket } from "@elysiajs/websocket";

const idCounter = (() => {
  let id = 0;
  return () => ++id;
})();
type Message = { id: number; user: string; text: string };
let messages: Message[] = [];

const app = new Elysia()
  .use(swagger())
  .use(testPlugin())
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
  })
  .get("/api/messages", () => messages)
  .post("/api/messages", async ({ body }: { body: Message }) => {
    const newMessage = {
      id: idCounter(),
      user: body.user ?? "Anonymous",
      text: body.text,
    };
    messages.push(newMessage);

    return newMessage;
  })
  .use(websocket())
  .ws("/ws", {
    open(ws) {
      ws.send(JSON.stringify({ type: "history", data: messages }));
    },
    message(ws, data) {
      const parsed = JSON.parse(data as string);

      if (parsed.type === "message") {
        const newMessage = {
          id: idCounter(),
          user: parsed.user,
          text: parsed.text,
        };
        messages.push(newMessage);

        ws.publish(
          "chat",
          JSON.stringify({ type: "message", data: newMessage })
        );
      }
    },
  });

Bun.serve({
  routes: {
    "/": index,
    "/hello": hello,
  },
  fetch: app.fetch,
  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});
