import Nav from "./Header";
import { useWindowSize } from "react-use";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../../styles/CreateTicket.css";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import { FaRegTrashAlt } from "react-icons/fa";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

const Ticket = () => {
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

  // Automatically set request based on subcategory selection
  useEffect(() => {
    if (formData.subcategory) {
      if (formData.subcategory === "Other") {
        setFormData(prev => ({
          ...prev,
          request: formData.otherSubcategory
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          request: formData.subcategory
        }));
      }
    }
  }, [formData.subcategory, formData.otherSubcategory]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setFormData((prev) => ({
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear any previous errors
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB limit
    
    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError("Some files exceed the 5MB size limit");
      return;
    }

    const newAttachments = [];
    const previews = [];

    files.forEach(file => {
      newAttachments.push(file);
      
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push({ name: file.name, url: reader.result });
          setFormData((prev) => ({
            ...prev,
            attachments: newAttachments,
            attachmentPreviews: [
              ...prev.attachmentPreviews,
              { name: file.name, url: reader.result },
            ],
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setFormData((prev) => ({
          ...prev,
          attachments: newAttachments,
          attachmentPreviews: [...prev.attachmentPreviews, { name: file.name }],
        }));
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    // Validate required fields
    if (!formData.category || !formData.request || !formData.comments) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append("requestor", formData.requestor);
    data.append("category", formData.category);
    data.append("request", formData.request);
    data.append("comments", formData.comments);
    data.append("status", "In Progress"); // Set initial status

    formData.attachments.forEach((file) => {
      data.append("attachments", file);
    });

    try {
      const response = await axios.post(
        "http://localhost:8080/createTickets",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setTicketNumber(response.data.ticketNumber);
      setMessage(response.data.message);
      setFormData({
        requestor: formData.requestor,
        category: "",
        subcategory: "",
        otherSubcategory: "",
        request: "",
        comments: "",
        attachments: [],
        attachmentPreviews: [],
      });
    } catch (error) {
      console.error("Error submitting ticket:", error);
      setError(error.response?.data?.error || "Error submitting the ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { width } = useWindowSize();
  
  return (
    <div
      style={{
        marginLeft: width >= 768 ? "250px" : "0",
        marginTop: "30px",
        padding: "20px",
      }}
    >
      <Nav />
      <div>
        <form onSubmit={handleSubmit}>
          <Card
            className="m-auto mt-5"
            style={{
              width: "60%",
              border: "none",
              boxShadow: "2px 2px 10px 2px rgba(0, 0, 0, 0.15)",
              height: "60vh",
              overflowY: "auto"
            }}
          >
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}
            {ticketNumber && (
              <Alert variant="info">
                Your Ticket Number: <strong>{ticketNumber}</strong>
              </Alert>
            )}
            <Card.Body>
              <div className="mb-4">
                <h3>Requestor: {formData.requestor}</h3>
              </div>
              <div>
                {/* <div className="bg-success">eer</div>
          <div className="bg-secondary">reer</div> */}
                <Form.Group
                  as={Row}
                  className="mb-3"
                  controlId="formPlaintextPassword"
                >
                  <Form.Label column sm="2">
                    Category
                  </Form.Label>
                  <Col sm="10">
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
                </Form.Group>
                {formData.category === "Software" && (
                  <Form.Group
                    as={Row}
                    className="mb-3"
                    controlId="formPlaintextPassword"
                  >
                    <Form.Label column sm="2">
                      Software Issue
                    </Form.Label>
                    <Col sm="10">
                      <Form.Select
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Issue</option>
                        <option value="Internet Connection">
                          Internet Connection
                        </option>
                        <option value="Password Resetting">
                          Password Resetting
                        </option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Col>
                  </Form.Group>
                )}
                {formData.category === "Hardware" && (
                  <Form.Group
                    as={Row}
                    className="mb-3"
                    controlId="formPlaintextPassword"
                  >
                    <Form.Label column sm="2">
                      Hardware Issue
                    </Form.Label>
                    <Col sm="10">
                      <Form.Select
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Issue</option>
                        <option value="Computer Troubleshooting">
                          Computer Troubleshooting
                        </option>
                        <option value="Printer Troubleshooting">
                          Printer Troubleshooting
                        </option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Col>
                  </Form.Group>
                )}
                {formData.subcategory === "Other" && (
                  <Form.Group
                    as={Row}
                    className="mb-3"
                    controlId="formPlaintextPassword"
                  >
                    <Form.Label column sm="2">
                      Specify Your Issue
                    </Form.Label>
                    <Col sm="10">
                      <FloatingLabel controlId="floatingPassword" label="Issue">
                        <Form.Control
                          type="text"
                          name="otherSubcategory"
                          value={formData.otherSubcategory}
                          onChange={handleChange}
                          placeholder="Issue"
                          required
                        />
                      </FloatingLabel>
                    </Col>
                  </Form.Group>
                )}
                <Form.Group
                  as={Row}
                  className="mb-3"
                  controlId="formPlaintextPassword"
                >
                  <Form.Label column sm="2">
                    Additional Comments
                  </Form.Label>
                  <Col sm="10">
                    {/* First FloatingLabel */}
                    <FloatingLabel
                      controlId="floatingTextarea1"
                      label="Comments"
                    >
                      <Form.Control
                        as="textarea"
                        placeholder="Leave a comment here"
                        style={{ height: "100px" }}
                        name="comments"
                        value={formData.comments}
                        onChange={handleChange}
                        required
                      />
                    </FloatingLabel>
                  </Col>
                </Form.Group>
                <Form.Group
                  as={Row}
                  className="mb-3"
                  controlId="formPlaintextPassword"
                >
                  <Form.Label column sm="2">
                    Attachment/s
                  </Form.Label>
                  <Col sm="10">
                    <Form.Control
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                    />
                    {formData.attachmentPreviews.length > 0 && (
                      <div className="mt-3">
                        {formData.attachmentPreviews.map((file, index) => (
                          <div
                            key={index}
                            className="d-flex align-items-center mb-2"
                          >
                            {file.url && (
                              <img
                                src={file.url}
                                alt={file.name}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  marginRight: "10px",
                                }}
                              />
                            )}
                            <div
                              className="d-flex justify-content-between pe-2"
                              style={{ width: "100%" }}
                            >
                              <div>
                                <span>{file.name}</span>
                              </div>
                              <div>
                                <button
                                  type="button"
                                  className="btn text-danger"
                                  onClick={() => handleRemoveAttachment(index)}
                                >
                                  <FaRegTrashAlt />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Col>
                </Form.Group>
              </div>
              <div></div>
            </Card.Body>

            <Card.Footer
              className="d-flex justify-content-center mb-3"
              style={{ backgroundColor: "transparent", border: "none" }}
            >
              <Button variant="dark" type="submit" style={{ width: "25%" }}>
                Submit
              </Button>
            </Card.Footer>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default Ticket;
