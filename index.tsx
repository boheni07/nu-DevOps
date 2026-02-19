
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

console.log("App initializing...");
const root = ReactDOM.createRoot(rootElement);
console.log("Root created, rendering...");
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log("Render call completed.");
