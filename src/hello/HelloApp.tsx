import { useEffect, useState } from "react";

type Message = {
  id: number;
  user: string;
  text: string;
};

export function HelloApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [user, setUser] = useState("User");
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:5050/ws`);
    setSocket(ws);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "subscribe", channel: "chat" }));
    };

    ws.onmessage = (event) => {
      // console.log(event);
      const msg = JSON.parse(event.data);
      // console.log(msg);

      if (msg.type === "history") {
        setMessages(msg.data);
      } else if (msg.type === "message") {
        setMessages((prev) => [...prev, msg.data]);
      }
    };

    return () => ws.close();
  }, []);

  const sendMessage = () => {
    if (!text.trim() || !socket) return;

    socket.send(JSON.stringify({ type: "message", user, text }));
    setText("");
  };

  return (
    <div className="max-w-xl mx-auto p-4 text-left">
      <h2 className="text-2xl font-bold mb-4">
        💬 Real-time Messaging App (WebSocket)
      </h2>
      <div className="mb-4">
        <input
          className="border p-2 mr-2"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="Your name"
        />
        <input
          className="border p-2 mr-2 w-2/3"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
      <ul className="space-y-2">
        {messages.map((m) => (
          <li key={m.id} className="border p-2 rounded">
            <strong>{m.user}:</strong> {m.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
