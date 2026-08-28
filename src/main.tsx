import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { isReload, pinScrollStart } from './lib/scroll-start';
import { beginPageJump } from './lib/anchors';
import { prefetchMachineModel } from './lib/device';

pinScrollStart();
if (isReload()) beginPageJump(1200);
prefetchMachineModel();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

