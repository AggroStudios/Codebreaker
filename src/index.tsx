import './reset'; // must be first — runs before any store module is evaluated
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(<App />);
