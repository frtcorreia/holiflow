import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { CookieManager } from "react-cookie-manager";
import "react-cookie-manager/style.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CookieManager
      translations={{
        title: "Aceita uma Cookie? 🍪",
        message:
          "Valorizamos sua privacidade. Escolha quais cookies você deseja permitir. Cookies essenciais estão sempre habilitados, pois são necessários para o funcionamento adequado do site.",
        buttonText: "Aceitar Todos",
        declineButtonText: "Recusar Todos",
        privacyPolicyText: "Política de Privacidade",
      }}
      privacyPolicyUrl="/privacy"
      theme="light"
    >
      <App />
    </CookieManager>
  </StrictMode>
);
