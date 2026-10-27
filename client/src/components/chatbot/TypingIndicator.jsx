import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="chat-msg bot" role="status" aria-label="BillBot is typing">
      <div className="typing">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}
