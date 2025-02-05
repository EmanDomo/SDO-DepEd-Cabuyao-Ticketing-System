import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/" />; // Redirect to login if not authenticated
    if (!allowedRoles.includes(user.role)) return <Navigate to="/forbidden" />; // Forbidden access

    return children;
};

export default ProtectedRoute;
