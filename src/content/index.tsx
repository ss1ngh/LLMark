import React from 'react';
import { createRoot } from 'react-dom/client';
import LLMarkApp from './LLMarkApp';
import styles from '../style.css?inline';

const injectApp = () => {
  const hostId = 'llmark-extension-host';
  if (document.getElementById(hostId)) return;

  const host = document.createElement('div');
  host.id = hostId;
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  shadow.appendChild(styleElement);

  const mountPoint = document.createElement('div');
  mountPoint.id = 'llmark-root';
  shadow.appendChild(mountPoint);

  const root = createRoot(mountPoint);
  root.render(
    <React.StrictMode>
      <LLMarkApp />
    </React.StrictMode>
  );

  console.log('LLMark: Injected successfully');
};

injectApp();