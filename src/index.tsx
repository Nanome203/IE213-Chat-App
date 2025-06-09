import { Elysia } from "elysia";
import index from "./index.html";
import swagger from "@elysiajs/swagger";
import testPlugin from "./utils/testPlugin";
import { authRoute } from "./backend/auth";
import { Server } from "bun";
import { userRoute } from "./backend/userRoute";
import { sessionManager } from "./utils/session-manager";
import supabase from "./utils/database";
import { SocketMsg } from "./utils/types";
import { voiceChatRoute } from "./backend/videoChatRoute";

const app = new Elysia()
  .use(swagger())
  .use(testPlugin())
  .use(authRoute)
  .use(userRoute)
  .use(voiceChatRoute)
  .get("/", ({ redirect }) => {
    return redirect("/app");
  });

Bun.serve({
  routes: {
    "/app": index,
    "/app/*": index,
  },
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
        const parsedData: SocketMsg = JSON.parse(data);

        switch (parsedData.type) {
          case "reportID": {
            // parsedData.message is the logged in user id
            const id = parsedData.id!;
            sessionManager.set(id, ws);
            // change user's status
            //TODO: figure out if this is necessary
            supabase
              .from("users")
              .update({ is_online: true })
              .eq("id", id)
              .then(({ error }) => {
                if (error) {
                  console.log("Failed to change user status to online");
                  console.log(error);
                }

                // get user's friends to notify them that the user's status should update to online on their screen
                const friendsId: string[] = [];
                const promise = supabase
                  .from("friends")
                  .select("invitor, invited")
                  .or(`invitor.eq.${id}, invited.eq.${id}`)
                  .eq("accepted", true);

                promise.then(({ data }) => {
                  data?.forEach((obj) => {
                    obj.invited === id
                      ? friendsId.push(obj.invitor)
                      : friendsId.push(obj.invited);
                  });
                  friendsId.forEach((friendId) => {
                    sessionManager
                      .get(friendId)
                      ?.send(JSON.stringify({ type: "isOnline", id }));
                  });
                });
              });

            break;
          }
          case "friendRequest": {
            const invited = parsedData.invited!;
            console.log("friendRequest called");
            sessionManager.get(invited)?.send(
              JSON.stringify({
                type: "friendRequestNotification",
              })
            );
            break;
          }

          case "acceptFriendRequest": {
            const invitor = parsedData.invitor!;
            const invited = parsedData.invited!;
            supabase
              .from("friends")
              .update({ accepted: true })
              .eq("invitor", invitor)
              .eq("invited", invited)
              .then(({ error }) => {
                if (error) {
                  sessionManager
                    .get(invited)
                    ?.send(JSON.stringify({ type: "failedToAccept" }));
                  return;
                }

                sessionManager
                  .get(invitor)
                  ?.send(JSON.stringify({ type: "reloadAllLists" }));

                sessionManager
                  .get(invited)
                  ?.send(JSON.stringify({ type: "reloadAllLists" }));
              });
            break;
          }

          case "declineFriendRequest": {
            const invitor = parsedData.invitor!;
            const invited = parsedData.invited!;
            supabase
              .from("friends")
              .delete()
              .eq("invitor", invitor)
              .eq("invited", invited)
              .then(({ error }) => {
                if (error) {
                  sessionManager
                    .get(invited)
                    ?.send(JSON.stringify({ type: "failedToDecline" }));
                  return;
                }

                sessionManager
                  .get(invitor)
                  ?.send(JSON.stringify({ type: "reloadAllLists" }));

                sessionManager
                  .get(invited)
                  ?.send(JSON.stringify({ type: "reloadAllLists" }));
              });
            break;
          }
          case "syncMessage": {
            const sender = parsedData.sender!;
            const receiver = parsedData.receiver!;
            sessionManager
              .get(sender)
              ?.send(JSON.stringify({ type: "syncMessage" }));
            sessionManager
              .get(receiver)
              ?.send(JSON.stringify({ type: "syncMessage" }));
            break;
          }

          case "senderIsTyping": {
            const receiver = parsedData.receiver!;
            sessionManager.get(receiver)?.send(
              JSON.stringify({
                type: "senderIsTyping",
                // sender: currentUserId,
                // receiver: selectedUser.id,
              })
            );
            break;
          }

          case "senderIsNotTyping": {
            const receiver = parsedData.receiver!;

            sessionManager.get(receiver)?.send(
              JSON.stringify({
                type: "senderIsNotTyping",
                // sender: currentUserId,
                // receiver: selectedUser.id,
              })
            );
            break;
          }
          // more cases later
          default:
            break;
        }
      } else {
        // handle other types of data
      }
    },

    close(ws) {
      const keyValuePair = sessionManager.entries().find(([k, v]) => v === ws);
      if (keyValuePair) {
        const id = keyValuePair[0];
        console.log("Closing socket of user id: ", id);

        supabase
          .from("users")
          .update({ is_online: false })
          .eq("id", id)
          .then(({ error }) => {
            if (error) {
              console.log("Failed to change user status to offline");
              console.log(error);
            }

            // get user's friends to notify them that the user's status should update to offline on their screen
            const friendsId: string[] = [];
            const promise = supabase
              .from("friends")
              .select("invitor, invited")
              .or(`invitor.eq.${id}, invited.eq.${id}`)
              .eq("accepted", true);
            promise.then(({ data }) => {
              data?.forEach((obj) => {
                obj.invited === id
                  ? friendsId.push(obj.invitor)
                  : friendsId.push(obj.invited);
              });

              friendsId.forEach((friendId) => {
                sessionManager
                  .get(friendId)
                  ?.send(JSON.stringify({ type: "isOffline", id }));
                sessionManager.delete(id);
              });
              console.log("Socket closed");
            });
          });
      }
    },
  },
});

console.log("Server running at http://localhost:3000/");
