import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode data-id="app-strict-mode">
    <BrowserRouter data-id="app-router">
      <App data-id="app-root" />
    </BrowserRouter>
  </React.StrictMode>,
)
