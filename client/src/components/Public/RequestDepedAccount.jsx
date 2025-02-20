import React, { useState } from "react";
import { Form, Button, Container, Card, Row, Col, Alert, FloatingLabel } from "react-bootstrap";
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Modal } from 'react-bootstrap';

const RequestDepedAccount = () => {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedRequestType, setSubmittedRequestType] = useState("");
  const [formData, setFormData] = useState({
    requestType: "", // New field: request type (new/reset)
    selectedType: "",
    name: "",
    designation: "",
    school: "",
    schoolID: "",
    personalGmail: "",
    employeeNumber: "", // New field for reset
    proofOfIdentity: null,
    prcID: null,
    endorsementLetter: null,
    attachmentPreviews: []
  });

  const [message] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestTypeChange = (e) => {
    setFormData(prev => ({ 
      ...prev, 
      requestType: e.target.value,
      // Reset selectedType when changing request type
      selectedType: ""
    }));
    setError("");
  };

  const handleTypeChange = (e) => {
    setFormData(prev => ({ ...prev, selectedType: e.target.value }));
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB limit

    if (file.size > maxSize) {
      setError("File size exceeds 5MB limit");
      return;
    }

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [name]: file,
          attachmentPreviews: [
            ...prev.attachmentPreviews,
            { name: file.name, url: reader.result, type: name }
          ]
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: file,
        attachmentPreviews: [
          ...prev.attachmentPreviews,
          { name: file.name, type: name }
        ]
      }));
    }
  };

  const handleRemoveAttachment = (type) => {
    setFormData(prev => ({
      ...prev,
      [type]: null,
      attachmentPreviews: prev.attachmentPreviews.filter(file => file.type !== type)
    }));
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/"); // Redirect to login page
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validation for both request types
    if (!formData.requestType || !formData.selectedType || !formData.name || 
        !formData.school || !formData.schoolID) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    // Additional validation for new account request
    if (formData.requestType === "new" && (
        !formData.designation || !formData.personalGmail || 
        !formData.proofOfIdentity || !formData.prcID || !formData.endorsementLetter)) {
      setError("Please fill in all required fields for new account request");
      setIsSubmitting(false);
      return;
    }

    // Additional validation for reset account request
    if (formData.requestType === "reset" && !formData.employeeNumber) {
      setError("Please provide your employee number");
      setIsSubmitting(false);
      return;
    }

    try {
      const currentRequestType = formData.requestType;
      // Determine the endpoint based on request type
      const endpoint = formData.requestType === "new" 
        ? "http://localhost:8080/request-deped-account"
        : "http://localhost:8080/reset-deped-account";
      
      if (formData.requestType === "new") {
        // For new account requests, use FormData to handle file uploads
        const formDataToSend = new FormData();
        formDataToSend.append("selected_type", formData.selectedType);
        formDataToSend.append("name", formData.name);
        formDataToSend.append("designation", formData.designation);
        formDataToSend.append("school", formData.school);
        formDataToSend.append("school_id", formData.schoolID);
        formDataToSend.append("personal_gmail", formData.personalGmail);
        formDataToSend.append("proofOfIdentity", formData.proofOfIdentity);
        formDataToSend.append("prcID", formData.prcID);
        formDataToSend.append("endorsementLetter", formData.endorsementLetter);
        
        const response = await fetch(endpoint, {
          method: "POST",
          body: formDataToSend
        });
        
        if (response.ok) {
          const data = await response.json();
          setSubmittedRequestType(currentRequestType); // Save the request type
          setShowSuccessModal(true);
          // Reset form
          setFormData({
            requestType: "",
            selectedType: "",
            name: "",
            designation: "",
            school: "",
            schoolID: "",
            personalGmail: "",
            employeeNumber: "",
            proofOfIdentity: null,
            prcID: null,
            endorsementLetter: null,
            attachmentPreviews: []
          });
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to submit request. Please try again.");
        }
      } else {
        // For reset account requests, send JSON data
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            selected_type: formData.selectedType,
            name: formData.name,
            school: formData.school,
            school_id: formData.schoolID,
            employee_number: formData.employeeNumber
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setSubmittedRequestType(currentRequestType); // Save the request type
          setShowSuccessModal(true);
          // Reset form
          setFormData({
            requestType: "",
            selectedType: "",
            name: "",
            designation: "",
            school: "",
            schoolID: "",
            personalGmail: "",
            employeeNumber: "",
            proofOfIdentity: null,
            prcID: null,
            endorsementLetter: null,
            attachmentPreviews: []
          });
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to submit request. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      if (error.name === 'AbortError') {
        setError("Request timed out. Please check your connection and try again.");
      } else if (!window.navigator.onLine) {
        setError("No internet connection. Please check your network and try again.");
      } else {
        setError("Error submitting request. Please ensure the server is running and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="mt-5">
      <form onSubmit={handleSubmit}>
        <Card 
          className="m-auto"
          style={{
            width: "60%",
            border: "none",
            boxShadow: "2px 2px 10px 2px rgba(0, 0, 0, 0.15)",
            height: "80vh",
            overflowY: "auto"
          }}
        >
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          
          <Card.Body>
            <div className="mb-4">
              <h3>DepEd Account Request</h3>
            </div>

            {/* Request Type dropdown */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="2">Request Type</Form.Label>
              <Col sm="10">
                <Form.Select 
                  value={formData.requestType} 
                  name="requestType"
                  onChange={handleRequestTypeChange} 
                  required
                >
                  <option value="">-- Select Request Type --</option>
                  <option value="new">Request New Account</option>
                  <option value="reset">Reset Existing Account</option>
                </Form.Select>
              </Col>
            </Form.Group>

            {/* Conditional form fields based on request type */}
            {formData.requestType && (
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="2">Account Type</Form.Label>
                <Col sm="10">
                  <Form.Select 
                    value={formData.selectedType} 
                    name="selectedType"
                    onChange={handleTypeChange} 
                    required
                  >
                    <option value="">-- Select Account Type --</option>
                    <option value="gmail">DepEd Gmail Account</option>
                    <option value="office365">Office 365 Account</option>
                  </Form.Select>
                </Col>
              </Form.Group>
            )}

            {/* Common fields for both request types */}
            {formData.selectedType && (
              <>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="2">Name</Form.Label>
                  <Col sm="10">
                    <FloatingLabel label="Full Name">
                      <Form.Control 
                        type="text" 
                        name="name" 
                        value={formData.name}
                        onChange={handleChange} 
                        placeholder="Full Name"
                        required 
                      />
                    </FloatingLabel>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="2">School</Form.Label>
                  <Col sm="10">
                    <FloatingLabel label="School">
                      <Form.Control 
                        type="text" 
                        name="school" 
                        value={formData.school}
                        onChange={handleChange} 
                        placeholder="School"
                        required 
                      />
                    </FloatingLabel>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="2">School ID</Form.Label>
                  <Col sm="10">
                    <FloatingLabel label="School ID">
                      <Form.Control 
                        type="text" 
                        name="schoolID" 
                        value={formData.schoolID}
                        onChange={handleChange} 
                        placeholder="School ID"
                        required 
                      />
                    </FloatingLabel>
                  </Col>
                </Form.Group>

                {/* Fields specific to new account request */}
                {formData.requestType === "new" && (
                  <>
                    <Form.Group as={Row} className="mb-3">
                      <Form.Label column sm="2">Designation</Form.Label>
                      <Col sm="10">
                        <FloatingLabel label="Designation">
                          <Form.Control 
                            type="text" 
                            name="designation" 
                            value={formData.designation}
                            onChange={handleChange} 
                            placeholder="Designation"
                            required 
                          />
                        </FloatingLabel>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3">
                      <Form.Label column sm="2">Personal Gmail</Form.Label>
                      <Col sm="10">
                        <FloatingLabel label="Personal Gmail Account">
                          <Form.Control 
                            type="email" 
                            name="personalGmail" 
                            value={formData.personalGmail}
                            onChange={handleChange} 
                            placeholder="name@gmail.com"
                            required 
                          />
                        </FloatingLabel>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3">
                      <Form.Label column sm="2">Proof of Identity</Form.Label>
                      <Col sm="10">
                        <Form.Control
                          type="file"
                          name="proofOfIdentity"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf"
                          required
                        />
                        {formData.attachmentPreviews.map((file, index) => (
                          file.type === 'proofOfIdentity' && (
                            <div key={index} className="d-flex align-items-center mt-2">
                              {file.url && (
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  style={{ width: "50px", height: "50px", marginRight: "10px" }}
                                />
                              )}
                              <div className="d-flex justify-content-between pe-2" style={{ width: "100%" }}>
                                <span>{file.name}</span>
                                <button
                                  type="button"
                                  className="btn text-danger"
                                  onClick={() => handleRemoveAttachment('proofOfIdentity')}
                                >
                                  <FaRegTrashAlt />
                                </button>
                              </div>
                            </div>
                          )
                        ))}
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3">
                      <Form.Label column sm="2">PRC ID</Form.Label>
                      <Col sm="10">
                        <Form.Control
                          type="file"
                          name="prcID"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf"
                          required
                        />
                        {formData.attachmentPreviews.map((file, index) => (
                          file.type === 'prcID' && (
                            <div key={index} className="d-flex align-items-center mt-2">
                              {file.url && (
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  style={{ width: "50px", height: "50px", marginRight: "10px" }}
                                />
                              )}
                              <div className="d-flex justify-content-between pe-2" style={{ width: "100%" }}>
                                <span>{file.name}</span>
                                <button
                                  type="button"
                                  className="btn text-danger"
                                  onClick={() => handleRemoveAttachment('prcID')}
                                >
                                  <FaRegTrashAlt />
                                </button>
                              </div>
                            </div>
                          )
                        ))}
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3">
                      <Form.Label column sm="2">Endorsement Letter</Form.Label>
                      <Col sm="10">
                        <Form.Control
                          type="file"
                          name="endorsementLetter"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf"
                          required
                        />
                        {formData.attachmentPreviews.map((file, index) => (
                          file.type === 'endorsementLetter' && (
                            <div key={index} className="d-flex align-items-center mt-2">
                              {file.url && (
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  style={{ width: "50px", height: "50px", marginRight: "10px" }}
                                />
                              )}
                              <div className="d-flex justify-content-between pe-2" style={{ width: "100%" }}>
                                <span>{file.name}</span>
                                <button
                                  type="button"
                                  className="btn text-danger"
                                  onClick={() => handleRemoveAttachment('endorsementLetter')}
                                >
                                  <FaRegTrashAlt />
                                </button>
                              </div>
                            </div>
                          )
                        ))}
                      </Col>
                    </Form.Group>
                  </>
                )}

                {/* Fields specific to reset account request */}
                {formData.requestType === "reset" && (
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">Employee Number</Form.Label>
                    <Col sm="10">
                      <FloatingLabel label="Employee Number">
                        <Form.Control 
                          type="text" 
                          name="employeeNumber" 
                          value={formData.employeeNumber}
                          onChange={handleChange} 
                          placeholder="Employee Number"
                          required 
                        />
                      </FloatingLabel>
                    </Col>
                  </Form.Group>
                )}
              </>
            )}
          </Card.Body>

          <Card.Footer 
            className="d-flex justify-content-center mb-3"
            style={{ backgroundColor: "transparent", border: "none" }}
          >
            <Button 
              variant="dark" 
              type="submit" 
              style={{ width: "25%" }}
              disabled={isSubmitting || !formData.selectedType}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </Card.Footer>
        </Card>
      </form>
      <Modal
        show={showSuccessModal}
        onHide={handleCloseModal}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Success!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{submittedRequestType === 'new' ? 'New Account request' : 'Reset Account request'} has been submitted successfully!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="dark" onClick={handleCloseModal}>
            Done
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RequestDepedAccount;