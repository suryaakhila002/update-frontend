import React, { useEffect } from 'react';
import './custom.css';
import MainRouter from './router/MainRouter';

export default function App() {
  useEffect(() => {
    const el = document.getElementById('preloader');
    if (el) el.remove();
  }, []);

  return <MainRouter />;
}


