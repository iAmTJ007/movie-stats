import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';


import App from './App';
import StarRating from './StarRating';
import Container from './TextExpander';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating maxRating={5} color={"#e67575"}/> */}
    {/* <Container/> */}
  </React.StrictMode>
);