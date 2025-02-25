import React, { useState, useEffect } from "react";
import { Card, Table, Button } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useWindowSize } from "react-use";
import Header from "./Header";
import Swal from 'sweetalert2';

const ReceiveBatch = () => {
  const { width } = useWindowSize();
  const sidebarWidth = width >= 768 ? "250px" : "0";
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("pending");

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token");

      const decoded = jwtDecode(token);
      const response = await axios.get(
        `http://localhost:8080/receivebatch/${decoded.schoolCode}/${status}`
      );
      setBatches(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
    const interval = setInterval(fetchBatches, 30000);
    return () => clearInterval(interval);
  }, [status]);

  const handleViewDevices = async (batch) => {
    try {
      const response = await axios.get(`http://localhost:8080/batch/${batch.batch_id}/devices`);
      const devices = response.data;

      Swal.fire({
        title: 'Batch Details',
        html: `
          <div class="container-fluid" style="font-size: 0.9rem; text-align: left;">
            <div class="row g-3">
              <div class="col-md-6">
                <p class="mb-2 text-left">
                  <strong>Batch Number:</strong><br />
                  ${batch.batch_number}
                </p>
              </div>
              <div class="col-md-6">
                <p class="mb-2 text-left">
                  <strong>School:</strong><br />
                  ${batch.school_name}
                </p>
              </div>
              <div class="col-12">
                <p class="mb-2 text-left">
                  <strong>Devices:</strong>
                </p>
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Device Type</th>
                        <th>Serial Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${devices.map(device => `
                        <tr>
                          <td>${device.device_type}</td>
                          <td>${device.device_number}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="col-12">
                <p class="mb-0 text-left">
                  <strong>Send Date:</strong><br />
                  ${new Date(batch.send_date).toLocaleString()}
                </p>
              </div>
            </div>
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
          text: "The batch has been received.",
          icon: "success"
        });
        fetchBatches();
      }
    } catch (error) {
      setError("Failed to receive batch");
      console.error("Receive error:", error);
    }
  };

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
    <div style={{ marginLeft: sidebarWidth, minHeight: "100vh" }}>
      <Header />
      <div className="vh-90 d-flex flex-column" style={{ marginTop: '60px' }}>
        <Card className="flex-grow-1 m-0 border-0 rounded-0">
          <Card.Header className="py-3 sticky-top" style={{ top: '56px', backgroundColor: "transparent" }}>
            <div className="container-fluid">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex gap-4 align-items-center">
                  <h5 className="mb-0" style={{color: '#294a70'}}>DCP Batches</h5>
                  <div className="btn-group">
                    <Button
                      variant={status === "pending" ? "primary" : "outline-primary"}
                      onClick={() => setStatus("pending")}
                    >
                      Pending
                    </Button>
                    <Button
                      variant={status === "received" ? "primary" : "outline-primary"}
                      onClick={() => setStatus("received")}
                    >
                      Received
                    </Button>
                  </div>
                </div>
                <span className="badge text-light p-2" style={{backgroundColor: '#294a70'}}>
                  {batches.length} Batches
                </span>
              </div>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            {batches.length === 0 ? (
              <div className="d-flex justify-content-center align-items-center h-100">
                <div className="text-muted">
                  No {status.toLowerCase()} batches found.
                </div>
              </div>
            ) : (
              <div className="table-responsive" style={{ height: 'calc(100vh - 126px)', overflowY: 'auto' }}>
                <Table hover className="mb-0">
                  <thead className="sticky-top bg-white" style={{ top: '0' }}>
                    <tr>
                      <th className="px-3" style={{color: '#294a70'}}>Batch No.</th>
                      <th className="px-3" style={{color: '#294a70'}}>School</th>
                      <th className="px-3" style={{color: '#294a70'}}>Send Date</th>
                      {status === "received" && (
                        <th className="px-3" style={{color: '#294a70'}}>Received Date</th>
                      )}
                      <th className="px-3" style={{color: '#294a70'}}>Status</th>
                      <th className="px-3" style={{color: '#294a70'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((batch) => (
                      <tr key={batch.batch_id}>
                        <td className="px-3">{batch.batch_number}</td>
                        <td className="px-3">{batch.school_name}</td>
                        <td className="px-3">{new Date(batch.send_date).toLocaleDateString()}</td>
                        {status === "received" && (
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
                              onClick={() => handleViewDevices(batch)}
                            >
                              View
                            </Button>
                            {status === "pending" && (
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
    </div>
  );
};

export default ReceiveBatch;