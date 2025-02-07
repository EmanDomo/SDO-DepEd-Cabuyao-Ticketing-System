import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../../styles/CreateTicket.css";
import Nav from "./Header";

const CreateTicket = () => {
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

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setFormData(prev => ({
                    ...prev,
                    requestor: decoded.username || "",
                }));
            } catch (error) {
                console.error("Error decoding token", error);
            }
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = e.target.files;
        const newAttachments = [];
        const previews = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            newAttachments.push(file);

            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    previews.push({ name: file.name, url: reader.result });
                    setFormData(prev => ({
                        ...prev,
                        attachments: newAttachments,
                        attachmentPreviews: [...prev.attachmentPreviews, { name: file.name, url: reader.result }],
                    }));
                };
                reader.readAsDataURL(file);
            } else {
                setFormData(prev => ({
                    ...prev,
                    attachments: newAttachments,
                    attachmentPreviews: [...prev.attachmentPreviews, { name: file.name }],
                }));
            }
        }
    };

    const handleRemoveAttachment = (index) => {
        setFormData((prev) => {
            const updatedFiles = prev.attachments.filter((_, i) => i !== index);
            const updatedPreviews = prev.attachmentPreviews.filter((_, i) => i !== index);
            return { ...prev, attachments: updatedFiles, attachmentPreviews: updatedPreviews };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("requestor", formData.requestor);
        data.append("category", formData.category);
        data.append("request", formData.request);
        data.append("comments", formData.comments);

        if (formData.attachments.length > 0) {
            formData.attachments.forEach((file) => {
                data.append("attachments", file);
            });
        }

        try {
            const response = await axios.post("http://localhost:8080/createTickets", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setTicketNumber(response.data.ticketNumber);
            setMessage(response.data.message);
            setFormData({ requestor: formData.requestor, category: "", request: "", comments: "", attachments: [], attachmentPreviews: [] });
        } catch (error) {
            console.error("Error submitting ticket:", error);
            setMessage("Error submitting the ticket.");
        }
    };

    return (
        <div className="create-ticket-container">
            <Nav />
            <div className="ticket-form-wrapper">
                <h1 className="ticket-title">Submit a Ticket</h1>
                {message && <p className="ticket-message">{message}</p>}
                {ticketNumber && <p className="ticket-number">Your Ticket Number: <strong>{ticketNumber}</strong></p>}

                <form className="ticket-form" onSubmit={handleSubmit}>
                    <label className="ticket-label">Requestor</label>
                    <input className="ticket-input" type="text" name="requestor" value={formData.requestor} disabled />

                    <label className="ticket-label">Category</label>
                    <select className="ticket-select" name="category" value={formData.category} onChange={handleChange} required>
                        <option value="">Select Category</option>
                        <option value="Hardware">Hardware</option>
                        <option value="Software">Software</option>
                    </select>

                    {/* Subcategory Dropdown */}
                    {formData.category === "Software" && (
                        <>
                            <label className="ticket-label">Software Issue</label>
                            <select className="ticket-select" name="subcategory" value={formData.subcategory} onChange={handleChange} required>
                                <option value="">Select Issue</option>
                                <option value="Internet Connection">Internet Connection</option>
                                <option value="Password Resetting">Password Resetting</option>
                                <option value="Other">Other</option>
                            </select>
                        </>
                    )}

                    {formData.category === "Hardware" && (
                        <>
                            <label className="ticket-label">Hardware Issue</label>
                            <select className="ticket-select" name="subcategory" value={formData.subcategory} onChange={handleChange} required>
                                <option value="">Select Issue</option>
                                <option value="Computer Troubleshooting">Computer Troubleshooting</option>
                                <option value="Printer Troubleshooting">Printer Troubleshooting</option>
                                <option value="Other">Other</option>
                            </select>
                        </>
                    )}

                    {/* "Other" input field */}
                    {formData.subcategory === "Other" && (
                        <>
                            <label className="ticket-label">Specify Your Issue</label>
                            <input
                                className="ticket-input"
                                type="text"
                                name="otherSubcategory"
                                value={formData.otherSubcategory}
                                onChange={handleChange}
                                required
                            />
                        </>
                    )}

                    <label className="ticket-label">Additional Comments</label>
                    <textarea className="ticket-textarea" name="comments" value={formData.comments} onChange={handleChange} required></textarea>

                    <label className="ticket-label">Attachments</label>
                    <input className="ticket-file" type="file" multiple onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx" />

                    {/* Show uploaded attachments */}
                    {formData.attachmentPreviews.length > 0 && (
                        <div className="attachment-preview-container">
                            <p>Attachments:</p>
                            <ul className="attachment-preview-list">
                                {formData.attachmentPreviews.map((file, index) => (
                                    <li key={index} className="attachment-preview-item">
                                        {file.url ? (
                                            <img src={file.url} alt={file.name} className="attachment-image-preview" />
                                        ) : (
                                            <span>{file.name}</span>
                                        )}
                                        <button type="button" onClick={() => handleRemoveAttachment(index)}>❌</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button className="ticket-submit-button" type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default CreateTicket;
