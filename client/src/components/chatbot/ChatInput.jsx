import React from 'react';
import {Send} from 'lucide-react';import {useState} from 'react';export default function ChatInput({onSend,disabled}){const [v,setV]=useState('');const submit=e=>{e.preventDefault();if(v.trim()){onSend(v.trim());setV('')}};return <form className="chat-input" onSubmit={submit}><input value={v} onChange={e=>setV(e.target.value)} placeholder="Ask about your billing..." disabled={disabled}/><button disabled={disabled||!v.trim()}><Send size={17}/></button></form>}

