import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

//Admin
import LandingPage from './components/Admin/LandingPage';
import Login from './components/Admin/Login';
import TicketDashboard from './components/Admin/AdminDashboard';
import SchoolLogin from './components/Admin/SchoolLogin';

//ICT
import Dashboard from './components/ICT/ICTDashboard';
import Forbidden from "./components/ICT/Forbidden";
import NotFound from "./components/ICT/NotFound";

function App() {
  return (
    <Router>  
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/SchoolLogin' element={<SchoolLogin />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/ticketdashboard' element={<TicketDashboard />} />
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>    
    </Router>
  );
}

export default App;
