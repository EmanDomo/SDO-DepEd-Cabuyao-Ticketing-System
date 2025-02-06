import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();

    if (!user) {
        // Redirect to login if not authenticated
        return <Navigate to="/" />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Redirect to forbidden if the user's role is not allowed
        return <Navigate to="/forbidden" />;
    }

    return children;
};

export default ProtectedRoute;
