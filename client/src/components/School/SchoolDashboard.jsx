import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";
import Nav from "./Header";
import { useWindowSize } from "react-use"; // Import this hook to get the window size
import SidebarLogo from "../../Assets/sidebar-logo.png";
import Card from "react-bootstrap/Card";
import { MdOutlineDownloading} from "react-icons/md"; // New icons for different statuses
import "../../styles/SchoolDashboard.css";
import { FaRegCheckCircle } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { MdOutlinePending } from "react-icons/md";
import { FaRegPauseCircle } from "react-icons/fa";

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const { logout } = useAuth();
  const { width } = useWindowSize(); 

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/forbidden");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setSchool(decoded.school);
    } catch (error) {
      console.error("Invalid token:", error);
      navigate("/forbidden");
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleCompletedTicket = () => {
    navigate("/completedticket");
  };

  const handleCardClick = (status) => {
    switch (status) {
      case "Pending":
        navigate("/pendingticket");
        break;
      case "Completed":
        navigate("/completedticket");
        break;
      case "Rejected":
        navigate("/rejectedticket");
        break;
      case "In Progress":
        navigate("/inprogressticket");
        break;
      case "On Hold":
        navigate("/onholdticket");
        break;
      default:
        break;
    }
  };

  const statusData = [
    { text: "Pending", color: "text-warning", icon: <MdOutlinePending style={{ fontSize: "70px", color: "#294a70" }} /> },
    { text: "Completed", color: "text-success", icon: <FaRegCheckCircle style={{ fontSize: "70px", color: "#294a70" }} /> },
    { text: "Rejected", color: "text-danger", icon: <MdOutlineCancel style={{ fontSize: "70px", color: "#294a70" }} /> },
    { text: "In Progress", color: "text-primary", icon: <MdOutlineDownloading style={{ fontSize: "70px", color: "#294a70" }} /> },
    { text: "On Hold", color: "text-secondary", icon: <FaRegPauseCircle style={{ fontSize: "70px", color: "#294a70" }} /> },
  ];


  return (
    <div
      style={{
        marginLeft: width >= 768 ? "250px" : "0", // Space for sidebar on large screens
        marginTop: "30px", // Push content below the navbar (standard height for Bootstrap navbar)
        padding: "20px", // Optional: add padding for better spacing
      }}
    >
      <Nav />
      {school ? (
        <>
          <div className="mb-5 mt-3">
            <h3 style={{ color: "#294a70" }}>Dashboard</h3>
            {/* <img
              alt="Logo"
              src={SidebarLogo}
              className="schoolLogo m-auto mb-5"
              style={{ width: "60%", height: "100px" }}
            /> */}
          </div>

          {/* Row to display cards */}
          <div className="row">
            {statusData.map((status, index) => (
              <div key={index} className="col-12 col-sm-6 col-md-3 mb-3">
                {/* col-sm-6 for 2 cards per row on small screens, col-md-3 for 4 cards per row on medium and larger screens */}
                <Card
                  className="mb-3"
                  style={{
                    width: "100%",
                    border: "none",
                    boxShadow: "2px 2px 10px 2px rgba(0, 0, 0, 0.15)",
                    cursor: "pointer",
                  }}
                  onClick={() => handleCardClick(status.text)}           >
                  <Card.Body>
                    <div className="row">
                      <div className="col-8">
                        <div>
                          <h1>24</h1>
                        </div>
                        <div>
                          <b>
                            <span className={status.color}>{status.text}</span>
                          </b>{" "}
                          <span className="text-secondary">Ticket</span>
                        </div>
                      </div>
                      <div
                        className="iconD col-4 d-flex justify-content-center align-items-center m-0"
                        style={{
                          borderRadius: "80px",
                          width: "80px",
                          backgroundColor: "#3b4daf15",
                        }}
                      >
                        {status.icon}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default SchoolDashboard;
