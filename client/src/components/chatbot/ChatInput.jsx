import React, { useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ onSend, disabled }) {
  const [v, setV] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (v.trim()) {
      onSend(v.trim());
      setV('');
    }
  };
  return (
    <form className="chat-input" onSubmit={submit}>
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="Ask about your billing..."
        aria-label="Message BillBot"
        disabled={disabled}
      />
      <button disabled={disabled || !v.trim()} aria-label="Send message">
        <Send size={16} />
      </button>
    </form>
  );
}
