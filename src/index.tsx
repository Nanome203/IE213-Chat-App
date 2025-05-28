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
type Message = { type: string; id: number; user: string; text: string };
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
  // .post("/api/messages", async ({ body }: { body: Message }) => {
  //   const newMessage = {
  //     id: idCounter(),
  //     user: body.user ?? "Anonymous",
  //     text: body.text,
  //   };
  //   messages.push(newMessage);

  //   return newMessage;
  // })
  .ws("/ws", {
    open(ws) {
      ws.send(JSON.stringify({ type: "history", data: messages }));
    },
    message(ws, data) {
      // console.log("recv")
      // console.log(data.type+"b4 parse");
      // const parsed = JSON.parse(data) as Message;
      // console.log("aft parse");
      // console.log(parsed.type);

      if (data.type === "subscribe") {
        ws.subscribe(data.channel);
        // console.log(`Client subscribed to ${data.channel}`);
      }

      if (data.type === "message") {
        const newMessage = {
          ...data,
          id: idCounter(),
        };
        messages.push(newMessage);

        ws.send(JSON.stringify({ type: "message", data: newMessage }));

        ws.publish(
          "chat",
          JSON.stringify({ type: "message", data: newMessage })
        );

        // console.log("publish chat!");
      }
    },
  });
app.listen(5050);

Bun.serve({
  port: 3000,
  routes: {
    "/": index,
    "/hello": hello,
  },
  // fetch: app.fetch,
  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});
console.log("Server running");
