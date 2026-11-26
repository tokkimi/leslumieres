import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Ecran } from './Ecran'
import './ecran.css'

createRoot(document.getElementById('root')!).render(<StrictMode><Ecran /></StrictMode>)
