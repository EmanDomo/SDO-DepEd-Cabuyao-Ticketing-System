import Nav from "./Header";
import { useWindowSize } from "react-use";
import React, { useState, useEffect, useRef } from "react"; // Added useRef
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { FaRegTrashAlt } from "react-icons/fa";
import { Container, Card, Col, Form, Row, FloatingLabel, Button, Modal } from "react-bootstrap";

const Ticket = () => {
  const fileInputRef = useRef(null); // Add ref for file input

  const [formData, setFormData] = useState({
    requestor: "",
    category: "",
    subcategory: "",
    otherSubcategory: "",
    request: "",
    comments: "",
    attachments: [],
    attachmentPreviews: [],
  });

  const [ticketNumber, setTicketNumber] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (formData.subcategory) {
      setFormData(prev => ({
        ...prev,
        request: formData.subcategory === "Other" ? formData.otherSubcategory : formData.subcategory
      }));
    }
  }, [formData.subcategory, formData.otherSubcategory]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setFormData(prev => ({
          ...prev,
          requestor: decoded.username || "",
        }));
      } catch (error) {
        console.error("Error decoding token", error);
        setError("Authentication error. Please try logging in again.");
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024;

    if (files.some(file => file.size > maxSize)) {
      setError("Some files exceed the 5MB size limit");
      return;
    }

    files.forEach(file => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, file],
            attachmentPreviews: [...prev.attachmentPreviews, { name: file.name, url: reader.result }],
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, file],
          attachmentPreviews: [...prev.attachmentPreviews, { name: file.name }],
        }));
      }
    });
  };

  const handleRemoveAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
      attachmentPreviews: prev.attachmentPreviews.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!formData.category || !formData.request || !formData.comments) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'attachments' && key !== 'attachmentPreviews') {
        data.append(key, value);
      }
    });
    data.append("status", "Pending");
    formData.attachments.forEach(file => data.append("attachments", file));

    try {
      const response = await axios.post("http://localhost:8080/createTickets", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTicketNumber(response.data.ticketNumber);
      setMessage(response.data.message);
      setFormData(prev => ({
        requestor: prev.requestor,
        category: "",
        subcategory: "",
        otherSubcategory: "",
        request: "",
        comments: "",
        attachments: [],
        attachmentPreviews: [],
      }));
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setShowModal(true);
    } catch (error) {
      console.error("Error submitting ticket:", error);
      setError(error.response?.data?.error || "Error submitting the ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { width } = useWindowSize();
  const sidebarWidth = width >= 768 ? "250px" : "0";

  return (
    <div className="ticket-container" style={{ marginLeft: sidebarWidth, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Nav />
      <Container fluid className="">
        <h3 style={{ color: "#294a70" }}>Ticket Request</h3>
        <Row className="justify-content-center">
          <Col xs={12} sm={11} md={10} lg={8} xl={7}>
            <form onSubmit={handleSubmit}>
              <Card className="shadow-sm">
                <Card.Body className="p-4">
                  <h3 className="mb-4" style={{ color: "#294a70" }}>
                    Requestor: {formData.requestor}
                  </h3>

                  {/* Category */}
                  <Row className="mb-3">
                    <Form.Label column xs={12} sm={3} md={4}>Category</Form.Label>
                    <Col xs={12} sm={9} md={12}>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Hardware">Hardware</option>
                        <option value="Software">Software</option>
                      </Form.Select>
                    </Col>
                  </Row>

                  {formData.category && (
                    <Row className="mb-3">
                      <Form.Label column xs={12} sm={3} md={5}>
                        {formData.category} Issue
                      </Form.Label>
                      <Col xs={12} sm={9} md={12}>
                        <Form.Select
                          name="subcategory"
                          value={formData.subcategory}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Issue</option>
                          {formData.category === "Software" ? (
                            <>
                              <option value="Internet Connection">Internet Connection</option>
                              <option value="Password Resetting">Password Resetting</option>
                              <option value="Other">Other</option>
                            </>
                          ) : (
                            <>
                              <option value="Computer Troubleshooting">Computer Troubleshooting</option>
                              <option value="Printer Troubleshooting">Printer Troubleshooting</option>
                              <option value="Other">Other</option>
                            </>
                          )}
                        </Form.Select>
                      </Col>
                    </Row>
                  )}

                  {formData.subcategory === "Other" && (
                    <Row className="mb-3">
                      <Form.Label column xs={12} sm={3} md={4}>Specify Issue</Form.Label>
                      <Col xs={12} sm={9} md={12}>
                        <Form.Control
                          type="text"
                          name="otherSubcategory"
                          value={formData.otherSubcategory}
                          onChange={handleChange}
                          placeholder="Please specify your issue"
                          required
                        />
                      </Col>
                    </Row>
                  )}

                  {/* Comments */}
                  <Row className="mb-3">
                    <Form.Label column xs={12} sm={3} md={4}>Comments</Form.Label>
                    <Col xs={12} sm={9} md={12}>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="comments"
                        value={formData.comments}
                        onChange={handleChange}
                        placeholder="Please provide additional details"
                        required
                      />
                    </Col>
                  </Row>

                  {/* Attachments */}
                  <Row className="mb-3">
                    <Form.Label column xs={12} sm={3} md={5}>Attachments</Form.Label>
                    <Col xs={12} sm={9} md={12}>
                      <Form.Control
                        ref={fileInputRef} // Add ref here
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                      />
                      {formData.attachmentPreviews.length > 0 && (
                        <div className="mt-3">
                          {formData.attachmentPreviews.map((file, index) => (
                            <div key={index} className="d-flex align-items-center mb-2 p-2">
                              {file.url && (
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="me-2"
                                  style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                />
                              )}
                              <div className="d-flex justify-content-between align-items-center w-100">
                                <span className="text-truncate">{file.name}</span>
                                <Button
                                  variant="link"
                                  className="text-danger p-0 ms-2"
                                  onClick={() => handleRemoveAttachment(index)}
                                >
                                  <FaRegTrashAlt />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card.Body>

                {/* Submit Button */}
                <Card.Footer className="text-center border-0 bg-transparent pb-4">
                  <Button
                    variant="dark"
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2"
                    style={{ minWidth: "150px", backgroundColor: "#294a70", border: "none" }}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </Card.Footer>
              </Card>
            </form>
          </Col>
        </Row>
      </Container>

      {/* Modal for displaying success/error messages */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{message && <p>{message}</p>}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {ticketNumber && (
            <p>
              Your Ticket Number: <strong>{ticketNumber}</strong>
            </p>
          )}
          {error && <p className="text-danger">{error}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Ticket;