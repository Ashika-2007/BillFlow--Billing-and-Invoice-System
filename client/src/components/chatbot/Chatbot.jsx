import React, { useEffect, useRef, useState } from 'react';
import { Bot, X, Trash2, Sparkles } from 'lucide-react';
import { clearHistory, getHistory, sendMessage } from '../../services/chatbotApi';
import usePresence from '../../hooks/usePresence';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import QuickActions from './QuickActions';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const { mounted, state } = usePresence(open, 200);
  const body = useRef(null);

  useEffect(() => {
    if (open)
      getHistory()
        .then((r) => setMessages(r.data.data))
        .catch(() => {});
  }, [open]);

  // Keep the newest message in view
  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const send = async (m) => {
    setMessages((x) => [...x, { sender: 'USER', message: m, createdAt: new Date() }]);
    setTyping(true);
    try {
      const r = await sendMessage(m);
      if (r.data.data) setMessages((x) => [...x, { sender: 'BOT', message: r.data.data.reply, createdAt: new Date() }]);
    } catch (e) {
      setMessages((x) => [
        ...x,
        {
          sender: 'BOT',
          message: e.response?.data?.message || 'I could not reach the billing service right now.',
          createdAt: new Date()
        }
      ]);
    } finally {
      setTyping(false);
    }
  };

  const clear = async () => {
    await clearHistory();
    setMessages([]);
  };

  return (
    <>
      <button
        className={`billbot-fab ${open ? 'is-hidden' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Open BillBot assistant"
        aria-expanded={open}
      >
        <Bot size={22} />
        <span className="fab-label">Ask BillBot</span>
      </button>
      {mounted && (
        <section className="chat-panel" data-state={state} role="dialog" aria-label="BillBot assistant">
          <div className="chat-head">
            <div className="chat-title">
              <div className="bot-icon">
                <Bot size={19} />
              </div>
              <div>
                <strong>BillBot</strong>
                <small>Answers from your live billing data</small>
              </div>
            </div>
            <div className="chat-head-actions">
              <button className="icon-btn on-dark" onClick={clear} aria-label="Clear conversation" title="Clear conversation">
                <Trash2 size={16} />
              </button>
              <button className="icon-btn on-dark" onClick={() => setOpen(false)} aria-label="Close assistant">
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="chat-body" ref={body}>
            {!messages.length && (
              <>
                <div className="welcome">
                  <div className="bot-icon large">
                    <Sparkles size={20} />
                  </div>
                  <h3>Hi! I’m BillBot</h3>
                  <p>I can help you understand invoices, payments, outstanding amounts and billing information.</p>
                </div>
                <QuickActions onSelect={send} />
              </>
            )}
            {messages.map((m, i) => (
              <ChatMessage key={i} message={m} />
            ))}
            {typing && <TypingIndicator />}
          </div>
          <ChatInput onSend={send} disabled={typing} />
        </section>
      )}
    </>
  );
}
