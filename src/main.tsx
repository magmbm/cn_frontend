import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider, type AuthProviderProps } from "react-oidc-context";
import "./index.css";

// Configuración exacta vinculada a tu User Pool de Ohio
const cognitoAuthConfig: AuthProviderProps = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_QmdHsiOX2",
  client_id: "55hsp4g2da2n0g262v5bphgsj5",
  redirect_uri: "http://localhost:5173",
  response_type: "code",
  scope: "email openid phone",
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
