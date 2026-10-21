import React from 'react';
import {X} from 'lucide-react';export default function Modal({open,onClose,title,children,wide=false}){if(!open)return null;return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className={`modal ${wide?'modal-wide':''}`}><div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose}><X size={19}/></button></div>{children}</div></div>}

