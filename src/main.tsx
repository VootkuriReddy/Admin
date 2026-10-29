import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/plus-jakarta-sans";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/login.css";
import "./styles/pages.css";
import App from "./App";
import { AdminProvider } from "./store/AdminContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AdminProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AdminProvider>
  </React.StrictMode>,
);
