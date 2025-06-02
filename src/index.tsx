import { Elysia } from "elysia";
import index from "./index.html";
import hello from "./hello/index.html";
import swagger from "@elysiajs/swagger";
import testPlugin from "./utils/testPlugin";
import { authRoute } from "./backend/auth";
import cors from "@elysiajs/cors";
import { ServerWebSocket, Server } from "bun";

const idCounter = (() => {
  let id = 0;
  return () => ++id;
})();
export type Message = {
  type: string;
  id: number;
  user: string;
  text: string;
  img?: string;
};
let messages: Message[] = [];
const channels = new Map<string, Set<ServerWebSocket<unknown>>>();

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .use(testPlugin())
  .use(authRoute)
  .get("/", ({ redirect }) => {
    return redirect("/app");
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
// .ws("/ws", {
//   open(ws) {
//     ws.send(JSON.stringify({ type: "history", data: messages }));
//   },
//   message(ws, data: any) {
//     // console.log("recv")
//     // console.log(data.type+"b4 parse");
//     // const parsed = JSON.parse(data) as Message;
//     // console.log("aft parse");
//     // console.log(parsed.type);

//     if (data.type === "subscribe") {
//       ws.subscribe(data.channel);
//       // console.log(`Client subscribed to ${data.channel}`);
//     }

//     if (data.type === "message") {
//       const newMessage = {
//         ...data,
//         id: idCounter(),
//       };
//       messages.push(newMessage);

//       ws.send(JSON.stringify({ type: "message", data: newMessage }));

//       ws.publish(
//         "chat",
//         JSON.stringify({ type: "message", data: newMessage })
//       );

//       // console.log("publish chat!");
//     }
//   },
// });
// .listen(5050);

Bun.serve({
  // port: 3000,
  routes: {
    "/app": index,
    "/app/*": index,
    "/hello": hello,
  },
  // fetch: app.fetch,
  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
  fetch(req: Request, server: Server) {
    const url = new URL(req.url);

    // WebSocket Upgrade
    if (url.pathname === "/ws" && server.upgrade) {
      if (req.headers.get("upgrade") === "websocket") {
        const upgraded = server.upgrade(req);
        if (upgraded) return new Response(null, { status: 101 });
        return new Response("WebSocket upgrade failed", { status: 400 });
      }
    }
    return app.fetch(req);
  },

  websocket: {
    open(ws) {
      ws.send(JSON.stringify({ type: "history", data: messages }));
    },

    message(ws, data) {
      let parsed: any;

      try {
        parsed = typeof data === "string" ? JSON.parse(data) : data;
      } catch (err) {
        console.error("Invalid JSON received:", data);
        return;
      }

      if (parsed.type === "subscribe") {
        const channel = parsed.channel;

        if (!channels.has(channel)) {
          channels.set(channel, new Set());
        }

        channels.get(channel)?.add(ws);
        console.log(`Client subscribed to ${channel}`);
      }

      if (parsed.type === "message") {
        const newMessage = {
          ...parsed,
          id: idCounter(),
        };

        messages.push(newMessage);

        // Echo to sender
        // ws.send(JSON.stringify({ type: "message", data: newMessage }));

        // Publish to all clients subscribed to "chat"
        const subscribers = channels.get("chat");
        if (subscribers) {
          const messagePayload = JSON.stringify({
            type: "message",
            data: newMessage,
          });

          for (const client of subscribers) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(messagePayload);
            }
          }

          console.log("Published message to chat channel");
        }
      }
    },

    close(ws) {
      // Remove client from all channels
      for (const subs of channels.values()) {
        subs.delete(ws);
      }
    },
  },
});

console.log("Server running");
