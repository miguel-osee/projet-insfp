import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 1. On importe le Routeur (qui manquait !)
import { BrowserRouter } from 'react-router-dom'; 

// 2. On importe le module SEO
import { HelmetProvider } from 'react-helmet-async'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      {/* 3. On remet le BrowserRouter autour de l'application */}
      <BrowserRouter> 
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);