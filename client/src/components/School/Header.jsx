import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";
import Badge from "react-bootstrap/Badge";
import { Offcanvas } from "react-bootstrap";
import { useWindowSize } from "react-use";
import SidebarLogo from "../../Assets/sidebar-logo.png";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { LuTickets } from "react-icons/lu";
import { MdOutlineEmail } from "react-icons/md";
import { FiUnlock } from "react-icons/fi";

const Navbar = () => {
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);
  const { logout } = useAuth();

  const { width } = useWindowSize();

  const [showSidebar, setShowSidebar] = useState(false);

  // Ref for the Offcanvas content
  const offcanvasContentRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/forbidden");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setSchool(decoded.school);
      setUsername(decoded.username);
      setRole(decoded.role);
    } catch (error) {
      console.error("Invalid token:", error);
      navigate("/forbidden");
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleToggleOffcanvas = () => {
    setShowSidebar(!showSidebar);
  };

  // Close the sidebar if click is outside the sidebar on small screens
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        offcanvasContentRef.current &&
        !offcanvasContentRef.current.contains(event.target)
      ) {
        setShowSidebar(false);
      }
    };

    if (width < 768 && showSidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSidebar, width]);

  const navigateToCreateTicket = () => {
    navigate("/createticket");
  };


  return (
    <div className="p-3 m-0 border-0 bd-example m-0 border-0">
      {/* Sidebar on large screens */}
      {width >= 768 && (
        <div
          className="sidebar d-flex flex-column position-fixed"
          style={{
            top: "0",
            left: "0",
            width: "250px",
            height: "100vh",
            padding: "15px",
            color: "#294a70",
            zIndex: 1000,
            boxShadow: "4px 0 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div>
            <h5>SDO Cabuyao</h5>
          </div>
          <div className="my-3">
            <img
              alt="Logo"
              src={SidebarLogo}
              className="schoolLogo mt-2"
              style={{ width: "100%", height: "40px" }}
            />
            <p className="text-secondary text-center mt-2 fs-6 mt-2">
              Deped Ticketing System
            </p>
          </div>
          <div>
            <table style={{ width: "100%" }}>
              <thead>
                <tr><th></th><th></th></tr>
              </thead>
              <tbody>
                <tr style={{ height: "50px" }}>
                  <td>
                    <MdOutlineSpaceDashboard className="fs-5 text-dark" />
                  </td>
                  <td>
                    <a href="/schooldashboard" className="text-dark" style={{ textDecoration: "none" }}>
                      Dashboard
                    </a>
                  </td>
                </tr>
                <tr style={{ height: "50px" }}>
                  <td>
                    <LuTickets className="fs-5 text-dark" />
                  </td>
                  <td>
                    <a href="/ticket" className="text-dark" style={{ textDecoration: "none" }}>
                      Ticket Request
                    </a>
                  </td>
                </tr>
                <tr style={{ height: "50px" }}>
                  <td>
                    <MdOutlineEmail className="fs-5 text-dark" />
                  </td>
                  <td>
                    <a href="/createticket" className="text-dark" style={{ textDecoration: "none" }}>
                      Email Request
                    </a>
                  </td>
                </tr>
                <tr style={{ height: "50px" }}>
                  <td>
                    <FiUnlock className="fs-5 text-dark" />
                  </td>
                  <td>
                    <a href="#" className="text-dark" style={{ textDecoration: "none" }}>
                      IDAS Reset Password
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <button
              className="btn btn-dark"
              onClick={handleLogout}
              style={{ width: "100%", backgroundColor: "#294a70", marginTop: "130%" }}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav
        className="navbar navbar-dark fixed-top"
        style={{
          backgroundColor: "#294a70",
          marginLeft: width >= 768 ? "250px" : "0",
          zIndex: 500,
        }}
      >
        <div className="container-fluid d-flex flex-row">
          <a className="navbar-brand ps-lg-3 ps-sm-0" href="#">
            <b className="d-none d-lg-inline">{school}</b>{" "}
            <span className="fs-6 ms-lg-4 ms-0 d-lg-inline">
              <i>School ID: {username}</i>
              <Badge bg="light" className="ms-3" style={{ color: "#294a70" }}>
                {role}
              </Badge>
            </span>
          </a>
          <button
            className="navbar-toggler d-lg-none"
            type="button"
            onClick={handleToggleOffcanvas}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
      </nav>

      {/* Sidebar (Offcanvas) for small screens */}
      <Offcanvas
        show={showSidebar && width < 768}
        onHide={() => setShowSidebar(false)}
        placement="start"
        backdrop={false}
        style={{ width: "75%", boxShadow: "4px 0 8px rgba(0, 0, 0, 0.1)", border: "none" }}
      >
        <Offcanvas.Body ref={offcanvasContentRef}>
          <div>
            <h5>SDO Cabuyao</h5>
          </div>
          <div className="my-3">
            <img
              alt="Logo"
              src={SidebarLogo}
              className="schoolLogo mt-2"
              style={{ width: "100%", height: "40px" }}
            />
            <p className="text-secondary text-center mt-2 fs-6 mt-2">
              Deped Ticketing System
            </p>
          </div>
          <div>
            <table style={{ width: "100%" }}>
              <thead>
                <tr><th></th><th></th></tr>
              </thead>
              <tbody>
                <tr style={{ height: "50px" }}>
                  <td>
                    <MdOutlineSpaceDashboard className="fs-5 text-dark" />
                  </td>
                  <td>
                    <a href="#" className="text-dark" style={{ textDecoration: "none" }}>
                      Dashboard
                    </a>
                  </td>
                </tr>
                <tr style={{ height: "50px" }}>
                  <td>
                    <LuTickets className="fs-5 text-dark" />
                  </td>
                  <td>
                    <a href="#" className="text-dark" style={{ textDecoration: "none" }}>
                      Ticket Request
                    </a>
                  </td>
                </tr>
                <tr style={{ height: "50px" }}>
                  <td>
                    <MdOutlineEmail className="fs-5 text-dark" />
                  </td>
                  <td>
                    <a href="#" className="text-dark" style={{ textDecoration: "none" }}>
                      Email Request
                    </a>
                  </td>
                </tr>
                <tr style={{ height: "50px" }}>
                  <td>
                    <FiUnlock className="fs-5 text-dark" />
                  </td>
                  <td>
                    <a href="#" className="text-dark" style={{ textDecoration: "none" }}>
                      IDAS Reset Password
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <button
              className="btn btn-dark"
              onClick={handleLogout}
              style={{ width: "100%", backgroundColor: "#294a70", marginTop: "40vh" }}
            >
              Logout
            </button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default Navbar;