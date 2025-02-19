import React, { useState, useEffect } from "react";
import { Card, Table, Badge, Button, Modal } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Swal from "sweetalert2";

const TicketList = ({ status }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [currentAttachments, setCurrentAttachments] = useState([]);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);

  const NON_ARCHIVABLE_STATUSES = ["In Progress", "On Hold"];

  const handleArchiveTicket = async (ticketId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      });
  
      if (result.isConfirmed) {
        await axios.put(`http://localhost:8080/tickets/${ticketId}/archive`);
        setTickets((prevTickets) =>
          prevTickets.filter((ticket) => ticket.ticketId !== ticketId)
        );
  
        await Swal.fire({
          title: "Archived!",
          text: "The ticket has been archived.",
          icon: "success"
        });
      }
    } catch (error) {
      setError("Failed to archive ticket");
      console.error("Archive error:", error);
    }
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token");

        const decoded = jwtDecode(token);
        const response = await axios.get(
          `http://localhost:8080/tickets/${decoded.username}/${status}`
        );
        setTickets(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, [status]);

  const handleOpenAttachments = (attachments) => {
    try {
      const parsedAttachments = JSON.parse(attachments);
      setCurrentAttachments(parsedAttachments);
      setShowAttachmentsModal(true);
    } catch (error) {
      setError("Failed to load attachments");
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "xls":
      case "xlsx":
        return "📊";
      case "jpg":
      case "jpeg":
      case "png":
        return "🖼️";
      default:
        return "📎";
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading tickets...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-danger">{error}</div>
    </div>
  );

  return (
    <div className="vh-90 d-flex flex-column" style={{ marginTop: '60px' }}> {/* Add top margin */}
      <Card className="flex-grow-1 m-0 border-0 rounded-0">
        <Card.Header className="text-black py-3 sticky-top" style={{ top: '56px', backgroundColor: "transparent" }}> {/* Adjust sticky position */}
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">{status} Tickets</h5>
              <span className="badge bg-dark text-light">
                {tickets.length} Tickets
              </span>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {tickets.length === 0 ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="text-muted">
                No {status.toLowerCase()} tickets found.
              </div>
            </div>
          ) : (
            <div className="table-responsive" style={{ height: 'calc(100vh - 126px)', overflowY: 'auto' }}> {/* Adjust height calculation */}
              <Table hover className="mb-0">
                <thead className="sticky-top bg-white" style={{ top: '0' }}> {/* Reset sticky position for table header */}
                  <tr>
                    <th className="px-3">Ticket #</th>
                    <th className="px-3">Category</th>
                    <th className="px-3">Request</th>
                    <th className="px-3">Date</th>
                    <th className="px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.ticketNumber}>
                      <td className="px-3">{ticket.ticketNumber}</td>
                      <td className="px-3">{ticket.category}</td>
                      <td className="px-3">
                        <div className="text-truncate" style={{ maxWidth: '300px' }}>
                          {ticket.request}
                        </div>
                      </td>
                      <td className="px-3">{new Date(ticket.date).toLocaleDateString()}</td>
                      <td className="px-3">
                        <div className="d-flex gap-2 flex-wrap">
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
                          {!NON_ARCHIVABLE_STATUSES.includes(status) && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleArchiveTicket(ticket.ticketId)}
                            >
                              Delete
                            </Button>
                          )}
                          {ticket.attachments && JSON.parse(ticket.attachments).length > 0 && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleOpenAttachments(ticket.attachments)}
                            >
                              Files
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Ticket Detail Modal */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Ticket Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && (
            <div className="container-fluid">
              <div className="row g-3">
                <div className="col-md-6">
                  <p className="mb-2">
                    <strong>Ticket Number:</strong><br />
                    {selectedTicket.ticketNumber}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-2">
                    <strong>Category:</strong><br />
                    {selectedTicket.category}
                  </p>
                </div>
                <div className="col-12">
                  <p className="mb-2">
                    <strong>Request:</strong><br />
                    {selectedTicket.request}
                  </p>
                </div>
                <div className="col-12">
                  <p className="mb-2">
                    <strong>Comments:</strong><br />
                    {selectedTicket.comments}
                  </p>
                </div>
                <div className="col-12">
                  <p className="mb-0">
                    <strong>Date:</strong><br />
                    {new Date(selectedTicket.date).toLocaleString()}
                  </p>
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
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Attachments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-3">
            {currentAttachments.map((filename, index) => (
              <div key={index} className="col-sm-6 col-md-4 col-lg-3">
                <div className="border rounded p-3 text-center h-100">
                  <div className="mb-2" style={{ fontSize: "2rem" }}>
                    {getFileIcon(filename)}
                  </div>
                  <div className="text-truncate small mb-2">
                    {filename}
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-auto"
                    onClick={() => window.open(`http://localhost:8080/uploads/${filename}`, "_blank")}
                  >
                    Open File
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TicketList;