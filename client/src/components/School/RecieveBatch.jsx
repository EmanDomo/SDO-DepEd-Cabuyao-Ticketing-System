import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useWindowSize } from "react-use";
import { Container, Row, Col, Spinner, Alert, Table, Button } from "react-bootstrap";
import Nav from "./Header";
import "bootstrap/dist/css/bootstrap.min.css";

const RecieveBatch = () => {
  const { width } = useWindowSize();
  const sidebarWidth = width >= 768 ? "250px" : "0";
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in.");
          setLoading(false);
          return;
        }

        const decoded = jwtDecode(token);
        const schoolCode = decoded.schoolCode;
        console.log("Extracted schoolCode:", schoolCode);

        const response = await axios.get(`http://localhost:8080/receivebatch/${schoolCode}`);
        console.log("API Response:", response.data);

        setBatches(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError("Failed to fetch batches.");
        console.error("Error fetching batches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  return (
    <div style={{ marginLeft: sidebarWidth, minHeight: "100vh" }}>
      <Nav />
      <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: "calc(100vh - 56px)" }}>
        <Row className="w-100">
          <Col xs={12} lg={10} className="mx-auto">
            <h2 className="text-center mb-4">DepEd Computerization Program</h2>
            {loading && <Spinner animation="border" className="d-block mx-auto" />}
            {error && <Alert variant="danger">{error}</Alert>}
            {!loading && !error && batches.length === 0 && (
              <Alert variant="info">No batches found.</Alert>
            )}
            {batches.length > 0 && (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Batch Number</th>
                    <th>Send Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch) => (
                    <tr key={batch.batch_number}>
                      <td>{batch.batch_number}</td>
                      <td>{new Date(batch.send_date).toLocaleDateString()}</td>
                      <td>{batch.status}</td>
                      <td>
                        <Button variant="info" className="me-2">View Devices</Button>
                        <Button variant="success">Receive</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RecieveBatch;
