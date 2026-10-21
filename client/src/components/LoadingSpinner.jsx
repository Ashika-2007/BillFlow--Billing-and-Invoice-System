import React from 'react';
export default function LoadingSpinner({full=false,label='Loading...'}){return <div className={full?'loader-full':'loader'}><span className="spinner"/><span>{label}</span></div>}
