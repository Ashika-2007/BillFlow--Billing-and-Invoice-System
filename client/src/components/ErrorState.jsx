import React from 'react';
export default function ErrorState({message='Unable to load data. Please try again.',onRetry}){return <div className="error-state"><strong>{message}</strong>{onRetry&&<button className="btn btn-secondary" onClick={onRetry}>Try again</button>}</div>}

