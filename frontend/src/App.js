import React from "react";
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";

import SignIn from "./sign-in/SignIn";
import SignUp from "./sign-up/SignUp";
import Dashboard from "./template/dashboard/Dashboard";
import Home from "./home/Home";
import ConfirmAccount from "./sign-up/ConfirmAccount";
import routeConfig from "./config/routes";
import Checkout from "./template/checkout/Checkout";
import Perfil from "./administracion/perfil/Perfil";

import "./App.css";
import Organizacion from "./administracion/organizacion/Organizacion";

function flattenRoutes(routes) {
  let flatRoutes = [];

  routes.forEach((route) => {
    if (route.path && route.element) {
      flatRoutes.push({
        path: route.path.replace(/^\//, ""),
        element: route.element,
        label: route.label,
      });
    }
    if (route.children) {
      flatRoutes = flatRoutes.concat(flattenRoutes(route.children));
    }
  });

  return flatRoutes;
}

const routes = flattenRoutes(routeConfig);

function RequireAuth() {
  const isLoggedIn = !!sessionStorage.getItem("accessToken");
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
          {/* Layout principal con Home como contenedor */}
          <Route path="/" element={<Home />}>
            {/* Ruta por defecto (podrías redirigir a dashboard u otra página) */}
            
            

            <Route path="perfil" element={<Perfil />} />
            <Route path="organizacion" element={<Organizacion />} />
            
            {/* Rutas dinámicas desde la configuración */}
            {routes.map(({ path, element }, idx) => (
              <Route key={idx} path={path} element={element} />
            ))}
          </Route>
        </Route>

        {/* Catch-all: redirigir a signin */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
export { routeConfig };