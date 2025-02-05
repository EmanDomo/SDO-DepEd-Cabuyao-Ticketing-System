import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext"; // Make sure this import is correct

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const { logout } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/forbidden");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            setAdmin(decoded.adminName); // Get the admin name from the decoded token
        } catch (error) {
            console.error("Invalid token:", error);
            navigate("/forbidden");
        }
    }, [navigate]);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div>
            {admin ? (
                <>
                    <h1>Welcome, {admin}!</h1>
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default AdminDashboard;
