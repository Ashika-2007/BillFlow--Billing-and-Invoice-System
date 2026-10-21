import React from 'react';
export default function ChatMessage({message}){return <div className={`chat-msg ${message.sender==='USER'?'user':'bot'}`}><div className="chat-bubble">{message.message.split('\n').map((x,i)=><div key={i}>{x}</div>)}<small>{new Date(message.createdAt||Date.now()).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</small></div></div>}

