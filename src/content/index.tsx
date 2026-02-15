import React from 'react';
import { createRoot } from 'react-dom/client';
import LLMarkApp from './LLMarkApp';
// Important: Import styles with ?inline to get the raw CSS string
import styles from '../style.css?inline'; 

const injectApp = () => {
  // 1. Create the Host Element
  const hostId = 'llmark-extension-host';
  if (document.getElementById(hostId)) return; // Prevent double injection

  const host = document.createElement('div');
  host.id = hostId;
  document.body.appendChild(host);

  // 2. Create Shadow DOM (The Shield)
  const shadow = host.attachShadow({ mode: 'open' });

  // 3. Inject Tailwind CSS into the Shadow DOM
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  shadow.appendChild(styleElement);

  // 4. Create the Mount Point
  const mountPoint = document.createElement('div');
  mountPoint.id = 'llmark-root';
  shadow.appendChild(mountPoint);

  // 5. Render React
  const root = createRoot(mountPoint);
  root.render(
    <React.StrictMode>
      <LLMarkApp />
    </React.StrictMode>
  );
  
  console.log('LLMark: Injected successfully 📍');
};

// Inject immediately
injectApp();