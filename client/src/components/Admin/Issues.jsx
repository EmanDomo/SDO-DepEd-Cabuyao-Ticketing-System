import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  Container, 
  Card, 
  Form, 
  Button, 
  Table,
  Row,
  Col
} from "react-bootstrap";
import { FaRegTrashAlt } from "react-icons/fa";

const Issues = () => {
  // State variables
  const [issues, setIssues] = useState([]);
  const [newIssueName, setNewIssueName] = useState("");
  const [issueCategory, setIssueCategory] = useState("hardware");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch issues on component mount
  useEffect(() => {
    fetchIssues();
  }, []);

  // Fetch issues from backend
  const fetchIssues = async () => {
    try {
      const response = await axios.get("http://localhost:8080/issues");
      setIssues(response.data);
    } catch (err) {
      console.error("Error fetching issues:", err);
      setError("Failed to fetch issues. Please try again.");
    }
  };

  // Handle adding a new issue
  const handleAddIssue = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validate input
    if (!newIssueName || newIssueName.trim() === "") {
      setError("Issue name cannot be empty");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/addIssue", {
        issue_name: newIssueName.trim(),
        issue_category: issueCategory
      });

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Issue added successfully!'
      });

      // Reset form and refresh issues list
      setNewIssueName("");
      setIssueCategory("hardware");
      fetchIssues();
    } catch (err) {
      console.error("Error adding issue:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || "Failed to add issue. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting an issue
  const handleDeleteIssue = async (issueId) => {
    // Ensure issueId is a number
    if (!issueId || isNaN(Number(issueId))) {
      console.error("Invalid issue ID:", issueId);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Invalid issue ID'
      });
      return;
    }

    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this issue?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.get(`http://localhost:8080/deleteissue/${issueId}`);

        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Issue has been deleted.'
        });

        // Refresh issues list
        fetchIssues();
      } catch (err) {
        console.error("Error deleting issue:", err.response?.data || err.message);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.response?.data?.error || "Failed to delete issue. Please try again."
        });
      }
    }
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <h2>Issue Management</h2>
        </Card.Header>
        <Card.Body>
          {/* Add Issue Form */}
          <Form onSubmit={handleAddIssue} className="mb-4">
            <Row>
              <Col md={5}>
                <Form.Group>
                  <Form.Control
                    type="text"
                    placeholder="Enter issue name"
                    value={newIssueName}
                    onChange={(e) => setNewIssueName(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Select
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                  >
                    <option value="hardware">Hardware</option>
                    <option value="software">Software</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Issue"}
                </Button>
              </Col>
            </Row>
            {error && <Form.Text className="text-danger">{error}</Form.Text>}
          </Form>

          {/* Issues List */}
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Issue Name</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue, index) => (
                <tr key={index}>
                  <td>{issue.issue_name}</td>
                  <td>{issue.issue_category}</td>
                  <td>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDeleteIssue(issue.issue_id)}
                    >
                      <FaRegTrashAlt /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Issues;