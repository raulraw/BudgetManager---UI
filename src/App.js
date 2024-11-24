import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";

function App() {
  // Verificăm dacă există un token în localStorage
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* Rutele pentru Login și Register */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Ruta Home: dacă nu există token, redirecționăm spre /login */}
        <Route
          path="/home"
          element={token ? <Home /> : <Navigate to="/login" />}
        />
        
        {/* Redirect implicit către /home dacă utilizatorul este autentificat */}
        <Route
          path="/"
          element={token ? <Navigate to="/home" /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
  