// TicketList.jsx - Shared component for all status views
import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const TicketList = ({ status }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [currentAttachments, setCurrentAttachments] = useState([]);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token');

        const decoded = jwtDecode(token);
        const response = await axios.get(`http://localhost:8080/tickets/${decoded.username}/${status}`);
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

  if (loading) return <div className="text-center p-4">Loading tickets...</div>;
  if (error) return <div className="text-center p-4 text-danger">{error}</div>;

  return (
    <div className="p-4">
      <Card>
        <Card.Header>
          <h5 className="mb-0">{status} Tickets</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {tickets.length === 0 ? (
            <div className="text-center p-4">No {status.toLowerCase()} tickets found.</div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th>Ticket #</th>
                    <th>Category</th>
                    <th>Request</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.ticketNumber}>
                      <td>{ticket.ticketNumber}</td>
                      <td>{ticket.category}</td>
                      <td>{ticket.request}</td>
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
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ticket Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && (
            <div>
              <p><strong>Ticket Number:</strong> {selectedTicket.ticketNumber}</p>
              <p><strong>Category:</strong> {selectedTicket.category}</p>
              <p><strong>Request:</strong> {selectedTicket.request}</p>
              <p><strong>Comments:</strong> {selectedTicket.comments}</p>
              <p><strong>Date:</strong> {new Date(selectedTicket.date).toLocaleString()}</p>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Attachments Modal */}
      <Modal show={showAttachmentsModal} onHide={() => setShowAttachmentsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Attachments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-wrap gap-3">
            {currentAttachments.map((filename, index) => (
              <div key={index} className="border rounded p-3 text-center">
                <div className="mb-2" style={{ fontSize: '2rem' }}>{getFileIcon(filename)}</div>
                <div className="text-truncate" style={{ maxWidth: '150px' }}>{filename}</div>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.open(`http://localhost:8080/uploads/${filename}`, '_blank')}
                >
                  Open File
                </Button>
              </div>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TicketList;