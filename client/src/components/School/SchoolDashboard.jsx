import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext"

const SchoolDashboard = () => {
    const navigate = useNavigate();
    const [school, setSchool] = useState(null);
    const { logout } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/forbidden");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            setSchool(decoded.school); // Get the school name from the decoded token
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
            {school ? (
                <>
                    <h1>Welcome, {school}!</h1>
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default SchoolDashboard;
