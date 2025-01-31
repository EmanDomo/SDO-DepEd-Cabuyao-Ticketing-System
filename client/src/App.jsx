import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//Admin
import Login from './components/Admin/Login';
import TicketDashboard from './components/Admin/TicketDashboard';

//ICT
import Dashboard from './components/ICT/Dashboard';

function App() {
  return (
    <Router>  
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/ticketdashboard' element={<TicketDashboard />} />
      </Routes>    
    </Router>
  );
}

export default App;
