import React from 'react';
import { Bot } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isUser = message.sender === 'USER';
  return (
    <div className={`chat-msg ${isUser ? 'user' : 'bot'}`}>
      {!isUser && (
        <span className="chat-avatar" aria-hidden="true">
          <Bot size={14} />
        </span>
      )}
      <div className="chat-bubble">
        {message.message.split('\n').map((x, i) => (
          <div key={i}>{x}</div>
        ))}
        <small>
          {new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </small>
      </div>
    </div>
  );
}
