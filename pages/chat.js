import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Head from "next/head";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";

import { highlightMentions } from "../lib/highlightMentions.js";

const S3_BASE_URL = `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com`;

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
  const [topics, setTopics] = useState([]);
  const [topicId, setTopicId] = useState(null);
  const [newTopic, setNewTopic] = useState("");
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [socketReady, setSocketReady] = useState(false);
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
        const r = await fetch("/api/chat/topics");
        if (r.ok) {
          const ts = await r.json();
          setTopics(ts);
          if (!topicId && ts.length) setTopicId(ts[0].id);
        }
      } catch (err) {
        // ignore
      }

      await fetch("/api/socket-io"); // start socket endpoint
      if (typeof window !== "undefined" && window.io) {
        const socket = window.io({ path: "/api/socket-io" });
        socketRef.current = socket;
        setSocketReady(true);

        socket.on("chat:recv", (msg) => {
          setMessages((m) => [...m, msg]);
        });

        socket.on("chat:delete", (id) => {
          setMessages((m) => m.filter((msg) => msg.id !== id));
        });
      }
    };
    init();
    return () => socketRef.current && socketRef.current.disconnect();
  }, [topicId]);

  useEffect(() => {
    if (!socketReady || !socketRef.current || !topicId) return;
    socketRef.current.emit("chat:join", topicId);
    const load = async () => {
      try {
        const hist = await fetch(`/api/chat/history?room_id=${topicId}`);
        if (hist.ok) setMessages(await hist.json());
      } catch (err) {
        // ignore
      }
    };
    load();
  }, [topicId, socketReady]);

  const sendMessage = async () => {
    if (!input && !file) return;
    if (!socketRef.current) return;
    if (!topicId) {
      console.warn("topicId not set; refusing to send message");
      return;
    }
    let s3Key = null;
    let contentType = null;
    if (file) {
      try {
        const r = await fetch('/api/chat/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentType: file.type, file_name: file.name }),
        });
        if (r.ok) {
          const { url, key } = await r.json();
          await fetch(url, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type },
          });
          s3Key = key;
          contentType = file.type;
        }
      } catch (err) {
        console.error('upload error', err);
      }
    }
    const msg = {
      user: user?.username || 'anon',
      body: input,
      room_id: topicId,
      s3_key: s3Key,
      file_name: file ? file.name : null,
      content_type: contentType,
    };
    socketRef.current.emit('chat:send', msg);
    setInput('');
    setFile(null);
  };

  const deleteMessage = (id) => {
    if (socketRef.current) {
      socketRef.current.emit("chat:delete", id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header />
        <main className="p-8 space-y-4">
          <Head>
            <title>Chat</title>
          </Head>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Chat</h1>
          <div className="flex items-center space-x-2">
            <select
              className="input"
              value={topicId || ""}
              onChange={(e) => setTopicId(parseInt(e.target.value, 10))}
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <input
              className="input"
              placeholder="New topic"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
            />
            <button
              className="button"
              onClick={async () => {
                if (!newTopic.trim()) return;
                const r = await fetch("/api/chat/topics", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: newTopic.trim() }),
                });
                if (r.ok) {
                  const { id } = await r.json();
                  const t = { id, name: newTopic.trim() };
                  setTopics((ts) => [...ts, t]);
                  setTopicId(id);
                  setNewTopic("");
                }
              }}
            >
              Create
            </button>
          </div>
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
                  {m.s3_key && (
                    m.content_type && m.content_type.startsWith('image/') ? (
                      <img
                        src={`${S3_BASE_URL}/${m.s3_key}`}
                        alt="uploaded"
                        className="mt-2 max-w-xs"
                      />
                    ) : (
                      <a
                        href={`${S3_BASE_URL}/${m.s3_key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-2 text-blue-500 underline"
                        download
                      >
                        {m.file_name || m.s3_key.split('/').pop()}
                      </a>
                    )
                  )}
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
            <input
              type="file"
              className="input"
              onChange={(e) => setFile(e.target.files[0])}
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
