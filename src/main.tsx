import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// No StrictMode — it causes double-mounting which breaks Three.js cleanup
createRoot(document.getElementById('root')!).render(<App />)
