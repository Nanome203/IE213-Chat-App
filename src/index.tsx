import { Elysia } from "elysia";
import index from "./index.html";
import hello from "./hello/index.html";
import swagger from "@elysiajs/swagger";
import testPlugin from "./utils/testPlugin";
import { authRoute } from "./backend/auth";
import cors from "@elysiajs/cors";
import { ServerWebSocket, Server } from "bun";
import { userRoute } from "./backend/userRoute";
import { sessionManager } from "./utils/session-manager";
import supabase from "./utils/database";

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
  .use(userRoute)
  .get("/", ({ redirect }) => {
    return redirect("/app");
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
    idleTimeout: 30,
    open(ws) {
      console.log("WebSocket initialized");
    },

    message(ws, data) {
      if (typeof data === "string") {
        if (data === "ping") {
          ws.send("pong");
          return;
        }
        const parsedData: { type: string; message: string } = JSON.parse(data);

        switch (parsedData.type) {
          case "reportID": // parsedData.message is the logged in user id
            sessionManager.set(JSON.stringify(ws), parsedData.message);
            supabase
              .from("users")
              .update({ is_online: true })
              .eq("id", parsedData.message)
              .then(({ error }) => {
                if (error) {
                  console.log("Failed to change user status to online");
                  console.log(error);
                }
              });
            break;
          // more cases later
          default:
            break;
        }
      } else {
        // handle other types of data
      }
    },

    close(ws) {
      const key = JSON.stringify(ws);
      const id = sessionManager.get(key);
      console.log("id: ", id);
      if (id) {
        supabase
          .from("users")
          .update({ is_online: false })
          .eq("id", id)
          .then(({ error }) => {
            if (error) {
              console.log("Failed to change user status to offline");
              console.log(error);
            }
          });

        console.log("Socket closed");
        // get user's friends to notify them that the user's status should update to offline on their screen
        // const friendsId: string[] = [];
        // const promise = supabase
        //   .from("friends")
        //   .select("invitor, invited")
        //   .or(`invitor.eq.${id}, invited.eq.${id}`);
        // promise.then(({ data }) => {
        //   data?.forEach((obj) => {
        //     obj.invited === id
        //       ? friendsId.push(obj.invitor)
        //       : friendsId.push(obj.invited);
        //   });
        // });

        // friendsId.forEach(id => {

        // })
      }

      sessionManager.delete(key);
    },
  },
});

console.log("Server running");
