import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";  // make sure App.jsx exists in src/
import "./index.css";         // optional, only if you created styles

// Mount React app to root div in index.html
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
