import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Context
import { AuthProvider } from "./components/Context/AuthContext";
import ProtectedRoute from "./components/Context/ProtectedRoutes";

// School
import SchoolDashboard from "./components/School/SchoolDashboard";
import Ticket from "./components/School/Ticket";
import ReceiveBatch from "./components/School/ReceiveBatch";
import Completed from "./components/School/Status/Completed";
import Pending from "./components/School/Status/Pending";
import InProgress from "./components/School/Status/InProgress";
import OnHold from "./components/School/Status/OnHold";
import Rejected from "./components/School/Status/Rejected";
import ReceivedBatches from "./components/School/Status/ReceivedBatches";
import PendingBatches from "./components/School/Status/PendingBatches";

// Admin
import AdminDashboard from "./components/Admin/AdminDashboard";
import CreateBatch from "./components/Admin/CreateBatch";
import BatchCreate from "./components/Admin/BatchCreate";
import Batches from "./components/Admin/Batches";
import NewAccountRequests from "./components/Admin/NewAccountRequests";
import ResetAccountRequests from "./components/Admin/ResetAccountRequests";
import SupportTickets from "./components/Admin/SupportTickets";

// Public
import Forbidden from "./components/Public/Forbidden";
import NotFound from "./components/Public/NotFound";
import Login from "./components/Public/Login";
import RequestDepedAccount from "./components/Public/RequestDepedAccount";

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
            path="/completedticket"
            element={
              <ProtectedRoute allowedRoles={["Staff"]}>
                <Completed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pendingticket"
            element={
              <ProtectedRoute allowedRoles={["Staff"]}>
                <Pending />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inprogressticket"
            element={
              <ProtectedRoute allowedRoles={["Staff"]}>
                <InProgress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onholdticket"
            element={
              <ProtectedRoute allowedRoles={["Staff"]}>
                <OnHold />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rejectedticket"
            element={
              <ProtectedRoute allowedRoles={["Staff"]}>
                <Rejected />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recievebatch"
            element={
              <ProtectedRoute allowedRoles={["Staff"]}>
                <ReceiveBatch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receivedbatches"
            element={
              <ProtectedRoute allowedRoles={["Staff"]}>
                <ReceivedBatches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pendingbatches"
            element={
              <ProtectedRoute allowedRoles={["Staff"]}>
                <PendingBatches />
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
          {/* <Route
            path="/newacc"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <NewAccountRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resetacc"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <ResetAccountRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supportticket"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <SupportTickets />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/batchcreate"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <BatchCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/batches"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <Batches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/createbatch"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <CreateBatch />
              </ProtectedRoute>
            }
          />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route
            path="/request-deped-account"
            element={<RequestDepedAccount />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
