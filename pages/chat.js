import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import Head from 'next/head';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(setUser)
      .catch(() => null);

    fetch('/api/socket-io'); // start socket endpoint
    const socket = window.io({ path: '/api/socket-io' });
    socketRef.current = socket;

    socket.on('chat:recv', msg => {
      setMessages(m => [...m, msg]);
    });
    return () => socket.disconnect();
  }, []);

  const sendMessage = () => {
    if (!input || !socketRef.current) return;
    const msg = {
      user: user?.username || 'anon',
      body: input
    };
    socketRef.current.emit('chat:send', msg);
    setInput('');
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <Script src="/api/socket-io/socket.io.js" strategy="beforeInteractive" />
        <main className="p-8 space-y-4">
          <Head><title>Chat</title></Head>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Chat</h1>
          <div className="space-y-2">
            {messages.map((m, idx) => (
              <div key={idx} className="p-2 bg-[var(--color-surface)] rounded-2xl shadow">
                <span className="font-semibold mr-2">{m.user}:</span>
                <span>{m.body}</span>
              </div>
            ))}
          </div>
          <div className="flex mt-4 space-x-2">
            <input
              className="flex-1 input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
              placeholder="Type a message..."
            />
            <button className="button" onClick={sendMessage}>Send</button>
          </div>
        </main>
      </div>
    </div>
  );
}
