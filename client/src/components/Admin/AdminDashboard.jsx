import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";
import "../../styles/AdminDashboard.css";
import { Card, Table, Button, Badge, Form, Alert, Modal, Row, Col, Nav, Tab } from "react-bootstrap";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState(null);
    const [lastName, setLastName] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [newAccountRequests, setNewAccountRequests] = useState([]);
    const [resetAccountRequests, setResetAccountRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [currentAttachments, setCurrentAttachments] = useState([]);
    const [activeTab, setActiveTab] = useState("tickets");
    const [selectedNewRequest, setSelectedNewRequest] = useState(null);
    const [selectedResetRequest, setSelectedResetRequest] = useState(null);
    const [showNewRequestModal, setShowNewRequestModal] = useState(false);
    const [showResetRequestModal, setShowResetRequestModal] = useState(false);
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

    // Fetch new account requests
    const fetchNewAccountRequests = async () => {
        try {
            const response = await axios.get("http://localhost:8080/deped-account-requests");
            const data = response.data;

            if (!Array.isArray(data)) {
                throw new Error("Received new account data is not an array");
            }

            setNewAccountRequests(data);
        } catch (error) {
            console.error("Error fetching new account requests:", error);
            setError("Failed to load new account requests. Please try again later.");
        }
    };

    // Fetch reset account requests
    const fetchResetAccountRequests = async () => {
        try {
            const response = await axios.get("http://localhost:8080/deped-account-reset-requests");
            const data = response.data;

            if (!Array.isArray(data)) {
                throw new Error("Received reset account data is not an array");
            }

            setResetAccountRequests(data);
        } catch (error) {
            console.error("Error fetching reset account requests:", error);
            setError("Failed to load reset account requests. Please try again later.");
        }
    };

    // Fetch all data
    const fetchAllData = async () => {
        setLoading(true);
        await Promise.all([
            fetchTickets(),
            fetchNewAccountRequests(),
            fetchResetAccountRequests()
        ]);
        setLoading(false);
    };

    useEffect(() => {
        fetchAllData();
        const interval = setInterval(fetchAllData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleCreateBatch = () => {
        navigate("/createbatch");
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

    const handleUpdateNewAccountStatus = async (requestId, newStatus) => {
        try {
            await axios.put(`http://localhost:8080/deped-account-requests/${requestId}/status`, {
                status: newStatus
            });
            await fetchNewAccountRequests();
            setShowNewRequestModal(false);
        } catch (error) {
            console.error("Error updating new account request status:", error);
            setError("Failed to update request status");
        }
    };

    const handleUpdateResetAccountStatus = async (requestId, newStatus) => {
        try {
            await axios.put(`http://localhost:8080/deped-account-reset-requests/${requestId}/status`, {
                status: newStatus
            });
            await fetchResetAccountRequests();
            setShowResetRequestModal(false);
        } catch (error) {
            console.error("Error updating reset account request status:", error);
            setError("Failed to update request status");
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

    const filteredNewAccountRequests = newAccountRequests
        .filter(request => {
            if (filterStatus === "all") return true;
            return request.status.toLowerCase() === filterStatus.toLowerCase();
        })
        .filter(request =>
            searchTerm === "" ||
            request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.school.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const filteredResetAccountRequests = resetAccountRequests
        .filter(request => {
            if (filterStatus === "all") return true;
            return request.status.toLowerCase() === filterStatus.toLowerCase();
        })
        .filter(request =>
            searchTerm === "" ||
            request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.school.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const getStatusBadgeVariant = (status) => {
        switch (status.toLowerCase()) {
            case "completed": return "success";
            case "pending": return "warning";
            case "on hold": return "secondary"
            case "in progress": return "primary";
            case "rejected": return "danger";
            default: return "secondary";
        }
    };

    const statusOptions = ["Completed", "Pending", "On Hold", "In Progress", "Rejected"];
    const accountStatusOptions = ["Completed", "Pending", "On Hold", "In Progress", "Rejected"];

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

            <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                <Card>
                    <Card.Header>
                        <Nav variant="tabs">
                            <Nav.Item>
                                <Nav.Link eventKey="tickets">Support Tickets</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="newAccounts">New Account Requests</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="resetAccounts">Reset Account Requests</Nav.Link>
                            </Nav.Item>
                        </Nav>
                        
                        <div className="mt-3 d-flex gap-3 align-items-center flex-wrap">
                            <Form.Control
                                type="text"
                                placeholder="Search..."
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
                                {activeTab === "tickets" ? (
                                    statusOptions.map(status => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))
                                ) : (
                                    accountStatusOptions.map(status => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))
                                )}
                            </Form.Select>
                        </div>
                    </Card.Header>

                    <Card.Body className="p-0">
                        <Tab.Content>
                            {/* Tickets Tab */}
                            <Tab.Pane eventKey="tickets">
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
                            </Tab.Pane>

                            {/* New Account Requests Tab */}
                            <Tab.Pane eventKey="newAccounts">
                                {loading ? (
                                    <div className="text-center py-4">Loading requests...</div>
                                ) : filteredNewAccountRequests.length > 0 ? (
                                    <div className="table-responsive">
                                        <Table hover className="mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Request ID</th>
                                                    <th>Name</th>
                                                    <th>Account Type</th>
                                                    <th>School</th>
                                                    <th>Designation</th>
                                                    <th>Status</th>
                                                    <th>Date</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredNewAccountRequests.map((request) => (
                                                    <tr key={request.id}>
                                                        <td>{request.id}</td>
                                                        <td>{request.name}</td>
                                                        <td>{request.selected_type}</td>
                                                        <td>{request.school}</td>
                                                        <td>{request.designation}</td>
                                                        <td>
                                                            <Badge bg={getStatusBadgeVariant(request.status)}>
                                                                {request.status}
                                                            </Badge>
                                                        </td>
                                                        <td>{new Date(request.created_at).toLocaleDateString()}</td>
                                                        <td>
                                                            <Button 
                                                                size="sm" 
                                                                variant="primary"
                                                                onClick={() => {
                                                                    setSelectedNewRequest(request);
                                                                    setShowNewRequestModal(true);
                                                                }}
                                                            >
                                                                View Details
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">No new account requests found.</div>
                                )}
                            </Tab.Pane>

                            {/* Reset Account Requests Tab */}
                            <Tab.Pane eventKey="resetAccounts">
                                {loading ? (
                                    <div className="text-center py-4">Loading requests...</div>
                                ) : filteredResetAccountRequests.length > 0 ? (
                                    <div className="table-responsive">
                                        <Table hover className="mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Request ID</th>
                                                    <th>Name</th>
                                                    <th>Account Type</th>
                                                    <th>School</th>
                                                    <th>Employee Number</th>
                                                    <th>Status</th>
                                                    <th>Date</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredResetAccountRequests.map((request) => (
                                                    <tr key={request.id}>
                                                        <td>{request.id}</td>
                                                        <td>{request.name}</td>
                                                        <td>{request.selected_type}</td>
                                                        <td>{request.school}</td>
                                                        <td>{request.employee_number}</td>
                                                        <td>
                                                            <Badge bg={getStatusBadgeVariant(request.status)}>
                                                                {request.status}
                                                            </Badge>
                                                        </td>
                                                        <td>{new Date(request.created_at).toLocaleDateString()}</td>
                                                        <td>
                                                            <Button 
                                                                size="sm" 
                                                                variant="primary"
                                                                onClick={() => {
                                                                    setSelectedResetRequest(request);
                                                                    setShowResetRequestModal(true);
                                                                }}
                                                            >
                                                                View Details
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">No reset account requests found.</div>
                                )}
                            </Tab.Pane>
                        </Tab.Content>
                    </Card.Body>
                </Card>
            </Tab.Container>

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

            {/* New Account Request Detail Modal */}
            <Modal 
                show={showNewRequestModal} 
                onHide={() => setShowNewRequestModal(false)} 
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>New Account Request Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedNewRequest && (
                        <div>
                            <h6>Request ID: {selectedNewRequest.id}</h6>
                            <p><strong>Name:</strong> {selectedNewRequest.name}</p>
                            <p><strong>Email:</strong> {selectedNewRequest.email}</p>
                            <p><strong>Account Type:</strong> {selectedNewRequest.selected_type}</p>
                            <p><strong>School:</strong> {selectedNewRequest.school}</p>
                            <p><strong>Designation:</strong> {selectedNewRequest.designation}</p>
                            <p><strong>Phone Number:</strong> {selectedNewRequest.phone_number}</p>
                            <p><strong>Date Created:</strong> {new Date(selectedNewRequest.created_at).toLocaleString()}</p>
                            <p><strong>Status:</strong> 
                                <Badge bg={getStatusBadgeVariant(selectedNewRequest.status)} className="ms-2">
                                    {selectedNewRequest.status}
                                </Badge>
                            </p>
                            <div className="mt-3">
                                <h6>Update Status:</h6>
                                <div className="d-flex gap-2 flex-wrap">
                                    {accountStatusOptions.map(status => (
                                        <Button
                                            key={status}
                                            variant={getStatusBadgeVariant(status)}
                                            onClick={() => handleUpdateNewAccountStatus(selectedNewRequest.id, status)}
                                            disabled={selectedNewRequest.status.toLowerCase() === status.toLowerCase()}
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

            {/* Reset Account Request Detail Modal */}
            <Modal 
                show={showResetRequestModal} 
                onHide={() => setShowResetRequestModal(false)} 
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Reset Account Request Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedResetRequest && (
                        <div>
                            <h6>Request ID: {selectedResetRequest.id}</h6>
                            <p><strong>Name:</strong> {selectedResetRequest.name}</p>
                            <p><strong>Email:</strong> {selectedResetRequest.email}</p>
                            <p><strong>Account Type:</strong> {selectedResetRequest.selected_type}</p>
                            <p><strong>School:</strong> {selectedResetRequest.school}</p>
                            <p><strong>Employee Number:</strong> {selectedResetRequest.employee_number}</p>
                            <p><strong>Phone Number:</strong> {selectedResetRequest.phone_number}</p>
                            <p><strong>Date Created:</strong> {new Date(selectedResetRequest.created_at).toLocaleString()}</p>
                            <p><strong>Status:</strong> 
                                <Badge bg={getStatusBadgeVariant(selectedResetRequest.status)} className="ms-2">
                                    {selectedResetRequest.status}
                                </Badge>
                            </p>
                            <div className="mt-3">
                                <h6>Update Status:</h6>
                                <div className="d-flex gap-2 flex-wrap">
                                    {accountStatusOptions.map(status => (
                                        <Button
                                            key={status}
                                            variant={getStatusBadgeVariant(status)}
                                            onClick={() => handleUpdateResetAccountStatus(selectedResetRequest.id, status)}
                                            disabled={selectedResetRequest.status.toLowerCase() === status.toLowerCase()}
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
        </div>
    );
};

export default AdminDashboard;

