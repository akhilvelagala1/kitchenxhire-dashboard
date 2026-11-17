import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BootError } from '@/app/BootError';
import '@/styles/fonts.css';
import '@/styles/index.css';

const root = createRoot(document.getElementById('root')!);

// App is loaded dynamically so a config error (env.ts throws at import) shows a
// message instead of a blank page.
import('@/app/App')
  .then(({ App }) =>
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  )
  .catch((error: unknown) => root.render(<BootError error={error} />));
