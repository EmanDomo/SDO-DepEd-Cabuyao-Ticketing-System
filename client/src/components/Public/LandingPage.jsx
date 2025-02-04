import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import "../../styles/LandingPage.css";
import Logo from "../../Assets/SDO_Logo.png";
import Footer from "./Footer";

const LandingPage = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <div>
        <Navbar bg="light" data-bs-theme="light" expand="lg" fixed="top">
          <Container>
            <Navbar.Brand href="#home">
              <img alt="Logo" src={Logo} className="Logo me-2" />
              Deped Ticketing System
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="#home">Home</Nav.Link>
                <Nav.Link href="#features">About</Nav.Link>
                <Nav.Link href="#pricing">Contact Us</Nav.Link>
              </Nav>
              <div className="ms-auto">
                <NavDropdown
                  id="nav-dropdown-dark-example"
                  title="Login"
                  menuVariant="dark"
                >
                  <NavDropdown.Item href="/adminlogin" className="text-center">
                    Admin
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/schoollogin" className="text-center">
                    School
                  </NavDropdown.Item>
                </NavDropdown>
              </div>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </div>

      <div className="maincontent mx-2">
        {/* sddsdsf */}
        <iframe
          width="100%"
          height="500"
          src="https://www.youtube.com/embed/sbTiHMIbFKc"  // Replace VIDEO_ID with your actual video ID
          title="YouTube video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      <div>
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
