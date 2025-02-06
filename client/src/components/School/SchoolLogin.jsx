import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from "jwt-decode";
import Logo from "../../Assets/SDO_Logo1.png";
import "../../styles/SchoolLogin.css";
import InputGroup from "react-bootstrap/InputGroup";
import { LuUser } from "react-icons/lu";
import { GoLock } from "react-icons/go";
import { IoEyeOutline } from "react-icons/io5";
import { FaRegEyeSlash } from "react-icons/fa";
import { useAuth } from "../Context/AuthContext";

const SchoolLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [showModal, setShowModal] = useState(false);
  const [retryAfter, setRetryAfter] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    let timer;
    if (retryAfter !== null) {
      setCountdown(retryAfter);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev > 1) return prev - 1;
          clearInterval(timer);
          setRetryAfter(null);
          setRemainingAttempts(3);
          return 0;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [retryAfter]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const username = formRef.current.username.value;
    const password = formRef.current.password.value;

    try {
      const response = await fetch("http://localhost:8080/schoollogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);

        const decodedUser = jwtDecode(data.token);
        localStorage.setItem("user", JSON.stringify(decodedUser));

        // Correct usage of data here
        login(data.token);

        navigate("/schooldashboard");
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message);

        if (errorData.retryAfter) {
          setRetryAfter(errorData.retryAfter);
        }

        if (errorData.remainingAttempts !== undefined) {
          setRemainingAttempts(errorData.remainingAttempts);
        }

        setShowModal(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      setShowModal(true);
    }
  };

  return (
    <div className="schoolLoginMain" id="school">
      <Card className="schoolLogin mx-auto">
        <Card.Header className="schoolHeader d-flex justify-content-center align-items-center">
          <div className="text-center">
            <h6 className="mb-4 text-light school-title">School Login</h6>
            <img alt="Logo" src={Logo} className="schoolLogo mt-2" />
          </div>
        </Card.Header>

        <Card.Body className="schoolInput pt-5">
          <Form ref={formRef} onSubmit={handleLogin}>
            <InputGroup className="mb-5 schoolUsernameGroup">
              <InputGroup.Text id="basic-addon1" className="schoolIcon">
                <LuUser className="fs-4" />
              </InputGroup.Text>
              <Form.Control
                name="username" // Make sure to add the 'name' attribute
                placeholder="Username or School ID"
                aria-label="Username"
                aria-describedby="basic-addon1"
                className="schoolUsername"
              />
              <InputGroup.Text id="basic-addon1" className="schoolIconhidden">
                @
              </InputGroup.Text>
            </InputGroup>

            <InputGroup className="mb-3 schoolPasswordGroup">
              <InputGroup.Text id="basic-addon1" className="schoolIcon">
                <GoLock className="fs-4" />
              </InputGroup.Text>
              <Form.Control
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                aria-label="Password"
                aria-describedby="basic-addon1"
                className="schoolPassword"
                required
              />
              <InputGroup.Text
                className="schoolIcon m-0"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <IoEyeOutline className="fs-5" />
                ) : (
                  <FaRegEyeSlash className="fs-5" />
                )}
              </InputGroup.Text>
            </InputGroup>
          </Form>
        </Card.Body>

        <Card.Footer className="schoolBtn d-flex justify-content-center mb-3">
          <Button
            variant="dark"
            className="schoolLoginBtn"
            onClick={handleLogin}
          >
            Login
          </Button>
        </Card.Footer>
      </Card>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Login Error</h4>
            </div>
            <div className="modal-body">
              <p>{errorMessage}</p>
              {remainingAttempts !== null &&
                remainingAttempts > 0 &&
                retryAfter === null && (
                  <p>You have {remainingAttempts} attempt(s) left.</p>
                )}
              {retryAfter !== null && countdown > 0 && (
                <p>
                  You can try again in <strong>{countdown}</strong> seconds.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      <svg
        width="100%"
        height="400"
        id="svg"
        viewBox="0 0 1440 490"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="svgg transition duration-300 ease-in-out delay-150"
      >
        <path
          d="M 0,500 L 0,187 C 74.58373205741626,158.46411483253587 149.1674641148325,129.92822966507177 247,121 C 344.8325358851675,112.07177033492823 465.9138755980862,122.7511961722488 560,142 C 654.0861244019138,161.2488038277512 721.1770334928229,189.06698564593302 828,193 C 934.8229665071771,196.93301435406698 1081.377990430622,176.98086124401914 1190,172 C 1298.622009569378,167.01913875598086 1369.311004784689,177.00956937799043 1440,187 L 1440,500 L 0,500 Z"
          stroke="none"
          strokeWidth="0"
          fill="#294a70"
          fillOpacity="1"
          className="transition-all duration-300 ease-in-out delay-150 path-0"
        ></path>
      </svg>
    </div>
  );
};

export default SchoolLogin;
