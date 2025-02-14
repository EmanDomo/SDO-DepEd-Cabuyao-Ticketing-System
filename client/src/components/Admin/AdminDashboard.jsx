import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";
import "../../styles/AdminDashboard.css";
import { Card, Table, Button, Badge, Form, Alert, Modal, Row, Col } from "react-bootstrap";

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
    const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [currentAttachments, setCurrentAttachments] = useState([]);
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

    const handleOpenAttachments = (attachments) => {
        try {
            const parsedAttachments = JSON.parse(attachments);
            setCurrentAttachments(parsedAttachments);
            setShowAttachmentsModal(true);
        } catch (error) {
            console.error("Error parsing attachments:", error);
            setError("Failed to load attachments");
        }
    };

    const handleUpdateStatus = async (ticketId, newStatus) => {
        try {
            await axios.put(`http://localhost:8080/tickets/${ticketId}/status`, {
                status: newStatus
            });
            await fetchTickets();
            setShowModal(false);
        } catch (error) {
            console.error("Error updating ticket status:", error);
            setError("Failed to update ticket status");
        }
    };

    const getFileIcon = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        switch (ext) {
            case 'pdf': return '📄';
            case 'doc':
            case 'docx': return '📝';
            case 'xls':
            case 'xlsx': return '📊';
            case 'jpg':
            case 'jpeg':
            case 'png': return '🖼️';
            default: return '📎';
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
        switch (status.toLowerCase()) {
            case "completed": return "success";
            case "pending": return "warning";
            case "on hold": return "info";
            case "in progress": return "primary";
            case "rejected": return "danger";
            default: return "secondary";
        }
    };

    const statusOptions = ["Completed", "Pending", "On Hold", "In Progress", "Rejected"];

    return (
        <div className="admin-dashboard p-4">
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                        <h4 className="mb-0">Welcome, {firstName} {lastName}</h4>
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="dark" onClick={handleCreateBatch}>Create Batch</Button>
                        <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
                    </div>
                </Card.Header>
            </Card>

            <Card>
                <Card.Header>
                    <h5 className="mb-3">Ticket Management</h5>
                    <div className="d-flex gap-3 align-items-center flex-wrap">
                        <Form.Control
                            type="text"
                            placeholder="Search tickets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-auto flex-grow-1"
                        />
                        <Form.Select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-auto"
                        >
                            <option value="all">All Status</option>
                            {statusOptions.map(status => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </Form.Select>
                    </div>
                </Card.Header>

                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-4">Loading tickets...</div>
                    ) : filteredTickets.length > 0 ? (
                        <div className="table-responsive">
                            <Table hover className="mb-0">
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
                                                            onClick={() => handleOpenAttachments(ticket.attachments)}
                                                        >
                                                            Files ({JSON.parse(ticket.attachments).length})
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-4">No tickets found.</div>
                    )}
                </Card.Body>
            </Card>

            {/* Ticket Detail Modal */}
            <Modal 
                show={showModal} 
                onHide={() => setShowModal(false)} 
                size="lg"
                centered
            >
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
                                <div className="d-flex gap-2 flex-wrap">
                                    {statusOptions.map(status => (
                                        <Button
                                            key={status}
                                            variant={getStatusBadgeVariant(status)}
                                            onClick={() => handleUpdateStatus(selectedTicket.ticketId, status)}
                                            disabled={selectedTicket.status === status}
                                        >
                                            Mark as {status}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>

            {/* Attachments Modal */}
            <Modal
                show={showAttachmentsModal}
                onHide={() => setShowAttachmentsModal(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Attachments</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {currentAttachments.map((filename, index) => (
                            <Col key={index}>
                                <Card className="h-100">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="text-center mb-3">
                                            <span style={{ fontSize: '2rem' }}>{getFileIcon(filename)}</span>
                                        </div>
                                        <Card.Title className="text-truncate mb-3" title={filename}>
                                            {filename}
                                        </Card.Title>
                                        <div className="mt-auto">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="w-100"
                                                onClick={() => window.open(`http://localhost:8080/uploads/${filename}`, '_blank')}
                                            >
                                                Open File
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AdminDashboard;