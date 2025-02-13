//ADMINDASHBOARD

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";

const PasswordRequests = () => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState(null);
    const [lastName, setLastName] = useState(null);
    const [idasRequests, setIdasRequests] = useState([]); 
    const { logout } = useAuth();

    useEffect(() => {
        const fetchIdasRequests = async () => {
            try {
                const response = await axios.get("http://localhost:8080/idas-reset");
                setIdasRequests(response.data);
            } catch (error) {
                console.error("Error fetching IDAS reset requests:", error);
            }
        };

        fetchIdasRequests();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleOpenPDF = (attachments) => {
        try {
            const parsedAttachments = JSON.parse(attachments);
            if (parsedAttachments.length > 0) {
                const pdfFile = parsedAttachments[0];
                const url = `http://localhost:8080/uploads/${pdfFile}`;
                console.log("Opening URL:", url); 
                window.open(url, "_blank");
            } else {
                console.error("No attachments available");
            }
        } catch (error) {
            console.error("Error parsing attachments:", error);
        }
    };

    return (
        <div className="admin-dashboard">
            {lastName && firstName ? (
                <>
                    <h1 className="welcome-message">Welcome! {lastName}, {firstName}</h1>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>


                    <h2 className="idas-heading">IDAS Reset Requests</h2>
                    {idasRequests.length > 0 ? (
                        <table className="idas-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>School</th>
                                    <th>School ID</th>
                                    <th>Employee Number</th>
                                </tr>
                            </thead>
                            <tbody>
                                {idasRequests.map((request, index) => (
                                    <tr key={index}>
                                        <td>{request.name}</td>
                                        <td>{request.school}</td>
                                        <td>{request.schoolId}</td>
                                        <td>{request.employeeNumber}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="no-idas-message">No IDAS reset requests found.</p>
                    )}
                </>
            ) : (
                <p className="loading-message">Loading...</p>
            )}
            
        </div>
        
    );
};

export default PasswordRequests;
