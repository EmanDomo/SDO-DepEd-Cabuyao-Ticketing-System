import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Context
import { AuthProvider } from "./components/Context/AuthContext";
import ProtectedRoute from "./components/Context/ProtectedRoutes";

// School
import SchoolDashboard from "./components/School/SchoolDashboard";
import CreateTicket from "./components/School/CreateTicket";
import Ticket from "./components/School/Ticket";
import ResetPassword from "./components/School/ResetPassword";

// Admin
import AdminDashboard from "./components/Admin/AdminDashboard";
import CreateBatch from './components/Admin/CreateBatch';
import PasswordRequests from "./components/Admin/PasswordRequests";

// Public
import Forbidden from "./components/Public/Forbidden";
import NotFound from "./components/Public/NotFound";
import Login from "./components/Public/Login";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/schooldashboard"
            element={
              <ProtectedRoute allowedRoles={["Staff"]}>
                <SchoolDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ticket"
            element={
              <ProtectedRoute allowedRoles={["Staff"]}>
                <Ticket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/createticket"
            element={
              <ProtectedRoute allowedRoles={["Staff"]}>
                <CreateTicket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resetpassword"
            element={
              <ProtectedRoute allowedRoles={['Staff']}>
                <ResetPassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admindashboard"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passwordrequests"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <PasswordRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path='/createbatch'
            element={<ProtectedRoute allowedRoles={['Admin']}><CreateBatch /></ProtectedRoute>}
          />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
