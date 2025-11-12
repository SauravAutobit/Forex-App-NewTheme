import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
// import { BrowserRouter } from "react-router-dom";
import { initializeSockets } from "./services/socketService.ts";
import { store } from "./store/store.ts";
import { Provider } from "react-redux";
import Loader from "./components/loader/Loader.tsx";

initializeSockets(store);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <Loader />
      {/* <BrowserRouter> */}
      <App />
      {/* </BrowserRouter> */}
    </Provider>
  </StrictMode>
);
