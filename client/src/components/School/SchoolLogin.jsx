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
      <div className="schoolLogin mx-auto">
        <div className="schoolLogo text-center justify-content-center mx-auto">
          <h6 className="pt-3 text-light">School Login</h6>
          <img alt="Logo" src={Logo} className="Logo-School-login mt-2" />
        </div>
        <div className="schoolInput p-2 mt-3">
          <Form ref={formRef} onSubmit={handleLogin}>
            <InputGroup className="mb-5">
              <InputGroup.Text id="basic-addon1" className="schoolIcon">
                <LuUser className="fs-4" />
              </InputGroup.Text>
              <Form.Control
                name="username" // Make sure to add the 'name' attribute
                placeholder="Username or School ID"
                aria-label="Username"
                aria-describedby="basic-addon1"
                className="schoolInput-username"
              />
              <InputGroup.Text id="basic-addon1" className="schoolIconhidden">
                @
              </InputGroup.Text>
            </InputGroup>

            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon1" className="schoolIcon">
                <GoLock className="fs-4" />
              </InputGroup.Text>
              <Form.Control
                name="password" // Ensure the password field has a 'name' as well
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                aria-label="Password"
                aria-describedby="basic-addon1"
                className="schoolInput-password"
                required
              />
              <InputGroup.Text
                className="schoolIcon m-0"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <IoEyeOutline  className="fs-5" />
                ) : (
                  <FaRegEyeSlash className="fs-5" />
                )}
              </InputGroup.Text>
            </InputGroup>
          </Form>
        </div>
        <div className="schoolBtn mx-auto text-center justify-content-center mx-auto">
          <Button
            variant="dark"
            className="schoolLoginBtn"
            onClick={handleLogin}
          >
            Login
          </Button>
        </div>
      </div>
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
    </div>
  );
};

export default SchoolLogin;
