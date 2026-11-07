import React from 'react';
import { createRoot } from 'react-dom/client';
import { Prototype } from './prototype/Prototype';
import './design/generated.css';
import './styles.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><Prototype /></React.StrictMode>);
