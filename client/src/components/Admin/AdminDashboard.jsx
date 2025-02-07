import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";
import "../../styles/AdminDashboard.css";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState(null);
    const [lastName, setLastName] = useState(null);
    const [tickets, setTickets] = useState([]);
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

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get("http://localhost:8080/tickets");
                const data = response.data;

                if (!Array.isArray(data)) {
                    throw new Error("Received data is not an array");
                }

                setTickets(data);
            } catch (error) {
                console.error("Error fetching tickets:", error);
            }
        };

        fetchTickets();
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

                    <h2 className="tickets-heading">Submitted Tickets</h2>
                    {tickets.length > 0 ? (
                        <ul className="tickets-list">
                            {tickets.map((ticket) => (
                                <li className="ticket-item" key={ticket.ticketNumber}>
                                    <div className="ticket-detail">
                                        <strong>Ticket Number:</strong> {ticket.ticketNumber}
                                    </div>
                                    <div className="ticket-detail">
                                        <strong>Category:</strong> {ticket.category}
                                    </div>
                                    <div className="ticket-detail">
                                        <strong>Request:</strong> {ticket.request}
                                    </div>
                                    <div className="ticket-detail">
                                        <strong>Comments:</strong> {ticket.comments}
                                    </div>
                                    {ticket.attachments && ticket.attachments.length > 0 && (
                                        <button className="open-pdf-button" onClick={() => handleOpenPDF(ticket.attachments)}>
                                            Open PDF
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-tickets-message">No tickets submitted yet.</p>
                    )}
                </>
            ) : (
                <p className="loading-message">Loading...</p>
            )}
        </div>
    );
};

export default AdminDashboard;
