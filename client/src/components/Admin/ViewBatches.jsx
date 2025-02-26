import React, { useState, useEffect } from "react";
import { Card, Table, Button, Badge } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { FaEye } from "react-icons/fa";

const ViewBatches = ({ filterStatus = "all", searchTerm = "" }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBatches();
    // Set up a refresh interval (every 30 seconds)
    const interval = setInterval(fetchBatches, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/batches");
      setBatches(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching batches:", err);
      setError("Failed to load batches. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDevices = async (batchId) => {
    try {
      const response = await axios.get(`http://localhost:8080/batch/${batchId}/devices`);
      const devices = response.data;

      Swal.fire({
        title: 'Batch Devices',
        html: `
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th class="px-3" style="color: #294a70">Device Type</th>
                  <th class="px-3" style="color: #294a70">Serial Number</th>
                </tr>
              </thead>
              <tbody>
                ${devices.map(device => `
                  <tr>
                    <td class="px-3">${device.device_type}</td>
                    <td class="px-3">${device.device_number}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `,
        width: '800px',
        showCloseButton: true,
        showConfirmButton: false,
        didOpen: () => {
          const content = Swal.getHtmlContainer();
          if (content) {
            content.style.textAlign = 'left';
          }
        }
      });
    } catch (error) {
      setError("Failed to load devices");
      console.error("View devices error:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load batch devices",
        icon: "error"
      });
    }
  };

  const handleBatchDetails = (batch) => {
    Swal.fire({
      title: `Batch: ${batch.batch_number}`,
      html: `
        <div class="batch-details text-start">
          <div class="batch-info mb-4">
            <div class="row mb-2">
              <div class="col-md-4 fw-bold">School Name:</div>
              <div class="col-md-8">${batch.school_name}</div>
            </div>
            <div class="row mb-2">
              <div class="col-md-4 fw-bold">School Code:</div>
              <div class="col-md-8">${batch.schoolCode}</div>
            </div>
            <div class="row mb-2">
              <div class="col-md-4 fw-bold">Send Date:</div>
              <div class="col-md-8">${new Date(batch.send_date).toLocaleDateString()}</div>
            </div>
            <div class="row mb-2">
              <div class="col-md-4 fw-bold">Status:</div>
              <div class="col-md-8">
                <span class="badge rounded-pill" style="background-color: ${getStatusColor(batch.status)}; 
                      font-size: 0.9rem; padding: 0.5em 1em;">
                  ${batch.status}
                </span>
              </div>
            </div>
            ${batch.received_date ? `
            <div class="row mb-2">
              <div class="col-md-4 fw-bold">Received Date:</div>
              <div class="col-md-8">${new Date(batch.received_date).toLocaleDateString()}</div>
            </div>
            ` : ''}
          </div>
          
          <div class="d-flex justify-content-center mt-4">
            <button id="viewDevicesBtn" class="btn btn-primary">
              View Devices
            </button>
          </div>
        </div>
      `,
      width: "550px",
      showConfirmButton: false,
      showCloseButton: true,
      didOpen: () => {
        const viewDevicesBtn = document.getElementById("viewDevicesBtn");
        viewDevicesBtn.addEventListener("click", () => {
          handleViewDevices(batch.batch_id);
        });
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "#28a745"; 
      case "pending":
        return "#ffc107"; 
      default:
        return "#6c757d"; 
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "success";
      case "pending":
        return "warning";
      default:
        return "secondary";
    }
  };

  const filteredBatches = batches.filter(batch => {
    const statusMatch = filterStatus === "all" || 
                        batch.status.toLowerCase() === filterStatus.toLowerCase();

    const search = searchTerm.toLowerCase();
    const searchMatch = search === "" || 
                        batch.batch_number.toLowerCase().includes(search) ||
                        batch.school_name.toLowerCase().includes(search) ||
                        batch.schoolCode.toString().includes(search);
    
    return statusMatch && searchMatch;
  });

  const displayBatches = filteredBatches;

  if (loading && batches.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading batches...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="vh-90 d-flex flex-column">
      <Card className="flex-grow-1 m-0 border-0 rounded-0">
        <Card.Header className="py-3 sticky-top" style={{ backgroundColor: "transparent" }}>
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0" style={{color: '#294a70'}}>All Batches</h5>
              <span className="badge text-light p-2" style={{backgroundColor: '#294a70'}}>
                {displayBatches.length} Batches
              </span>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {error && (
            <div className="alert alert-danger m-3" role="alert">
              {error}
            </div>
          )}
          
          {displayBatches.length === 0 ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="text-muted">
                {searchTerm || filterStatus !== "all" 
                  ? "No batches found matching your search criteria."
                  : "No batches found."}
              </div>
            </div>
          ) : (
            <div className="table-responsive" style={{ height: 'calc(100vh - 180px)', overflowY: 'auto' }}>
              <Table hover className="mb-0">
                <thead className="sticky-top bg-white" style={{ top: '0' }}>
                  <tr>
                    <th className="px-3" style={{color: '#294a70'}}>Batch No.</th>
                    <th className="px-3" style={{color: '#294a70'}}>School Name</th>
                    <th className="px-3" style={{color: '#294a70'}}>School Code</th>
                    <th className="px-3" style={{color: '#294a70'}}>Send Date</th>
                    <th className="px-3" style={{color: '#294a70'}}>Status</th>
                    <th className="px-3" style={{color: '#294a70'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayBatches.map((batch) => (
                    <tr key={batch.batch_id}>
                      <td className="px-3">{batch.batch_number}</td>
                      <td className="px-3">{batch.school_name}</td>
                      <td className="px-3">{batch.schoolCode}</td>
                      <td className="px-3">{new Date(batch.send_date).toLocaleDateString()}</td>
                      <td className="px-3">
                        <Badge
                          bg={getStatusBadgeVariant(batch.status)}
                          style={{ fontSize: "0.85rem", padding: "0.4em 0.6em" }}
                        >
                          {batch.status}
                        </Badge>
                      </td>
                      <td className="px-3">
                        <div className="d-flex gap-2 flex-wrap">
                          {/* <Button
                            size="sm"
                            variant="outline-info"
                            className="d-flex align-items-center"
                            onClick={() => handleBatchDetails(batch)}
                          >
                            <FaEye className="me-1" /> View Details
                          </Button> */}
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => handleViewDevices(batch.batch_id)}
                          >
                            View Devices
                          </Button>
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

      <style jsx>{`
        .dropdown-toggle::after {
          margin-left: 0.5em;
        }
        
        .batch-details .badge {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .table th, .table td {
          vertical-align: middle;
        }
        
        /* Responsive adjustments */
        @media (max-width: 767px) {
          .d-flex.gap-2 {
            flex-direction: column;
            gap: 0.5rem !important;
          }
          
          .d-flex.gap-2 .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewBatches;