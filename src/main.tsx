import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ContractProvider } from './context/ContractContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ContractProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ContractProvider>
  </React.StrictMode>
);