import "./styles/App.css";

// Pages
import LoginPage from "./pages/LoginPage";
import { Routes, Route } from "react-router";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  );
}
