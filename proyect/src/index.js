import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
//import App from './App';
import ToDoList from './ToDoList'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ToDoList />
  </React.StrictMode>
);
