import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

async function boot() {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    const { initDemo } = await import('./mocks/initDemo.js');
    await initDemo();
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

boot();
