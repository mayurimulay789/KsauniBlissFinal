import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import App from "./App.jsx";
import "./index.css";
// Import performance utilities
import { preconnect, enablePerformanceMonitoring, preloadResources } from "./utils/performance";
// Preconnect to important domains to speed up subsequent requests
preconnect([
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
  // Add any other domains your app connects to frequently
]);
// Preload critical resources
preloadResources([
  { href: "/logo.webp", as: "image" },
  // Add other critical resources here
]);
// Enable performance monitoring in development
if (import.meta.env.MODE === "development") {
  enablePerformanceMonitoring();
}
// Create the root and render the app
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);