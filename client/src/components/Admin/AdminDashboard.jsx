import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const TicketDashboard = () => {
    const navigate = useNavigate();
    const [school, setSchool] = useState(null);

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

    return school ? <h1>Welcome to {school}</h1> : null;
};

export default TicketDashboard;
