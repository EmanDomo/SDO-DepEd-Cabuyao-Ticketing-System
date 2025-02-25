import React, { useState, useEffect } from "react";
import { Card, Table, Button, Form, InputGroup } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Swal from "sweetalert2";
import { FaSearch } from "react-icons/fa";

const BatchList = ({ status }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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
    }
  };

  const handleReceiveBatch = async (batchId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to receive this batch?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, receive it!"
      });

      if (result.isConfirmed) {
        await axios.put(`http://localhost:8080/receivebatch/${batchId}`);
        await Swal.fire({
          title: "Received!",
          text: "The batch has been received successfully.",
          icon: "success"
        });
        setBatches((prevBatches) =>
          prevBatches.filter((batch) => batch.batch_id !== batchId)
        );
      }
    } catch (error) {
      setError("Failed to receive batch");
      console.error("Receive error:", error);
    }
  };

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token");

        const decoded = jwtDecode(token);
        const response = await axios.get(
          `http://localhost:8080/receivebatch/${decoded.schoolCode}/${status.toLowerCase()}`
        );
        setBatches(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
    const interval = setInterval(fetchBatches, 30000);
    return () => clearInterval(interval);
  }, [status]);

  // Filter batches based on search term
  const filteredBatches = batches.filter(batch => 
    batch.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading batches...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-danger">{error}</div>
    </div>
  );

  return (
    <div className="vh-90 d-flex flex-column" style={{ marginTop: '60px' }}>
      <Card className="flex-grow-1 m-0 border-0 rounded-0">
        <Card.Header className="py-3 sticky-top" style={{ top: '56px', backgroundColor: "transparent" }}>
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0" style={{color: '#294a70'}}>{status} Batches</h5>
              <span className="badge text-light p-2" style={{backgroundColor: '#294a70'}}>
                {filteredBatches.length} Batches
              </span>
            </div>
            <div className="row">
              <div className="col-md-6 col-lg-4">
                <InputGroup>
                  <InputGroup.Text style={{backgroundColor: '#294a70', color: 'white'}}>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search batches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search batches"
                  />
                  {searchTerm && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setSearchTerm("")}
                    >
                      Clear
                    </Button>
                  )}
                </InputGroup>
              </div>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {filteredBatches.length === 0 ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="text-muted">
                {searchTerm 
                  ? "No batches match your search criteria." 
                  : `No ${status.toLowerCase()} batches found.`}
              </div>
            </div>
          ) : (
            <div className="table-responsive" style={{ height: 'calc(100vh - 180px)', overflowY: 'auto' }}>
              <Table hover className="mb-0">
                <thead className="sticky-top bg-white" style={{ top: '0' }}>
                  <tr>
                    <th className="px-3" style={{color: '#294a70'}}>Batch No.</th>
                    <th className="px-3" style={{color: '#294a70'}}>School Name</th>
                    <th className="px-3" style={{color: '#294a70'}}>Send Date</th>
                    {status === "Received" && (
                      <th className="px-3" style={{color: '#294a70'}}>Received Date</th>
                    )}
                    <th className="px-3" style={{color: '#294a70'}}>Status</th>
                    <th className="px-3" style={{color: '#294a70'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBatches.map((batch) => (
                    <tr key={batch.batch_id}>
                      <td className="px-3">{batch.batch_number}</td>
                      <td className="px-3">{batch.school_name}</td>
                      <td className="px-3">{new Date(batch.send_date).toLocaleDateString()}</td>
                      {status === "Received" && (
                        <td className="px-3">
                          {batch.received_date ? new Date(batch.received_date).toLocaleDateString() : '-'}
                        </td>
                      )}
                      <td className="px-3">{batch.status}</td>
                      <td className="px-3">
                        <div className="d-flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleViewDevices(batch.batch_id)}
                          >
                            View Devices
                          </Button>
                          {status === "Pending" && (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleReceiveBatch(batch.batch_id)}
                            >
                              Receive
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
    </div>
  );
};

export default BatchList;