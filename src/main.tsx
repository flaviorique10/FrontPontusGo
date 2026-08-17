import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext' // <--- Importando o Provider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Envolvendo a aplicação inteira com o cérebro da autenticação */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)