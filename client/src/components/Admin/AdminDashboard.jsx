import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";



const AdminDashboard = () => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState(null);
    const [lastName, setLastName] = useState(null);
    const { logout } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/forbidden");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            setLastName(decoded.lastname);
            setFirstName(decoded.firstname);
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
            {lastName && firstName ? (
                <>
                    <h1>Welcome! {lastName}, {firstName}</h1>
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>

 
       
    );
};

export default AdminDashboard;
