import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";
import "../../styles/AdminDashboard.css";
import { Card, Table, Button, Badge, Form, Alert, Modal } from "react-bootstrap";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState(null);
    const [lastName, setLastName] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const { logout } = useAuth();

    // Authentication check
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

    // Fetch tickets
    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await axios.get("http://localhost:8080/tickets");
            const data = response.data;

            if (!Array.isArray(data)) {
                throw new Error("Received data is not an array");
            }

            setTickets(data);
            setError("");
        } catch (error) {
            console.error("Error fetching tickets:", error);
            setError("Failed to load tickets. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
        // Set up polling for updates every 30 seconds
        const interval = setInterval(fetchTickets, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleCreateBatch = () => {
        navigate("/batchcreate");
    };

    const handleOpenAttachment = (attachments) => {
        try {
            const parsedAttachments = JSON.parse(attachments);
            if (parsedAttachments.length > 0) {
                const file = parsedAttachments[0];
                const url = `http://localhost:8080/uploads/${file}`;
                window.open(url, "_blank");
            }
        } catch (error) {
            console.error("Error parsing attachments:", error);
            setError("Failed to open attachment");
        }
    };

    const handleUpdateStatus = async (ticketId, newStatus) => {
        try {
            await axios.put(`http://localhost:8080/tickets/${ticketId}/status`, {
                status: newStatus
            });
            await fetchTickets(); // Refresh tickets after update
            setShowModal(false);
        } catch (error) {
            console.error("Error updating ticket status:", error);
            setError("Failed to update ticket status");
        }
    };

    const filteredTickets = tickets
        .filter(ticket => {
            if (filterStatus === "all") return true;
            return ticket.status === filterStatus;
        })
        .filter(ticket =>
            searchTerm === "" ||
            ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.requestor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.category.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case "In Progress": return "warning";
            case "Closed": return "success";
            default: return "secondary";
        }
    };

    return (
        <div className="admin-dashboard p-4">
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <div>
                        <h4 className="mb-0">Welcome, {firstName} {lastName}</h4>
                    </div>
                    <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
                    <Button variant="dark" onClick={handleCreateBatch}>Create Batch</Button>
                </Card.Header>
            </Card>

            <Card>
                <Card.Header>
                    <h5 className="mb-3">Ticket Management</h5>
                    <div className="d-flex gap-3 align-items-center">
                        <Form.Control
                            type="text"
                            placeholder="Search tickets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-auto"
                        />
                        <Form.Select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-auto"
                        >
                            <option value="all">All Status</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Closed">Closed</option>
                        </Form.Select>
                    </div>
                </Card.Header>

                <Card.Body>
                    {loading ? (
                        <div className="text-center py-4">Loading tickets...</div>
                    ) : filteredTickets.length > 0 ? (
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>Ticket #</th>
                                    <th>Requestor</th>
                                    <th>Category</th>
                                    <th>Request</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTickets.map((ticket) => (
                                    <tr key={ticket.ticketNumber}>
                                        <td>{ticket.ticketNumber}</td>
                                        <td>{ticket.requestor}</td>
                                        <td>{ticket.category}</td>
                                        <td>{ticket.request}</td>
                                        <td>
                                            <Badge bg={getStatusBadgeVariant(ticket.status)}>
                                                {ticket.status}
                                            </Badge>
                                        </td>
                                        <td>{new Date(ticket.date).toLocaleDateString()}</td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    onClick={() => {
                                                        setSelectedTicket(ticket);
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    View
                                                </Button>
                                                {ticket.attachments && JSON.parse(ticket.attachments).length > 0 && (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleOpenAttachment(ticket.attachments)}
                                                    >
                                                        Attachments
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <div className="text-center py-4">No tickets found.</div>
                    )}
                </Card.Body>
            </Card>

            {/* Ticket Detail Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Ticket Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedTicket && (
                        <div>
                            <h6>Ticket Number: {selectedTicket.ticketNumber}</h6>
                            <p><strong>Requestor:</strong> {selectedTicket.requestor}</p>
                            <p><strong>Category:</strong> {selectedTicket.category}</p>
                            <p><strong>Request:</strong> {selectedTicket.request}</p>
                            <p><strong>Comments:</strong> {selectedTicket.comments}</p>
                            <p><strong>Status:</strong> 
                                <Badge bg={getStatusBadgeVariant(selectedTicket.status)} className="ms-2">
                                    {selectedTicket.status}
                                </Badge>
                            </p>
                            <div className="mt-3">
                                <h6>Update Status:</h6>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="warning"
                                        onClick={() => handleUpdateStatus(selectedTicket.ticketId, "In Progress")}
                                        disabled={selectedTicket.status === "In Progress"}
                                    >
                                        Mark In Progress
                                    </Button>
                                    <Button
                                        variant="success"
                                        onClick={() => handleUpdateStatus(selectedTicket.ticketId, "Closed")}
                                        disabled={selectedTicket.status === "Closed"}
                                    >
                                        Close Ticket
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AdminDashboard;