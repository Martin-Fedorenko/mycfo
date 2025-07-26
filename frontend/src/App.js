import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import SignIn from './sign-in/SignIn';
import SignUp from './sign-up/SignUp';
import Dashboard from './dashboard/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
