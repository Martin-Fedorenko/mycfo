import { HashRouter as Router, Routes, Route } from "react-router-dom";

import SignIn from "./sign-in/SignIn";
import SignUp from "./sign-up/SignUp";
import Dashboard from "./template/dashboard/Dashboard";
import Home from "./home/Home";
import CargaManual from "./registro/carga-manual/CargaManual";
import CargaDocumento from "./registro/carga-documento/CargaDocumento";
import ReporteMensual from "./reportes/reporte-mensual/ReporteMensual";
import CashFlow from "./reportes/cash-flow/CashFlow";
import CargaExcel from "./registro/carga-excel/CargaExcel";

import "./App.css";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route path="carga-manual" element={<CargaManual />} />
          <Route path="carga-documento" element={<CargaDocumento />} />
          <Route path="reporte-mensual" element={<ReporteMensual />} />
          <Route path="carga-excel" element={<CargaExcel />} />
          <Route path="cash-flow" element={<CashFlow />} />
        </Route>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
