import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '@ui/App';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
