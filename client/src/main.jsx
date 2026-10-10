import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './design-system/tokens.css';
import './design-system/global.css';
import App from './App.jsx';

// Deep links (reloading /ruta) rely on the vercel.json rewrite to index.html (P05-ASM-012).
// If the step-0 deployment shows that the rewrite does not work next to the Express function,
// switch to hash routing by replacing BrowserRouter with HashRouter here (the only change needed).
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
