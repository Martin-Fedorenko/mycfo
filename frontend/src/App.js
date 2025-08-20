import React from "react";
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";

import SignIn from "./sign-in/SignIn";
import SignUp from "./sign-up/SignUp";
import Dashboard from "./template/dashboard/Dashboard";
import Home from "./home/Home";
import ConfirmAccount from "./sign-up/ConfirmAccount";
import routeConfig from "./config/routes"; // tu estructura jerárquica
import Checkout from "./template/checkout/Checkout";

import "./App.css";

// Función para aplanar configRoutes en lista plana con path y element
function flattenRoutes(routes) {
  let flatRoutes = [];

  routes.forEach((route) => {
    if (route.path && route.element) {
      flatRoutes.push({
        path: route.path.replace(/^\//, ""),
        element: route.element,
        label: route.label,
      });
      // elimino slash inicial para evitar conflictos con rutas hijas
    }
    if (route.children) {
      flatRoutes = flatRoutes.concat(flattenRoutes(route.children));
    }
  });

  return flatRoutes;
}

const routes = flattenRoutes(routeConfig);

// ✅ Componente para proteger rutas
function RequireAuth() {
  const isLoggedIn = !!sessionStorage.getItem("accessToken"); // 👈 usamos sessionStorage
  return isLoggedIn ? <Outlet /> : <Navigate to="/signin" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Rutas privadas (protegidas con RequireAuth) */}
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Home />}>
            {routes.map(({ path, element }, idx) => (
              <Route key={idx} path={path} element={element} />
            ))}
          </Route>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checkout" element={<Checkout />} />
        </Route>

        {/* Catch-all: redirigir a signin */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
export { routeConfig };
