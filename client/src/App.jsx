import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

// Context
import { AuthProvider } from "./components/Context/AuthContext";
import ProtectedRoute from "./components/Context/ProtectedRoutes";

// School
import SchoolDashboard from './components/School/SchoolDashboard';

// Admin
import AdminDashboard from './components/Admin/AdminDashboard';

// Public
import Forbidden from "./components/Public/Forbidden";
import NotFound from "./components/Public/NotFound";
import Login from './components/Public/Login';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route
            path='/schooldashboard'
            element={<ProtectedRoute allowedRoles={['School']}><SchoolDashboard /></ProtectedRoute>}
          />
          <Route
            path='/admindashboard'
            element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>}
          />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
