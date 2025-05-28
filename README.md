# bun-react-tailwind-template

First, install dependencies:

```bash
bun install
```

Then, create .env file and add the database url:

```
DATABASE_URL=
```

Run the following command to generate database schema:

```sh
bun run schema
```

Finally, start a development server with:

```bash
bun run dev
```

Available Routes:

- `localhost:3000/`: Frontend of a test API.
- `localhost:3000/hello`: Frontend of an MVP chat messaging app using WebSocket.

Explain `localhost:3000/hello`:

1. (hello/HelloApp.tsx, frontend) create new websocket /ws
2. (hello/HelloApp.tsx, frontend) ws.send {type: subscribe, channel: chat} to subscribe to channel "chat".
3. (index.tsx, server) if data.type == subscribe, subscribe to data.channel
4. (hello/HelloApp.tsx, frontend) User send chat, socket.send({type: message, user, text})
5. (index.tsx, server) when there is new ws connection, open /ws to send all messages in history ({type: history, data: messages})
6. (index.tsx, server) Process data in message(ws, data). Note: use ws.send to send newMessage to the user at the current browser, use ws.publish to send newMessage to all users of "chat" channel (but not the user at the current browser).
7. (hello/HelloApp.tsx, frontend) on receiving a message from server, if msg.type == history, setMessages to msg.data (this is to load history when user open a new browser), and if msg.type == message, add new message to messages
8. (hello/HelloApp.tsx, frontend) When user leaves /hello (like click a new link), close ws connection

This project was created using `bun init` in bun v1.2.14. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
