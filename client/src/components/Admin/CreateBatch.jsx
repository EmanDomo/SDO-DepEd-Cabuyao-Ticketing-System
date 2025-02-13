import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Form, Row, Col, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const CreateBatch = () => {
  const navigate = useNavigate();
  const [district, setDistrict] = useState("");
  const [schools, setSchools] = useState([]);
  const [schoolCode, setSchoolCode] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [sendDate, setSendDate] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [error, setError] = useState("");
  const [batchCounter, setBatchCounter] = useState(1);
  const [currentDate, setCurrentDate] = useState("");
  const [devices, setDevices] = useState([]);
  const [batchDevices, setBatchDevices] = useState([]);
  const [showNewDeviceModal, setShowNewDeviceModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");

  useEffect(() => {
    if (district) {
      axios
        .get(`http://localhost:8080/schools?district=${district}`)
        .then((response) => {
          console.log("API Response:", response.data);
          setSchools(Array.isArray(response.data) ? response.data : []);
        })
        .catch((err) => {
          console.error(err);
          setError("Error fetching schools.");
        });
    }
    axios
      .get('http://localhost:8080/devices')
      .then((response) => {
        setDevices(Array.isArray(response.data) ? response.data : []);
      })
      .catch((err) => {
        console.error(err);
        setError("Error fetching device types.");
      });

    const today = new Date();
    const todayDate = today.toISOString().split("T")[0].replace(/-/g, "");
    setCurrentDate(todayDate);
  }, [district]);

  useEffect(() => {
    const fetchNextBatchNumber = async () => {
      try {
        const response = await axios.get("http://localhost:8080/nextBatchNumber");
        setBatchNumber(response.data.nextBatchNumber);
      } catch (err) {
        console.error("Error fetching next batch number:", err);
        setError("Error generating batch number.");
      }
    };

    fetchNextBatchNumber();
  }, []);

  const handleDistrictChange = (e) => {
    setDistrict(e.target.value);
  };

  const handleSchoolChange = (e) => {
    const selectedSchoolCode = e.target.value;
    setSchoolCode(selectedSchoolCode);

    console.log("Selected school code:", selectedSchoolCode);
    console.log("Available schools:", schools);

    const selectedSchool = schools.find((school) => school.schoolCode === parseInt(selectedSchoolCode));
    console.log("Found school:", selectedSchool);

    if (selectedSchool) {
      setSchoolName(selectedSchool.school_name || selectedSchool.school);
      console.log("Setting school name to:", selectedSchool.school_name || selectedSchool.school);
    } else {
      setSchoolName("");
      console.log("No school found, clearing school name");
    }
  };

  const generateBatchNumber = () => {
    const counterFormatted = batchCounter.toString().padStart(4, "0");
    return `${currentDate}-${counterFormatted}`;
  };

  const handleAddDevice = () => {
    setBatchDevices([...batchDevices, { deviceType: "", serialNumber: "" }]);
  };

  const handleDeviceChange = (index, field, value) => {
    if (value === "new") {
      setShowNewDeviceModal(true);
      return;
    }

    const updatedDevices = [...batchDevices];
    updatedDevices[index] = { ...updatedDevices[index], [field]: value };
    setBatchDevices(updatedDevices);
  };

  const handleAddNewDeviceType = async () => {
    if (!newDeviceName) {
      setError("Please enter a device name.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/adddevice", {
        device_name: newDeviceName
      });

      if (response.status === 200) {
        const newDevice = {
          device_id: response.data.device_id,
          device_name: newDeviceName
        };
        setDevices([...devices, newDevice]);
        setNewDeviceName('');
        setShowNewDeviceModal(false);
        setError('');
      }
    } catch (err) {
      console.error("Error adding device:", err);
      setError(err.response?.data?.error || "Failed to add device. Please try again.");
    }
  };
  const handleRemoveDevice = (index) => {
    const updatedDevices = batchDevices.filter((_, i) => i !== index);
    setBatchDevices(updatedDevices);
  };

  const resetForm = () => {
    setDistrict("");
    setSchoolCode("");
    setSchoolName("");
    setSendDate("");
    setBatchDevices([]);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!sendDate || !district || !schoolCode || !schoolName) {
      setError("All fields are required.");
      return;
    }

    if (batchDevices.length === 0 || batchDevices.some(device => !device.deviceType || !device.serialNumber)) {
      setError("All device information must be completed.");
      return;
    }

    const newBatch = {
      batchNumber,
      sendDate,
      district,
      schoolCode,
      schoolName,
      devices: batchDevices,
    };

    try {
      const response = await axios.post("http://localhost:8080/createbatch", newBatch);
      if (response.status === 200 || response.status === 201) {
        // Reset form fields after successful submission
        resetForm();
        
        // Get the next batch number
        const nextBatchResponse = await axios.get("http://localhost:8080/nextBatchNumber");
        setBatchNumber(nextBatchResponse.data.nextBatchNumber);
        
        // Optional: Show success message
        setError("Batch created successfully!");
        setTimeout(() => setError(""), 3000); // Clear success message after 3 seconds
      } else {
        setError("Failed to create batch. Please try again.");
      }
    } catch (err) {
      console.error("Error creating batch:", err);
      setError(
        err.response?.data?.error ||
        "An error occurred while creating the batch. Please try again."
      );
    }
  };

  return (
    <div>
      <h2>Create New Batch</h2>
      <Form onSubmit={handleSubmit}>
        {/* Existing form groups... */}
        <Form.Group controlId="district">
          <Form.Label>District</Form.Label>
          <Form.Control
            as="select"
            value={district}
            onChange={handleDistrictChange}
          >
            <option value="">Select District</option>
            <option value="1">District 1</option>
            <option value="2">District 2</option>
            <option value="3">District 3</option>
            <option value="4">District 4</option>
            <option value="5">District 5</option>
            <option value="6">District 6</option>
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="school">
          <Form.Label>School</Form.Label>
          <Form.Control
            as="select"
            value={schoolCode}
            onChange={handleSchoolChange}
            disabled={!district}
          >
            <option value="">Select School</option>
            {Array.isArray(schools) && schools.map((school) => (
              <option key={school.schoolCode} value={school.schoolCode}>
                {school.school}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="sendDate">
          <Form.Label>Send Date</Form.Label>
          <Form.Control
            type="date"
            value={sendDate}
            onChange={(e) => setSendDate(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="batchNumber">
          <Form.Label>Batch Number</Form.Label>
          <Form.Control
            type="text"
            value={batchNumber}
            disabled
          />
        </Form.Group>

        {/* New device section */}
        <div className="mt-4">
          <h4>Devices</h4>
          <Button variant="secondary" onClick={handleAddDevice} className="mb-3">
            Add Device
          </Button>

          {batchDevices.map((device, index) => (
            <Row key={index} className="mb-3">
              <Col md={5}>
                <Form.Control
                  as="select"
                  value={device.deviceType}
                  onChange={(e) => handleDeviceChange(index, "deviceType", e.target.value)}
                >
                  <option value="">Select Device Type</option>
                  {devices.length > 0 ? (
                    devices.map((device, index) => (
                      <option key={index} value={device.device_name}>
                        {device.device_name}
                      </option>
                    ))
                  ) : (
                    <option>No devices available</option>
                  )}
                  <option value="new">+ Add New Device Type</option>
                </Form.Control>
              </Col>
              <Col md={5}>
                <Form.Control
                  type="text"
                  placeholder="Serial Number"
                  value={device.serialNumber}
                  onChange={(e) => handleDeviceChange(index, "serialNumber", e.target.value)}
                />
              </Col>
              <Col md={2}>
                <Button variant="danger" onClick={() => handleRemoveDevice(index)}>
                  Remove
                </Button>
              </Col>
            </Row>
          ))}
        </div>

        {error && <div className="text-danger mt-3">{error}</div>}

        <Button variant="primary" type="submit" className="mt-3">
          Save Batch
        </Button>

        {/* Modal for adding new device type */}
        <Modal show={showNewDeviceModal} onHide={() => setShowNewDeviceModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Device Type</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Device Name</Form.Label>
              <Form.Control
                type="text"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                placeholder="Enter device name"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowNewDeviceModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddNewDeviceType}>
              Add Device Type
            </Button>
          </Modal.Footer>
        </Modal>
      </Form>
    </div>
  );
};

export default CreateBatch;