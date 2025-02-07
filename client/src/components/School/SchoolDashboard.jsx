import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext"
import Nav from "./Header";

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
            setSchool(decoded.school); token
        } catch (error) {
            console.error("Invalid token:", error);
            navigate("/forbidden");
        }
    }, [navigate]);

    const handleLogout = () => {
        logout();
        navigate("/");
    };


    //try lang to gab kung mawawala yung token kapag nag next page ako
    const navigateToCreateTicket = () => {
        navigate("/createticket");
    };

    return (
        <div>
            <Nav/>
            {school ? (
                <>
                    <Nav/>
                    <h1>Welcome, {school}!</h1>
                    <button onClick={handleLogout}>Logout</button>
                    <button onClick={navigateToCreateTicket}>Go to Create Ticket</button>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default SchoolDashboard;
