import { HashRouter as Router, Routes, Route } from "react-router-dom";

import SignIn from "./sign-in/SignIn";
import SignUp from "./sign-up/SignUp";
import Dashboard from "./template/dashboard/Dashboard";
import Home from "./home/Home";
import routeConfig from './config/routes';
import "./App.css";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home routeConfig = {routeConfig}/>}>
          {routeConfig.map(({ path, element }, idx) => (
            <Route key={idx} path={path} element={element} />
          ))}
        </Route>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
export { routeConfig };