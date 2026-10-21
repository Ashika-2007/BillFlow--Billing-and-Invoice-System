import React from 'react';
export default function DataTable({columns,rows,loading,empty=<div>No records found.</div>}){if(loading)return <div className="table-loading">Loading records...</div>;if(!rows?.length)return empty;return <div className="table-wrap"><table><thead><tr>{columns.map(c=><th key={c.key}>{c.label}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={row._id||i}>{columns.map(c=><td key={c.key}>{c.render?c.render(row):row[c.key]}</td>)}</tr>)}</tbody></table></div>}

