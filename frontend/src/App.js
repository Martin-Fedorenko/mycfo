import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import SignIn from "./sign-in/SignIn";
import SignUp from "./sign-up/SignUp";
import Dashboard from "./template/dashboard/Dashboard";
import Home from "./home/Home";

import routeConfig from "./config/routes"; // tu estructura jerárquica

import "./App.css";
import Checkout from "./template/checkout/Checkout";

// Función para aplanar configRoutes en lista plana con path y element
function flattenRoutes(routes) {
  let flatRoutes = [];

  routes.forEach((route) => {
    if (route.path && route.element) {
      flatRoutes.push({ path: route.path.replace(/^\//, ""), element: route.element, label: route.label });
      // elimino slash inicial para evitar conflictos con rutas hijas
    }
    if (route.children) {
      flatRoutes = flatRoutes.concat(flattenRoutes(route.children));
    }
  });

  return flatRoutes;
}

const routes = flattenRoutes(routeConfig);

function App() {
  return (

    <Router>
      <Routes>
        <Route path="/" element={<Home />}>
          {routes.map(({ path, element }, idx) => (
            <Route key={idx} path={path} element={element} />
          ))}
        </Route>

        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </Router>
  );
}

export default App;
export { routeConfig };
