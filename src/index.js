import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import LoginPage from "./LoginPage";
import { useState } from "react";

function Apps() {
  const [user, setUser] = useState(null);

  if (!user) {
    return React.createElement(LoginPage, {
      onLogin: (u) => setUser(u),
    });
  }

  return React.createElement("h2", null, "Welcome " + user);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
