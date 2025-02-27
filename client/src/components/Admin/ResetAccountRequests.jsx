import React, { useState } from "react";
import { Table, Button, Badge } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";

const ResetAccountRequests = ({ resetAccountRequests, loading, filterStatus, searchTerm, fetchResetAccountRequests }) => {
    const [error, setError] = useState("");

    const handleUpdateResetAccountStatus = async (requestId, newStatus) => {
        try {
            const result = await Swal.fire({
                title: 'Update Status',
                text: `Are you sure you want to mark this request as ${newStatus}?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: getStatusColor(newStatus),
                confirmButtonText: `Yes, mark as ${newStatus}`,
                cancelButtonText: 'Cancel',
                reverseButtons: true
            });

            if (result.isConfirmed) {
                await axios.put(`http://localhost:8080/deped-account-reset-requests/${requestId}/status`, {
                    status: newStatus
                });
                await fetchResetAccountRequests();
                
                Swal.fire({
                    title: 'Status Updated',
                    text: `Request status has been updated to ${newStatus}`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error("Error updating reset account request status:", error);
            setError("Failed to update request status");
            
            Swal.fire({
                title: 'Error',
                text: 'Failed to update request status',
                icon: 'error'
            });
        }
    };

    const handleShowRequestDetails = (request) => {
        // Create status dropdown options
        const statusOptionsHTML = accountStatusOptions
            .filter(status => status.toLowerCase() !== request.status.toLowerCase()) // Filter out current status
            .map(status => {
                return `<option value="${status}" style="color: black;">${status}</option>`;
            }).join('');

        const currentStatusBadge = `
            <div class="current-status-badge mb-3">
                <span class="badge rounded-pill" style="background-color: ${getStatusColor(request.status)}; 
                      font-size: 0.9rem; padding: 0.5em 1em;">
                    Current Status: ${request.status}
                </span>
            </div>
        `;

        Swal.fire({
            title: `Reset Account Request: ${request.id}`,
            html: `
                <div class="request-details text-start">
                    <div class="request-info mb-4">
                    <div class="row mb-2">
                            <div class="col-md-4 fw-bold">Account Type:</div>
                            <div class="col-md-8">${request.selected_type}</div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-4 fw-bold">Last Name:</div>
                            <div class="col-md-8">${request.surname}</div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-4 fw-bold">First Name:</div>
                            <div class="col-md-8">${request.first_name}</div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-4 fw-bold">Middle Name:</div>
                            <div class="col-md-8">${formatMiddleName(request.middle_name)}</div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-4 fw-bold">School:</div>
                            <div class="col-md-8">${request.school}</div>
                        </div>
                        ${request.school_id ? `
                        <div class="row mb-2">
                            <div class="col-md-4 fw-bold">School ID:</div>
                            <div class="col-md-8">${request.school_id}</div>
                        </div>
                        ` : ''}
                        <div class="row mb-2">
                            <div class="col-md-4 fw-bold">Employee Number:</div>
                            <div class="col-md-8">${request.employee_number}</div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-4 fw-bold">Date Created:</div>
                            <div class="col-md-8">${new Date(request.created_at).toLocaleString()}</div>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between status-update">
                        <div>
                            <h5>Status:</h5>
                        </div>
                        
                        <div class="text-center">
                            ${currentStatusBadge}
                        </div>
                    </div>

                    <div class="d-flex justify-content-between mb-4">
                        <div>
                            <h5>Update Status:</h5>
                        </div>
                        <div>
                            <select id="statusDropdown" class="form-select status-dropdown" style="width: 150px;">
                                <option value="" selected disabled>Change Status</option>
                                    ${statusOptionsHTML}
                            </select>
                        </div>  
                    </div>
                    
                    <div class="d-flex justify-content-center">
                        <button id="updateStatusBtn" class="btn btn-outline-dark update-status-btn">
                            Update Status
                        </button>
                    </div>
                    </div>
                </div>
            `,
            width: '700px',
            customClass: {
                container: 'request-swal-container',
                popup: 'request-swal-popup',
                content: 'request-swal-content'
            },
            showConfirmButton: false,
            showCloseButton: true,
            didOpen: () => {
                // Add event listener for update status button
                const updateBtn = document.getElementById('updateStatusBtn');
                const statusDropdown = document.getElementById('statusDropdown');
                
                updateBtn.addEventListener('click', () => {
                    const selectedStatus = statusDropdown.value;
                    if (selectedStatus) {
                        handleUpdateResetAccountStatus(request.id, selectedStatus);
                    } else {
                        Swal.showValidationMessage('Please select a status');
                    }
                });
            }
        });
    };

    const getStatusBadgeVariant = (status) => {
        switch (status.toLowerCase()) {
            case "completed": return "success";
            case "pending": return "warning";
            case "on hold": return "secondary";
            case "in progress": return "primary";
            case "rejected": return "danger";
            default: return "secondary";
        }
    };
    
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "completed": return "#28a745";
            case "pending": return "#ffc107";
            case "on hold": return "#6c757d";
            case "in progress": return "#007bff";
            case "rejected": return "#dc3545";
            default: return "#6c757d";
        }
    };

    // Function to display N/A for empty middle names
    const formatMiddleName = (middleName) => {
        return middleName && middleName.trim() !== "" ? middleName : "N/A";
    };

    const filteredResetAccountRequests = resetAccountRequests
        .filter(request => {
            if (filterStatus === "all") return true;
            return request.status.toLowerCase() === filterStatus.toLowerCase();
        })
        .filter(request =>
            searchTerm === "" ||
            request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.school.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const accountStatusOptions = ["Completed", "Pending", "In Progress", "Rejected"];

    return (
        <>
            {loading ? (
                <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading requests...</p>
                </div>
            ) : (
                <div>
                    {/* Add a header with a badge for the count of filtered requests */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0" style={{ color: '#294a70' }}>Reset Account Requests</h5>
                        <span className="badge text-light p-2" style={{ backgroundColor: '#294a70' }}>
                            {filteredResetAccountRequests.length} Requests
                        </span>
                    </div>

                    {filteredResetAccountRequests.length > 0 ? (
                        <div className="table-responsive">
                            <Table hover className="mb-0 align-middle">
                                <thead>
                                    <tr>
                                        <th className="text-center">Request #</th>
                                        <th className="text-center">Account Type</th>
                                        <th className="text-center">Last Name</th>
                                        <th className="text-center">First Name</th>
                                        <th className="text-center">Middle Name</th>
                                        <th className="text-center">School</th>
                                        {/* <th className="text-center">Employee Number</th> */}
                                        <th className="text-center">Status</th>
                                        <th className="text-center">Date</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredResetAccountRequests.map((request) => (
                                        <tr key={request.id}>
                                            <td className="text-center">{request.resetNumber}</td>
                                            <td className="text-center">{request.selected_type}</td>
                                            <td className="text-center">{request.surname}</td>
                                            <td className="text-center">{request.first_name}</td>
                                            <td className="text-center">{formatMiddleName(request.middle_name)}</td>
                                            <td className="text-center">{request.school}</td>
                                            {/* <td className="text-center">{request.employee_number}</td> */}
                                            <td className="text-center">
                                                <Badge 
                                                    bg={getStatusBadgeVariant(request.status)}
                                                    style={{ fontSize: "0.85rem", padding: "0.4em 0.6em" }}
                                                >
                                                    {request.status}
                                                </Badge>
                                            </td>
                                            <td className="text-center">{new Date(request.created_at).toLocaleDateString()}</td>
                                            <td className="text-center">
                                                <Button
                                                    size="sm"
                                                    variant="outline-info"
                                                    onClick={() => handleShowRequestDetails(request)}
                                                >
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <i className="fas fa-search fa-3x text-muted mb-3"></i>
                            <h5>No reset account requests found</h5>
                            <p className="text-muted">Try adjusting your filters or search term</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add CSS styles similar to the SupportTickets component */}
            <style jsx>{`
                .status-dropdown {
                    padding: 0.5rem;
                    border-radius: 4px;
                    border: 1px solid #dee2e6;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                
                .status-dropdown:focus {
                    border-color: #80bdff;
                    outline: 0;
                    box-shadow: 0 0 0 0.25rem rgba(0,123,255,0.25);
                }
                
                .update-status-btn {
                    transition: all 0.2s;
                    border-radius: 4px;
                    padding: 0.5rem 1rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .update-status-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }
                
                .current-status-badge .badge {
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
            `}</style>
        </>
    );
};

export default ResetAccountRequests;