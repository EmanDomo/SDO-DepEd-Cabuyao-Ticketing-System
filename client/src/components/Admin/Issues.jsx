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
  Col,
  Badge,
  Spinner,
  InputGroup,
  FormControl
} from "react-bootstrap";
import { 
  FaRegTrashAlt, 
  FaPlus, 
  FaFilter, 
  FaSearch, 
  FaLaptop, 
  FaDesktop 
} from "react-icons/fa";

const Issues = () => {
  // State variables
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [newIssueName, setNewIssueName] = useState("");
  const [issueCategory, setIssueCategory] = useState("hardware");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Fetch issues on component mount
  useEffect(() => {
    fetchIssues();
  }, []);

  // Filter issues when search term or filter category changes
  useEffect(() => {
    filterIssues();
  }, [searchTerm, filterCategory, issues]);

  // Filter issues based on search term and category
  const filterIssues = () => {
    let result = [...issues];
    
    // Filter by search term
    if (searchTerm.trim() !== "") {
      result = result.filter(issue => 
        issue.issue_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (filterCategory !== "all") {
      result = result.filter(issue => 
        issue.issue_category === filterCategory
      );
    }
    
    setFilteredIssues(result);
  };

  // Fetch issues from backend
  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/issues");
      setIssues(response.data);
      setFilteredIssues(response.data);
    } catch (err) {
      console.error("Error fetching issues:", err);
      setError("Failed to fetch issues. Please try again.");
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Failed to fetch issues. Please try again."
      });
    } finally {
      setIsLoading(false);
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

  // Get category badge
  const getCategoryBadge = (category) => {
    if (category === "hardware") {
      return <Badge bg="danger" className="d-flex align-items-center"><FaDesktop className="me-1" /> Hardware</Badge>;
    } else {
      return <Badge bg="info" className="d-flex align-items-center"><FaLaptop className="me-1" /> Software</Badge>;
    }
  };

  return (
    <Container className="mt-4 mb-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0"><FaPlus className="me-2" /> Issue Management</h2>
        </Card.Header>
        <Card.Body>
          {/* Add Issue Form */}
          <Form onSubmit={handleAddIssue} className="mb-4">
            <Row>
              <Col md={5}>
                <Form.Group>
                  <Form.Label>Issue Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter issue name"
                    value={newIssueName}
                    onChange={(e) => setNewIssueName(e.target.value)}
                    className="rounded-pill"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                    className="rounded-pill"
                  >
                    <option value="hardware">Hardware</option>
                    <option value="software">Software</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 rounded-pill"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaPlus className="me-2" /> Add Issue
                    </>
                  )}
                </Button>
              </Col>
            </Row>
            {error && <Form.Text className="text-danger mt-2">{error}</Form.Text>}
          </Form>

          {/* Search and Filter */}
          <Row className="mb-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text className="bg-light">
                  <FaSearch />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text className="bg-light">
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border-start-0"
                >
                  <option value="all">All Categories</option>
                  <option value="hardware">Hardware</option>
                  <option value="software">Software</option>
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>

          {/* Issues List */}
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading issues...</p>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="text-center py-5 bg-light rounded">
              <p className="mb-0 text-muted">No issues found. Add a new issue or change your filter criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover className="align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>#</th>
                    <th>Issue Name</th>
                    <th>Category</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((issue, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td className="fw-medium">{issue.issue_name}</td>
                      <td>{getCategoryBadge(issue.issue_category)}</td>
                      <td className="text-center">
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="rounded-pill"
                          onClick={() => handleDeleteIssue(issue.issue_id)}
                        >
                          <FaRegTrashAlt className="me-1" /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
          
          {/* Summary Footer */}
          <div className="d-flex justify-content-between mt-3 text-muted small">
            <div>Total: {filteredIssues.length} issue(s)</div>
            <div>
              Hardware: {filteredIssues.filter(i => i.issue_category === "hardware").length} | 
              Software: {filteredIssues.filter(i => i.issue_category === "software").length}
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Issues;