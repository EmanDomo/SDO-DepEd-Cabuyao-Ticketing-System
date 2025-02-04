import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

//School
import SchoolDashboard from './components/School/SchoolDashboard';
import SchoolLogin from './components/School/SchoolLogin';

//Admin
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminLogin from './components/Admin/AdminLogin';

//Public
import Forbidden from "./components/Public/Forbidden";
import NotFound from "./components/Public/NotFound";
import LandingPage from './components/Public/LandingPage';

function App() {
  return (
    <Router>  
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='adminlogin' element={<AdminLogin />} />
        <Route path='/schoollogin' element={<SchoolLogin />} />
        {/* <Route path='/dashboard' element={<Dashboard />} /> */}
        <Route path='/schooldashboard' element={<SchoolDashboard />} />
        <Route path='/admindashboard' element={<AdminDashboard />} />
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>    
    </Router>
  );
}

export default App;
