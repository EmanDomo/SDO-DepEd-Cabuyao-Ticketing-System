import React, { useState, useEffect } from "react";
import { Form, Button, Container, Card, Row, Col, Alert, FloatingLabel } from "react-bootstrap";
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Modal } from 'react-bootstrap';

  const RequestDepedAccount = () => {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedRequestType, setSubmittedRequestType] = useState("");
  const [schools, setSchools] = useState([]); // Store schools from the database
  const [formData, setFormData] = useState({
    requestType: "",
    selectedType: "",
    surname: "",
    firstName: "",
    middleName: "",
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

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch schools from the database on component mount
    const fetchSchools = async () => {
      try {
        const response = await fetch("http://localhost:8080/schoolList");
        if (response.ok) {
          const data = await response.json();
          setSchools(data);
        } else {
          setError("Failed to fetch schools.");
        }
      } catch (err) {
        console.error("Error fetching schools:", err);
        setError("Error fetching schools. Please check your network and server.");
      }
    };

    fetchSchools();
  }, []);

  const handleRequestTypeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      requestType: e.target.value,
      // Reset selectedType when changing request type
      selectedType: "",
      school: "",
      schoolID: ""
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

  const handleSchoolChange = (e) => {
    const selectedSchoolName = e.target.value;
    const selectedSchool = schools.find(school => school.school === selectedSchoolName);

    if (selectedSchool) {
      setFormData(prev => ({
        ...prev,
        school: selectedSchool.school,
        schoolID: selectedSchool.schoolCode,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        school: "",
        schoolID: "",
      }));
    }
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

  // Add this email validation function
  const isValidGmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // setError("");
    setMessage("");

    // Destructure ALL form data fields to ensure you are using the correct one
    const { requestType, selectedType, surname, firstName, middleName, school, schoolID, employeeNumber, designation, personalGmail, proofOfIdentity, prcID, endorsementLetter } = formData;

    // Validation for both request types
    if (!requestType || !selectedType || !surname || !firstName || !school || !schoolID) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    let endpoint = "";
    let options = {
        method: "POST",
    };

    let body = null;

    // Additional validation for new account request
    if (requestType === "new") {
        // Determine the endpoint based on request type
        endpoint = "http://localhost:8080/request-deped-account";
        body = new FormData();

        body.append("selectedType", selectedType);
        body.append("surname", surname);
        body.append("firstName", firstName);
        body.append("middleName", middleName);
        body.append("designation", designation);
        body.append("school", school);
        body.append("schoolID", schoolID);
        body.append("personalGmail", personalGmail);
        body.append("proofOfIdentity", proofOfIdentity);
        body.append("prcID", prcID);
        body.append("endorsementLetter", endorsementLetter);

        options.body = body;

        // Add Gmail validation
        if (!isValidGmail(personalGmail)) {
            setError("Please provide a valid Gmail address (must end with @gmail.com)");
            setIsSubmitting(false);
            return;
        }
        // Additional validation for reset account request
    } else if (requestType === "reset") {
        // Determine the endpoint based on request type
        endpoint = "http://localhost:8080/reset-deped-account";
        // For reset account requests
        body = JSON.stringify({
            selectedType: selectedType,
            surname: surname,
            firstName: firstName,
            middleName: middleName,
            school: school,
            schoolID: schoolID,
            employeeNumber: employeeNumber
        });
        options.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        options.body = body;

        if (!employeeNumber) {
            setError("Please provide your employee number");
            setIsSubmitting(false);
            return;
        }
    }

    try {

      // console.log("Sending request to:", endpoint);
      // console.log("Request options:", options);

      // For reset account requests, send JSON data
      const response = await fetch(endpoint, options);

      if (response.ok) {
        const responseData = await response.json();
        setSubmittedRequestType(requestType);
        setShowSuccessModal(true);
        setMessage(responseData.message || "Request submitted successfully!");
         // Reset form
        setFormData({
          requestType: "",
          selectedType: "",
          surname: "",
          firstName: "",
          middleName: "",
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
        // const errorData = await response.json(); 
        const errorText = await response.text(); // Read the error message as text
        console.error("Server responded with an error:", errorText);

        setError(`Failed to submit request: ${response.status} - ${errorText || response.statusText}`);
      }
      } catch (error) {
        console.error("Error submitting request:", error);
        setError(`Error submitting request: ${error.message}`); 
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
                    <Row>
                      <Col md={4}>
                        <FloatingLabel label="Surname">
                          <Form.Control
                            type="text"
                            name="surname"
                            value={formData.surname || ''}
                            onChange={handleChange}
                            placeholder="Surname"
                            required
                          />
                        </FloatingLabel>
                      </Col>
                      <Col md={4}>
                        <FloatingLabel label="First Name">
                          <Form.Control
                            type="text"
                            name="firstName"
                            value={formData.firstName || ''}
                            onChange={handleChange}
                            placeholder="First Name"
                            required
                          />
                        </FloatingLabel>
                      </Col>
                      <Col md={4}>
                        <FloatingLabel label="Middle Name">
                          <Form.Control
                            type="text"
                            name="middleName"
                            value={formData.middleName || ''}
                            onChange={handleChange}
                            placeholder="Middle Name"
                          />
                        </FloatingLabel>
                      </Col>
                    </Row>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="2">School</Form.Label>
                  <Col sm="10">
                    <Form.Select
                      name="school"
                      value={formData.school}
                      onChange={handleSchoolChange}
                      required
                    >
                      <option value="">-- Select School --</option>
                      {schools.map((school) => (
                        <option key={school.schoolCode} value={school.school}>
                          {school.school}
                        </option>
                      ))}
                    </Form.Select>
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
                        placeholder="School ID"
                        readOnly
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