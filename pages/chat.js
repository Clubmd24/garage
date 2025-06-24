import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Head from "next/head";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";

const highlightMentions = (text) =>
  text.split(/(@[A-Za-z0-9_]+)/g).map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="text-[var(--color-mention)]">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );

const userColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 65% 45%)`;
};

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const r = await fetch("/api/auth/me", { credentials: "include" });
        setUser(r.ok ? await r.json() : null);
      } catch (err) {
        setUser(null);
      }

      try {
        const hist = await fetch("/api/chat/history");
        if (hist.ok) {
          const msgs = await hist.json();
          setMessages(msgs);
        }
      } catch (err) {
        // ignore
      }

      await fetch("/api/socket-io"); // start socket endpoint
      const socket = window.io({ path: "/api/socket-io" });
      socketRef.current = socket;

      socket.on("chat:recv", (msg) => {
        setMessages((m) => [...m, msg]);
      });

      socket.on("chat:delete", (id) => {
        setMessages((m) => m.filter((msg) => msg.id !== id));
      });
    };
    init();
    return () => socketRef.current && socketRef.current.disconnect();
  }, []);

  const sendMessage = () => {
    if (!input || !socketRef.current) return;
    const msg = {
      user: user?.username || "anon",
      body: input,
    };
    socketRef.current.emit("chat:send", msg);
    setInput("");
  };

  const deleteMessage = (id) => {
    if (socketRef.current) {
      socketRef.current.emit("chat:delete", id);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <Script
          src="/api/socket-io/socket.io.js"
          strategy="beforeInteractive"
        />
        <main className="p-8 space-y-4">
          <Head>
            <title>Chat</title>
          </Head>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Chat
          </h1>
          <div className="space-y-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className="p-2 bg-[var(--color-surface)] rounded-2xl shadow flex justify-between"
              >
                <div>
                  <span
                    className="font-semibold mr-2"
                    style={{ color: userColor(m.user) }}
                  >
                    {m.user}:
                  </span>
                  <span>{highlightMentions(m.body)}</span>
                </div>
                {user?.username === m.user && (
                  <button
                    className="text-red-500 ml-4"
                    onClick={() => deleteMessage(m.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex mt-4 space-x-2">
            <input
              className="flex-1 input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Type a message..."
            />
            <button className="button" onClick={sendMessage}>
              Send
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
